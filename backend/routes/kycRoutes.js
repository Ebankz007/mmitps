const express = require('express');
const router = express.Router();
const kycController = require('../controllers/pg/kycController');
const { protect, authorize } = require('../middleware/pg/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');

// User routes
router.use(protect); // All routes require login

router.post('/documents', uploadLimiter, upload.single('document'), kycController.submitDocument);
router.get('/documents', kycController.getMyDocuments);
router.get('/status', kycController.getMyStatus);

// Admin routes
router.use(authorize('admin', 'super_admin'));

router.get('/admin/pending', kycController.getPendingDocuments);
router.put('/admin/documents/:id', kycController.reviewDocument);
router.post('/admin/aml-check', kycController.triggerAMLCheck);

module.exports = router;