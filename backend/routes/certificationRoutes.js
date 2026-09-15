const express = require('express');
const {
    issueCertificate,
    verifyCertificate,
    getMyCertificates,
    getAllCertificates
} = require('../controllers/pg/certificationController');

const { protect, authorize } = require('../middleware/pg/auth');

const router = express.Router();

// Public verification
router.get('/verify/:code', verifyCertificate);

// Protected routes
router.use(protect);

router.get('/my', getMyCertificates);
router.post('/issue', authorize('admin'), issueCertificate);
router.get('/all', authorize('admin'), getAllCertificates);

module.exports = router;
