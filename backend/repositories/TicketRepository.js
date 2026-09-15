const BaseRepository = require('./BaseRepository');
const SupportTicket = require('../models/Support/SupportTicket');

class TicketRepository extends BaseRepository {
    constructor() {
        super(SupportTicket);
    }

    async findByUser(userId, options = {}) {
        return this.model.find({ user: userId })
            .sort({ updatedAt: -1 })
            .populate('assignedTo', 'username name');
    }

    async findOpen(options = {}) {
        return this.model.find({ status: { $in: ['open', 'in_progress', 'waiting_customer', 'waiting_internal'] } })
            .populate('user', 'username email name')
            .populate('assignedTo', 'username name')
            .sort({ priority: -1, createdAt: 1 }); // High priority first, then oldest
    }

    async addMessage(ticketId, messageData) {
        return this.model.findByIdAndUpdate(
            ticketId,
            {
                $push: { messages: messageData },
                $set: {
                    status: messageData.senderType === 'user' ? 'open' : 'waiting_customer',
                    updatedAt: new Date()
                }
            },
            { new: true }
        ).populate('user', 'username email');
    }

    async updateStatus(ticketId, status, resolvedBy = null) {
        const update = { status };
        if (status === 'resolved') {
            update.resolvedAt = new Date();
        }
        if (status === 'closed') {
            update.closedAt = new Date();
        }
        return this.model.findByIdAndUpdate(ticketId, update, { new: true });
    }
}

module.exports = new TicketRepository();
