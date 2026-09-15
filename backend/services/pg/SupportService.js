// backend/services/pg/SupportService.js — support tickets on the PG stack
const TicketRepository = require('../../repositories/pg/SupportTicketRepository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const crypto = require('crypto');

class SupportService {
  /** TKT-XXXX… unique ticket number (Mongo pre-save hook equivalent). */
  _generateTicketNumber() {
    const random = crypto.randomBytes(6).toString('hex').toUpperCase();
    return `TKT-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}`;
  }

  async createTicket(userId, data) {
    const { subject, category, priority, message, attachments } = data;
    const ticket = await TicketRepository.create({
      userId,
      subject,
      category: category || 'general',
      priority: priority || 'normal',
      status: 'open',
      ticketNumber: this._generateTicketNumber(),
      messages: [{
        sender: userId,
        senderType: 'user',
        message,
        attachments: attachments || [],
        isInternal: false,
        createdAt: new Date(),
      }],
    });
    logger.info(`Ticket created by user ${userId}: ${ticket.ticketNumber}`);
    return ticket;
  }

  async replyToTicket(ticketId, userId, messageData, isAdmin = false) {
    const ticket = await TicketRepository.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    if (!isAdmin && ticket.userId !== userId) {
      throw new ApiError(403, 'Not authorized to reply to this ticket');
    }

    const message = {
      sender: userId,
      senderType: isAdmin ? 'agent' : 'user',
      message: messageData.message,
      attachments: messageData.attachments || [],
      isInternal: messageData.isInternal || false,
      createdAt: new Date(),
    };

    const updatedTicket = await TicketRepository.addMessage(ticketId, message);

    // First admin response books firstResponseAt + assignment
    if (isAdmin && !ticket.firstResponseAt) {
      await TicketRepository.update(ticketId, { firstResponseAt: new Date(), assignedToId: userId });
    }

    return updatedTicket;
  }

  async getTicket(ticketId, userId, isAdmin = false) {
    const ticket = await TicketRepository.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    if (!isAdmin && ticket.userId !== userId) {
      throw new ApiError(403, 'Not authorized to view this ticket');
    }
    return ticket;
  }

  async getUserTickets(userId) {
    return TicketRepository.findByUser(userId);
  }

  async getOpenTickets() {
    return TicketRepository.findOpen();
  }

  async updateTicketStatus(ticketId, status) {
    return TicketRepository.updateStatus(ticketId, status);
  }

  async addInternalNote(ticketId, agentId, note) {
    const ticket = await TicketRepository.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    return TicketRepository.addInternalNote(ticketId, {
      agent: agentId,
      note,
      createdAt: new Date(),
    });
  }
}

module.exports = new SupportService();