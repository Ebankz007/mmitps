const TicketRepository = require('../repositories/TicketRepository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class SupportService {
    /**
     * Create a new support ticket
     */
    async createTicket(userId, data) {
        try {
            const { subject, category, priority, message, attachments } = data;

            const ticket = await TicketRepository.create({
                user: userId,
                subject,
                category,
                priority: priority || 'normal',
                status: 'open',
                messages: [{
                    sender: userId,
                    senderType: 'user',
                    message: message,
                    attachments: attachments || []
                }]
            });

            logger.info(`Ticket created by user ${userId}: ${ticket.ticketNumber}`);
            return ticket;
        } catch (error) {
            logger.error('Error creating ticket:', error);
            throw error;
        }
    }

    /**
     * Reply to a ticket
     */
    async replyToTicket(ticketId, userId, messageData, isAdmin = false) {
        const ticket = await TicketRepository.findById(ticketId);
        if (!ticket) {
            throw new ApiError(404, 'Ticket not found');
        }

        // Authorization check
        if (!isAdmin && ticket.user.toString() !== userId.toString()) {
            throw new ApiError(403, 'Not authorized to reply to this ticket');
        }

        const message = {
            sender: userId,
            senderType: isAdmin ? 'agent' : 'user',
            message: messageData.message,
            attachments: messageData.attachments || [],
            isInternal: messageData.isInternal || false
        };

        const updatedTicket = await TicketRepository.addMessage(ticketId, message);

        // Update status logic
        let newStatus = ticket.status;
        if (isAdmin) {
            newStatus = 'waiting_customer';
            if (!ticket.firstResponseAt) {
                await TicketRepository.update(ticketId, { firstResponseAt: new Date(), assignedTo: userId });
            }
        } else {
            newStatus = 'open'; // Re-open if user replies
        }

        await TicketRepository.updateStatus(ticketId, newStatus);

        return updatedTicket;
    }

    /**
     * Get ticket details
     */
    async getTicket(ticketId, userId, isAdmin = false) {
        const ticket = await TicketRepository.findById(ticketId);
        if (!ticket) {
            throw new ApiError(404, 'Ticket not found');
        }

        if (!isAdmin && ticket.user.toString() !== userId.toString()) {
            throw new ApiError(403, 'Not authorized to view this ticket');
        }

        return ticket;
    }

    /**
     * Get user tickets
     */
    async getUserTickets(userId) {
        return TicketRepository.findByUser(userId);
    }

    /**
     * Get all pending tickets (Admin)
     */
    async getOpenTickets() {
        return TicketRepository.findOpen();
    }

    /**
     * Close/Resolve ticket
     */
    async updateTicketStatus(ticketId, status, userId) {
        return TicketRepository.updateStatus(ticketId, status, userId);
    }

    /**
     * Add an internal note to a ticket (Admin/Agent only)
     */
    async addInternalNote(ticketId, agentId, note) {
        const ticket = await TicketRepository.findById(ticketId);
        if (!ticket) throw new ApiError(404, 'Ticket not found');

        ticket.internalNotes.push({
            agent: agentId,
            note: note,
            createdAt: new Date()
        });

        await ticket.save();
        return ticket;
    }
}

module.exports = new SupportService();
