// backend/repositories/pg/ActivityLogRepository.js — activity_logs (System)
const BaseRepository = require('./BaseRepository');
const { activityLogs } = require('../../../db/schema/system');

class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(activityLogs);
  }

  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: '-createdAt', ...options });
  }
}

module.exports = new ActivityLogRepository();