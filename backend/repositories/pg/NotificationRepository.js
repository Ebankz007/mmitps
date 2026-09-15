// backend/repositories/pg/NotificationRepository.js — notifications (System)
const BaseRepository = require('./BaseRepository');
const { db, pool } = require('../../../db');
const { and, eq, lt, isNotNull } = require('drizzle-orm');
const { notifications } = require('../../../db/schema/system');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(notifications);
  }

  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: '-createdAt', ...options });
  }

  async markRead(id) {
    return this.update(id, { read: true, readAt: new Date() });
  }

  async markAllRead(userId) {
    const res = await db
      .update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .returning({ id: notifications.id });
    return res.length;
  }

  /** Delete notifications past their expiry (node-cron TTL job). */
  async deleteExpired(now = new Date()) {
    const res = await db
      .delete(notifications)
      .where(and(isNotNull(notifications.expiresAt), lt(notifications.expiresAt, now)))
      .returning({ id: notifications.id });
    return res.length;
  }
}

module.exports = new NotificationRepository();