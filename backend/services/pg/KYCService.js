/**
 * KYCService — PostgreSQL edition.
 */
const KYCRepository = require('../../repositories/pg/KYCRepository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const fs = require('fs');

class KYCService {
  /**
   * Submit a new KYC document
   */
  async submitDocument(userId, file, type, metadata = {}) {
    try {
      if (!file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const document = await KYCRepository.create({
        userId,
        type,
        fileUrl: file.path,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: 'pending',
        ...metadata
      });

      logger.info(`User ${userId} submitted KYC document ${type}`);
      return document;
    } catch (error) {
      // Cleanup file if database creation fails
      if (file && file.path) {
        fs.unlink(file.path, (err) => {
          if (err) logger.error('Error deleting file after failed submission:', err);
        });
      }
      throw error;
    }
  }

  /**
   * Get user's KYC documents
   */
  async getUserDocuments(userId) {
    return KYCRepository.findByUser(userId);
  }

  /**
   * Get pending documents (Admin)
   */
  async getPendingDocuments() {
    return KYCRepository.findPending();
  }

  /**
   * Review a document (Admin)
   */
  async reviewDocument(documentId, status, verifyBy, reason = null) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Invalid status. Must be approved or rejected');
    }

    const document = await KYCRepository.findById(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    if (document.status !== 'pending') {
      throw new ApiError(400, `Document is already ${document.status}`);
    }

    const updatedDoc = await KYCRepository.updateStatus(documentId, status, verifyBy, reason);
    logger.info(`KYC Document ${documentId} ${status} by admin ${verifyBy}`);

    return updatedDoc;
  }
}

module.exports = new KYCService();