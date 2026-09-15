const Certificate = require('../models/Certificate');
const User = require('../models/User');

/**
 * @desc    Issue a new certificate
 * @route   POST /api/certification/issue
 * @access  Private/Admin
 */
exports.issueCertificate = async (req, res) => {
    try {
        const { recipientId, courseId, courseName, metadata } = req.body;

        // Check if user exists
        const user = await User.findById(recipientId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        // Check for existing certificate for this course?
        // Maybe allow multiple if different dates?
        // Let's assume one per course for now.
        const existing = await Certificate.findOne({ recipient: recipientId, courseId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already has a certificate for this course' });
        }

        const cert = await Certificate.create({
            recipient: recipientId,
            courseId,
            courseName,
            metadata
        });

        res.status(201).json({ success: true, data: cert });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Verify a certificate by code
 * @route   GET /api/certification/verify/:code
 * @access  Public
 */
exports.verifyCertificate = async (req, res) => {
    try {
        const { code } = req.params;
        const cert = await Certificate.findOne({ code, status: 'active' })
            .populate('recipient', 'name email');

        if (!cert) {
            return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
        }

        res.status(200).json({ success: true, data: cert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get my certificates
 * @route   GET /api/certification/my
 * @access  Private
 */
exports.getMyCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find({ recipient: req.user.id }).sort('-issueDate');
        res.status(200).json({ success: true, count: certs.length, data: certs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all certificates (Admin)
 * @route   GET /api/certification/all
 * @access  Private/Admin
 */
exports.getAllCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find().populate('recipient', 'name email').sort('-createdAt');
        res.status(200).json({ success: true, count: certs.length, data: certs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
