/**
 * PostgreSQL Base Repository (Drizzle ORM)
 * Drop-in replacement for the MongoDB BaseRepository — same method names,
 * same return shapes (camelCase keys, { results, pagination } for paginate).
 *
 * Differences from the Mongo version:
 *  - Filters use camelCase keys (emailVerified) and are mapped to snake_case columns
 *  - Supports Mongo-style operators: $in, $ne, $gt, $gte, $lt, $lte, $or, $regex, $exists
 *  - populate() performs LEFT JOINs via the `relations` option
 *  - create/update auto-set updated_at; create returns the row via RETURNING
 *
 * Usage:
 *   const users = require('../../db/schema').users; // or individual table
 *   new BaseRepository(users, { defaultExclude: ['password'], relations: {...} });
 */
const { db } = require('../../../db');
const {
  eq, and, or, inArray, notInArray, ne, gt, gte, lt, lte,
  isNull, isNotNull, ilike, desc, asc, count, sql,
} = require('drizzle-orm');

// ─── Helpers ───────────────────────────────────────────────────────────

/** Build camelCase → column map from a Drizzle table object. */
function buildFieldMap(table) {
  const map = {};
  for (const [key, col] of Object.entries(table)) {
    if (col && typeof col === 'object' && typeof col.name === 'string' && col.dataType) {
      map[key] = col;
    }
  }
  return map;
}

/** snake_case → camelCase (top-level only; JSONB bodies preserved verbatim). */
function toCamelRow(row, jsonbCols) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (v && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v) && !jsonbCols.has(k)) {
      out[camel] = toCamelRow(v, jsonbCols); // populated relation
    } else {
      out[camel] = v;
    }
  }
  return out;
}

/** Convert Mongo-style filters to Drizzle conditions. */
function buildConditions(filters, fieldMap) {
  const conds = [];
  for (const [key, value] of Object.entries(filters)) {
    if (key === '$or' && Array.isArray(value)) {
      const branches = value.map((sub) => and(...buildConditions(sub, fieldMap)));
      conds.push(or(...branches));
      continue;
    }
    const col = fieldMap[key];
    if (!col) continue; // unknown field — ignore (matches Mongo's lenient behavior)

    if (value && typeof value === 'object' && !(value instanceof Date)) {
      for (const [op, v] of Object.entries(value)) {
        switch (op) {
          case '$in': conds.push(inArray(col, v)); break;
          case '$nin': conds.push(notInArray(col, v)); break;
          case '$ne': conds.push(ne(col, v)); break;
          case '$gt': conds.push(gt(col, v)); break;
          case '$gte': conds.push(gte(col, v)); break;
          case '$lt': conds.push(lt(col, v)); break;
          case '$lte': conds.push(lte(col, v)); break;
          case '$exists': conds.push(v ? isNotNull(col) : isNull(col)); break;
          case '$regex': conds.push(ilike(col, `%${v}%`)); break; // case-insensitive contains
          case '$ltree': conds.push(sql`${col} <@ ${v}::ltree`); break; // ltree descendant-of (downline)
          default: break;
        }
      }
    } else {
      conds.push(eq(col, value));
    }
  }
  return conds;
}

/** Build select object: undefined = all columns, '-password' = exclude, 'email,username' = include. */
function buildSelect(fieldMap, selectStr) {
  if (!selectStr) return undefined;
  const entries = Object.entries(fieldMap);
  if (selectStr.startsWith('-')) {
    const excluded = selectStr.slice(1).split(',').map((s) => s.trim());
    return Object.fromEntries(entries.filter(([key]) => !excluded.includes(key)));
  }
  const included = selectStr.split(',').map((s) => s.trim());
  return Object.fromEntries(entries.filter(([key]) => included.includes(key)));
}

/** Parse '-createdAt,email' sort strings into Drizzle order clauses. */
function buildOrderBy(fieldMap, sortStr) {
  if (!sortStr) return undefined;
  return sortStr.split(',').map((part) => {
    const s = part.trim();
    const dir = s.startsWith('-') ? 'desc' : 'asc';
    const col = fieldMap[s.replace(/^-/, '')];
    return col ? (dir === 'desc' ? desc(col) : asc(col)) : undefined;
  }).filter(Boolean);
}

// ─── BaseRepository ────────────────────────────────────────────────────

class BaseRepository {
  /**
   * @param {Object} table - Drizzle table definition
   * @param {Object} [options]
   * @param {String} [options.idColumn='id'] - Primary key column name
   * @param {String[]} [options.defaultExclude=[]] - Columns excluded from reads by default
   * @param {Object} [options.relations={}] - { name: { table, on } } for populate()
   */
  constructor(table, options = {}) {
    if (!table) throw new Error('Table is required for BaseRepository');
    this.table = table;
    this.db = db;
    this.idColumn = options.idColumn || 'id';
    this.defaultExclude = options.defaultExclude || [];
    this.relations = options.relations || {};
    this.fieldMap = buildFieldMap(table);
    this.jsonbCols = new Set(
      Object.values(this.fieldMap).filter((c) => c.dataType === 'json').map((c) => c.name)
    );
  }

  /** Build a full query (select + joins + where + order + limit/offset). */
  _buildQuery({ filters = {}, options = {} } = {}) {
    const { select, populate, sort, page, limit } = options;

    // '+password' (Mongo syntax) → include all fields, overriding defaultExclude
    const relNames = populate ? populate.split(',').map((s) => s.trim()).filter(Boolean) : [];
    let selectObj;
    if (select && select.startsWith('+')) {
      selectObj = Object.fromEntries(Object.entries(this.fieldMap));
    } else {
      selectObj = buildSelect(this.fieldMap, select) ||
        Object.fromEntries(
          Object.entries(this.fieldMap)
            .filter(([, col]) => !this.defaultExclude.includes(col.name))
        );
    }

    // Attach relation columns BEFORE db.select() — Drizzle snapshots the select object
    for (const name of relNames) {
      const rel = this.relations[name];
      if (!rel) continue;
      selectObj[name] = Object.fromEntries(Object.entries(buildFieldMap(rel.table)));
    }

    let query = db.select(selectObj).from(this.table);

    for (const name of relNames) {
      const rel = this.relations[name];
      if (!rel) continue;
      query = query.leftJoin(rel.table, rel.on);
    }

    const conds = buildConditions(filters, this.fieldMap);
    if (conds.length > 0) query = query.where(and(...conds));

    const orderBy = buildOrderBy(this.fieldMap, sort);
    if (orderBy) query = query.orderBy(...orderBy);

    if (limit) {
      const skip = ((page || 1) - 1) * limit;
      if (skip) query = query.offset(skip);
      query = query.limit(limit);
    }

    return query;
  }

  /** Transform raw rows: snake_case → camelCase; null populated relations → null. */
  _transform(rows, populate) {
    const relNames = populate ? populate.split(',').map((s) => s.trim()).filter(Boolean) : [];
    return rows.map((row) => {
      const camel = toCamelRow(row, this.jsonbCols);
      for (const name of relNames) {
        if (camel[name] && camel[name][this.relations[name]?.table[this.idColumn]?.name ?? 'id'] === null) {
          camel[name] = null;
        }
      }
      return camel;
    });
  }

  /**
   * Map write data to Drizzle-compatible keys.
   * IMPORTANT: keys must be the camelCase JS property names (e.g. resetPasswordToken),
   * NOT the snake_case DB column names. Drizzle resolves camelCase → snake_case
   * internally; passing snake_case keys silently drops every multi-word column
   * (values()/set() look up table[Symbol.Columns][key], which is camelCase-keyed).
   *
   * jsonb columns: object/array values are JSON.stringify'd here. The pg driver
   * serializes JS arrays as PG array literals ({...}), which is invalid JSON —
   * a jsonb column holding a JS array (e.g. wallets.balances) would otherwise
   * fail with "invalid input syntax for type json".
   */
  _mapWriteData(data) {
    const out = {};
    for (const [key, value] of Object.entries(data)) {
      const col = this.fieldMap[key];
      if (!col) continue;
      if (col.dataType === 'json' && value !== null && typeof value === 'object') {
        out[key] = JSON.stringify(value);
      } else if ((col.dataType === 'date' || col.dataType === 'timestamp') && typeof value === 'string') {
        out[key] = new Date(value);
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  async findAll(filters = {}, options = {}) {
    const query = this._buildQuery({ filters, options });
    const rows = await query;
    return this._transform(rows, options.populate);
  }

  async findById(id, options = {}) {
    const rows = await this.findAll({ [this.idColumn]: id }, { ...options, limit: 1 });
    return rows[0] ?? null;
  }

  async findOne(filters, options = {}) {
    const rows = await this.findAll(filters, { ...options, limit: 1 });
    return rows[0] ?? null;
  }

  async create(data) {
    const mapped = this._mapWriteData(data);
    const rows = await db.insert(this.table).values(mapped).returning();
    return this._transform(rows)[0];
  }

  async createMany(dataArray) {
    if (dataArray.length === 0) return [];
    const mapped = dataArray.map((d) => this._mapWriteData(d));
    const rows = await db.insert(this.table).values(mapped).returning();
    return this._transform(rows);
  }

  async update(id, data, options = {}) {
    const mapped = this._mapWriteData(data);
    mapped.updatedAt = new Date();
    const rows = await db.update(this.table)
      .set(mapped)
      .where(eq(this.table[this.idColumn], id))
      .returning();
    return this._transform(rows)[0] ?? null;
  }

  async updateOne(filters, data, options = {}) {
    const mapped = this._mapWriteData(data);
    mapped.updatedAt = new Date();
    const conds = buildConditions(filters, this.fieldMap);
    if (conds.length === 0) return null;
    const rows = await db.update(this.table)
      .set(mapped)
      .where(and(...conds))
      .returning();
    return this._transform(rows)[0] ?? null;
  }

  async updateMany(filters, data) {
    const mapped = this._mapWriteData(data);
    mapped.updatedAt = new Date();
    const conds = buildConditions(filters, this.fieldMap);
    if (conds.length === 0) return { modifiedCount: 0 };
    const result = await db.update(this.table).set(mapped).where(and(...conds));
    return { modifiedCount: result.rowCount ?? 0 };
  }

  async delete(id) {
    const rows = await db.delete(this.table)
      .where(eq(this.table[this.idColumn], id))
      .returning();
    return this._transform(rows)[0] ?? null;
  }

  async deleteOne(filters) {
    const conds = buildConditions(filters, this.fieldMap);
    if (conds.length === 0) return null;
    const rows = await db.delete(this.table).where(and(...conds)).returning();
    return this._transform(rows)[0] ?? null;
  }

  async deleteMany(filters) {
    const conds = buildConditions(filters, this.fieldMap);
    if (conds.length === 0) return { deletedCount: 0 };
    const result = await db.delete(this.table).where(and(...conds));
    return { deletedCount: result.rowCount ?? 0 };
  }

  async count(filters = {}) {
    const conds = buildConditions(filters, this.fieldMap);
    const rows = conds.length > 0
      ? await db.select({ n: count() }).from(this.table).where(and(...conds))
      : await db.select({ n: count() }).from(this.table);
    return rows[0]?.n ?? 0;
  }

  async exists(filters) {
    return (await this.count(filters)) > 0;
  }

  async paginate(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    const total = await this.count(filters);
    const query = this._buildQuery({ filters, options: { ...options, page, limit } });
    const rows = await query;
    const results = this._transform(rows, options.populate);
    return {
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}

module.exports = BaseRepository;