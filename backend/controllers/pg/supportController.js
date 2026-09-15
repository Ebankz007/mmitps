/**
 * supportController — PostgreSQL edition.
 * Mirrors the Mongo controllers/supportController.
 */
const SupportService = require('../../services/pg/SupportService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.createTicket = catchAsync(async (req, res) => {
  const ticket = await SupportService.createTicket(req.user.id, req.body);
  res.status(201).json(new ApiResponse(true, ticket, 'Ticket created'));
});

exports.getMyTickets = catchAsync(async (req, res) => {
  const tickets = await SupportService.getUserTickets(req.user.id);
  res.status(200).json(new ApiResponse(true, tickets, 'Tickets retrieved'));
});

exports.getTicket = catchAsync(async (req, res) => {
  const ticket = await SupportService.getTicket(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(true, ticket, 'Ticket retrieved'));
});

exports.replyTicket = catchAsync(async (req, res) => {
  const ticket = await SupportService.replyToTicket(req.params.id, req.user.id, req.body);
  res.status(200).json(new ApiResponse(true, ticket, 'Reply added'));
});

exports.closeTicket = catchAsync(async (req, res) => {
  const ticket = await SupportService.getTicket(req.params.id, req.user.id);
  const updated = await SupportService.updateTicketStatus(ticket.id, 'closed');
  res.status(200).json(new ApiResponse(true, updated, 'Ticket closed'));
});

// ─── Admin ─────────────────────────────────────────────────────────────────

exports.getAllTickets = catchAsync(async (req, res) => {
  const tickets = await SupportService.getOpenTickets();
  res.status(200).json(new ApiResponse(true, tickets, 'Tickets retrieved'));
});

exports.adminReply = catchAsync(async (req, res) => {
  const ticket = await SupportService.replyToTicket(req.params.id, req.user.id, req.body, true);
  res.status(200).json(new ApiResponse(true, ticket, 'Reply added'));
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new ApiError(400, 'Status required');
  const ticket = await SupportService.updateTicketStatus(req.params.id, status);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  res.status(200).json(new ApiResponse(true, ticket, 'Status updated'));
});

exports.addInternalNote = catchAsync(async (req, res) => {
  const { note } = req.body;
  if (!note) throw new ApiError(400, 'Note required');
  const ticket = await SupportService.addInternalNote(req.params.id, req.user.id, note);
  res.status(200).json(new ApiResponse(true, ticket, 'Note added'));
});