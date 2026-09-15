const ActivityLogRepository = require('../../repositories/ActivityLogRepository');

class AuditService {
    async log(userId, action, category, description, details = {}) {
        return ActivityLogRepository.create({
            user: userId,
            action,
            category,
            description,
            details,
            status: details.status || 'success'
        });
    }

    async getLogs(filters, options) {
        return ActivityLogRepository.findAll(filters, options);
    }
}

module.exports = new AuditService();
