const BaseRepository = require('./BaseRepository');
const ActivityLog = require('../models/System/ActivityLog');

class ActivityLogRepository extends BaseRepository {
    constructor() {
        super(ActivityLog);
    }

    async findByUser(userId, options = {}) {
        return this.findAll({ user: userId }, options);
    }

    async findByCategory(category, options = {}) {
        return this.findAll({ category }, options);
    }
}

module.exports = new ActivityLogRepository();
