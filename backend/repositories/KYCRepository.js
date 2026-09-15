const BaseRepository = require('./BaseRepository');
const KYCDocument = require('../models/KYC/KYCDocument');

class KYCRepository extends BaseRepository {
    constructor() {
        super(KYCDocument);
    }

    async findByUser(userId) {
        return this.model.find({ user: userId }).sort({ createdAt: -1 });
    }

    async findPending() {
        return this.model.find({ status: 'pending' })
            .populate('user', 'username email name')
            .sort({ createdAt: 1 });
    }

    async countPending() {
        return this.model.countDocuments({ status: 'pending' });
    }

    async updateStatus(documentId, status, verifiedBy, reason = null) {
        const update = {
            status,
            verifiedBy,
            verifiedAt: new Date()
        };

        if (reason) {
            update.rejectionReason = reason;
        }

        return this.model.findByIdAndUpdate(documentId, update, { new: true });
    }
}

module.exports = new KYCRepository();
