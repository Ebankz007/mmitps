// backend/repositories/pg/SupportTicketRepository.js — support_tickets (Support)
// messages/internalNotes live as JSONB arrays — read-modify-write inside a
// transaction for addMessage (the pg answer to Mongo $push).
const BaseRepository = require('./BaseRepository');
const { db, pool } = require('../../../db');
const { eq, and, sql } = require('drizzle-orm');
const { supportTickets } = require('../../../db/schema/support');
const { users } = require('../../../db/schema/core');

class SupportTicketRepository extends BaseRepository {
  constructor() {
    super(supportTickets, {
      relations: {
        user: { table: users, on: eq(supportTickets.userId, users.id) },
        assignedTo: { table: users, on: eq(supportTickets.assignedToId, users.id) },
      },
    });
  }

  async findByUser(userId) {
    return this.findAll({ userId }, { populate: 'assignedTo', sort: '-updatedAt' });
  }

  /** Open/in-progress tickets, high priority first then oldest. */
  async findOpen() {
    return this.findAll(
      { status: { $in: ['open', 'in_progress', 'waiting_customer', 'waiting_internal'] } },
      { populate: 'user', sort: 'priority,-createdAt' }
    );
  }

  /** Append a message (JSONB array) + status update — transactional. */
  async addMessage(ticketId, messageData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `SELECT messages FROM support_tickets WHERE id = $1 FOR UPDATE`,
        [ticketId]
      );
      if (!res.rows.length) { await client.query('ROLLBACK'); return null; }
      // BaseRepository writes are double-encoded (string in jsonb) — Drizzle
      // un-wraps on read; raw SQL sees the intermediate string. DB-default
      // rows (clean jsonb) come back as real arrays. Handle both.
      const rawMessages = res.rows[0].messages;
      const messages = typeof rawMessages === 'string' ? JSON.parse(rawMessages || '[]') : (rawMessages || []);
      messages.push(messageData);
      const status = messageData.senderType === 'user' ? 'open' : 'waiting_customer';
      const updated = await client.query(
        `UPDATE support_tickets
         SET messages = $2::jsonb, status = $3, updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [ticketId, JSON.stringify(messages), status]
      );
      await client.query('COMMIT');
      return this._transform(updated.rows, 'user,assignedTo')[0] || null;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /** Append an internal note (JSONB array). */
  async addInternalNote(ticketId, noteData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `SELECT internal_notes FROM support_tickets WHERE id = $1 FOR UPDATE`,
        [ticketId]
      );
      if (!res.rows.length) { await client.query('ROLLBACK'); return null; }
      const rawNotes = res.rows[0].internal_notes;
      const notes = typeof rawNotes === 'string' ? JSON.parse(rawNotes || '[]') : (rawNotes || []);
      notes.push(noteData);
      const updated = await client.query(
        `UPDATE support_tickets SET internal_notes = $2::jsonb, updated_at = now() WHERE id = $1 RETURNING *`,
        [ticketId, JSON.stringify(notes)]
      );
      await client.query('COMMIT');
      return this._transform(updated.rows, 'user,assignedTo')[0] || null;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /** Status transition with resolvedAt/closedAt bookkeeping. */
  async updateStatus(ticketId, status) {
    const update = { status };
    if (status === 'resolved') update.resolvedAt = new Date();
    if (status === 'closed') update.closedAt = new Date();
    return this.update(ticketId, update);
  }
}

module.exports = new SupportTicketRepository();