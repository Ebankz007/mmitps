const NoteService = require('../services/NoteService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getNotes = catchAsync(async (req, res) => {
    const notes = await NoteService.getUserNotes(req.user._id, req.query);
    res.status(200).json(new ApiResponse(true, notes, 'Notes retrieved successfully'));
});

exports.createNote = catchAsync(async (req, res) => {
    const note = await NoteService.createNote(req.user._id, req.body);
    res.status(201).json(new ApiResponse(true, note, 'Note created successfully'));
});

exports.updateNote = catchAsync(async (req, res) => {
    const note = await NoteService.updateNote(req.params.id, req.user._id, req.body);
    res.status(200).json(new ApiResponse(true, note, 'Note updated successfully'));
});

exports.deleteNote = catchAsync(async (req, res) => {
    await NoteService.deleteNote(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(true, null, 'Note deleted successfully'));
});

exports.togglePin = catchAsync(async (req, res) => {
    const note = await NoteService.togglePin(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(true, note, 'Note pin status updated'));
});
