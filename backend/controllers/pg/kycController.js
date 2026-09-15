/**
 * KYCController — PostgreSQL edition.
 */
const KYCService = require('../../services/pg/KYCService');
const AMLService = require('../../services/pg/AMLService');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

// -- User Endpoints --

exports.submitDocument = catchAsync(async (req, res) => {
    const file = req.file;
    const { type, documentNumber, issuingCountry } = req.body;

    if (!file) {
        throw new ApiError(400, 'Please upload a file');
    }

    const document = await KYCService.submitDocument(req.user.id, file, type, {
        documentNumber,
        issuingCountry
    });

    res.status(201).json(new ApiResponse(true, document, 'Document submitted successfully'));
});

exports.getMyDocuments = catchAsync(async (req, res) => {
    const documents = await KYCService.getUserDocuments(req.user.id);
    res.status(200).json(new ApiResponse(true, documents, 'Documents retrieved'));
});

exports.getMyStatus = catchAsync(async (req, res) => {
    // Current simple logic: check if any approved document exists
    const documents = await KYCService.getUserDocuments(req.user.id);
    const approved = documents.some(doc => doc.status === 'approved');
    const status = approved ? 'verified' : (documents.length > 0 ? 'pending' : 'unverified');

    res.status(200).json(new ApiResponse(true, { status }, 'KYC Status retrieved'));
});

// -- Admin Endpoints --

exports.getPendingDocuments = catchAsync(async (req, res) => {
    const documents = await KYCService.getPendingDocuments();
    res.status(200).json(new ApiResponse(true, documents, 'Pending documents retrieved'));
});

exports.reviewDocument = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    const document = await KYCService.reviewDocument(id, status, req.user.id, reason);
    res.status(200).json(new ApiResponse(true, document, `Document ${status} successfully`));
});

exports.triggerAMLCheck = catchAsync(async (req, res) => {
    const { userId } = req.body;
    const check = await AMLService.performCheck(userId);
    res.status(200).json(new ApiResponse(true, check, 'AML check performed'));
});