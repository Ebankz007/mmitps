const SupportService = require('../services/SupportService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// -- User Endpoints --

exports.createTicket = catchAsync(async (req, res) => {
    const { subject, category, priority, message } = req.body;
    const ticket = await SupportService.createTicket(req.user._id, {
        subject,
        category,
        priority,
        message
        // attachments handling if needed
    });
    res.status(201).json(new ApiResponse(true, ticket, 'Ticket created successfully'));
});

exports.getMyTickets = catchAsync(async (req, res) => {
    const tickets = await SupportService.getUserTickets(req.user._id);
    res.status(200).json(new ApiResponse(true, tickets, 'Tickets retrieved'));
});

exports.getTicket = catchAsync(async (req, res) => {
    const ticket = await SupportService.getTicket(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(true, ticket, 'Ticket details retrieved'));
});

exports.replyTicket = catchAsync(async (req, res) => {
    const { message } = req.body;
    const ticket = await SupportService.replyToTicket(req.params.id, req.user._id, { message });
    res.status(200).json(new ApiResponse(true, ticket, 'Reply sent'));
});

exports.closeTicket = catchAsync(async (req, res) => {
    const ticket = await SupportService.updateTicketStatus(req.params.id, 'closed', req.user._id);
    res.status(200).json(new ApiResponse(true, ticket, 'Ticket closed'));
});

// -- Admin Endpoints --

exports.getAllTickets = catchAsync(async (req, res) => {
    const tickets = await SupportService.getOpenTickets();
    res.status(200).json(new ApiResponse(true, tickets, 'All open tickets retrieved'));
});

exports.adminReply = catchAsync(async (req, res) => {
    const { message, isInternal } = req.body;
    const ticket = await SupportService.replyToTicket(req.params.id, req.user._id, { message, isInternal }, true);
    res.status(200).json(new ApiResponse(true, ticket, 'Admin reply sent'));
});

exports.updateStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const ticket = await SupportService.updateTicketStatus(req.params.id, status, req.user._id);
    res.status(200).json(new ApiResponse(true, ticket, `Ticket status updated to ${status}`));
});

exports.addInternalNote = catchAsync(async (req, res) => {
    const { note } = req.body;
    const ticket = await SupportService.addInternalNote(req.params.id, req.user._id, note);
    res.status(200).json(new ApiResponse(true, ticket, 'Internal note added'));
});
