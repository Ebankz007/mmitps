// db/port-phase4.js — port MLM domain data: Mongo → PostgreSQL
// Orphan principle: skip + log user-referenced docs whose users exist nowhere.
// Portable: 6 ranks, 7 tree nodes (testuser1-7 chain), 23 commissions.
// Skipped: 27 phantom tree nodes, 15 phantom commissions, 1 phantom rank history.
const { MongoClient } = require('mongodb');
const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

const oidToUuid = (oid) => `00000000-${oid.slice(0, 4)}-${oid.slice(4, 8)}-${oid.slice(8, 12)}-${oid.slice(12)}`;
const uuidToLtree = (uuid) => uuid.replace(/-/g, ''); // ltree labels cannot contain hyphens
const asJson = (v) => (v === undefined || v === null ? null : JSON.stringify(v));
const asNum = (v) => (v === undefined || v === null ? null : Number(v));

const orphans = [];
const logOrphan = (collection, docId, reason) => {
  orphans.push({ collection, docId, reason });
};

(async () => {
  const c = new MongoClient('mongodb://127.0.0.1:27017');
  await c.connect();
  const db = c.db('mmitps');

  // Real user set (Mongo) — the source of truth for "exists"
  const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
  const userIds = new Set(users.map((u) => String(u._id)));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE mlm_rank_histories, mlm_volume_histories, mlm_tree_nodes, mlm_commissions, mlm_ranks RESTART IDENTITY CASCADE');

    // ─── mlm_ranks (no user refs) ───────────────────────────────────────
    const ranks = await db.collection('mlmranks').find({}).toArray();
    let rCount = 0;
    for (const d of ranks) {
      await client.query(
        `INSERT INTO mlm_ranks (id, name, level, requirements, benefits, badge, color, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          oidToUuid(d._id.toString()), d.name, d.level,
          asJson(d.requirements), asJson(d.benefits),
          d.badge || null, d.color || null,
          d.isActive !== false, d.createdAt || new Date(), d.updatedAt || new Date(),
        ]
      );
      rCount++;
    }

    // ─── mlm_tree_nodes (7 real: left-only chain testuser1→testuser7) ──
    const allNodes = await db.collection('mlmtreenodes').find({}).toArray();
    const realNodes = allNodes.filter((n) => userIds.has(String(n.user)));
    const phantomNodes = allNodes.filter((n) => !userIds.has(String(n.user)));

    // nodeId → userId (UUID) map for parent/leftChild/rightChild resolution
    const nodeUserUuid = new Map();
    for (const n of realNodes) nodeUserUuid.set(String(n._id), oidToUuid(n.user.toString()));

    let tCount = 0;
    for (const n of realNodes) {
      const userIdUuid = oidToUuid(n.user.toString());
      const sponsorUuid = n.sponsor ? oidToUuid(n.sponsor.toString()) : null;
      const parentUuid = n.parent ? nodeUserUuid.get(String(n.parent)) || null : null;
      const leftChildUuid = n.leftChild ? nodeUserUuid.get(String(n.leftChild)) || null : null;
      const rightChildUuid = n.rightChild ? nodeUserUuid.get(String(n.rightChild)) || null : null;

      // path: Mongo labels are user ObjectIds → UUID → hyphen-stripped ltree labels
      const pathLtree = (n.path || '')
        .split('.')
        .filter(Boolean)
        .map((seg) => uuidToLtree(oidToUuid(seg)))
        .join('.');

      await client.query(
        `INSERT INTO mlm_tree_nodes
         (id, user_id, sponsor_id, parent_id, position, left_child_id, right_child_id, depth, path,
          ancestors, left_descendant_count, right_descendant_count,
          left_leg_volume, right_leg_volume, left_leg_volume_this_period, right_leg_volume_this_period,
          personal_volume, personal_volume_this_period, group_volume, rank, is_active,
          preferred_placement, qualification_status, last_activity_date, join_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
        [
          oidToUuid(n._id.toString()), userIdUuid, sponsorUuid, parentUuid,
          n.position || null, leftChildUuid, rightChildUuid,
          asNum(n.depth) ?? 0, pathLtree,
          n.ancestors && n.ancestors.length
            ? `{${n.ancestors.map((a) => oidToUuid(a.toString())).join(',')}}`
            : '{}',
          asNum(n.leftDescendantCount) ?? 0, asNum(n.rightDescendantCount) ?? 0,
          asNum(n.leftLegVolume) ?? 0, asNum(n.rightLegVolume) ?? 0,
          asNum(n.leftLegVolumeThisPeriod) ?? 0, asNum(n.rightLegVolumeThisPeriod) ?? 0,
          asNum(n.personalVolume) ?? 0, asNum(n.personalVolumeThisPeriod) ?? 0,
          asNum(n.groupVolume) ?? 0, n.rank || 'Starter', n.isActive !== false,
          n.preferredPlacement || 'left', n.qualificationStatus || 'not_qualified',
          n.lastActivityDate ? new Date(n.lastActivityDate) : null,
          n.joinDate ? new Date(n.joinDate) : new Date(),
          n.createdAt || new Date(), n.updatedAt || new Date(),
        ]
      );
      tCount++;
    }

    for (const n of phantomNodes) {
      logOrphan('mlmtreenodes', n._id.toString(), `phantom user ref user=${n.user.toString()}`);
    }

    // ─── mlm_commissions (23 real, all direct_referral) ─────────────────
    const allComms = await db.collection('mlmcommissions').find({}).toArray();
    const realComms = allComms.filter((d) => userIds.has(String(d.user)));
    let cmCount = 0;
    for (const d of realComms) {
      await client.query(
        `INSERT INTO mlm_commissions
         (id, user_id, type, amount, currency, status, unlocks_at_tier_level, is_used_for_upgrade,
          description, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          oidToUuid(d._id.toString()), oidToUuid(d.user.toString()), d.type,
          asNum(d.amount), d.currency || 'USD', d.status || 'pending',
          asNum(d.unlocksAtTierLevel), d.isUsedForUpgrade === true,
          d.description || null, d.createdAt || new Date(), d.updatedAt || new Date(),
        ]
      );
      cmCount++;
    }

    for (const d of allComms.filter((x) => !userIds.has(String(x.user)))) {
      logOrphan('mlmcommissions', d._id.toString(), `phantom user ref user=${d.user.toString()}`);
    }

    // ─── mlm_volume_histories: 0 docs ───────────────────────────────────
    // ─── mlm_rank_histories: 1 doc, phantom user → skip ─────────────────
    const rh = await db.collection('mlmrankhistories').find({}).toArray();
    for (const d of rh) {
      if (!userIds.has(String(d.user))) {
        logOrphan('mlmrankhistories', d._id.toString(), `phantom user ref user=${d.user.toString()}`);
      }
    }

    await client.query('COMMIT');
    console.log(`Ported: mlm_ranks ${rCount}/${ranks.length}, mlm_tree_nodes ${tCount}/${allNodes.length} (${phantomNodes.length} phantom skipped), mlm_commissions ${cmCount}/${allComms.length}, volume_histories 0, rank_histories 0/${rh.length}`);
    console.log(`Orphans logged: ${orphans.length}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  fs.writeFileSync(path.join(__dirname, 'port-log-phase4.json'), JSON.stringify({ orphans }, null, 2));
  console.log('Orphan log → db/port-log-phase4.json');

  await c.close();
  await pool.end();
})().catch((e) => { console.error('PORT FAILED:', e.message); process.exit(1); });