const express = require('express');
const router = express.Router();
// PostgreSQL edition — Phase 1 switchover. Mongo stack kept at controllers/authController.js
const authController = require('../controllers/pg/authController');
const { protect } = require('../middleware/pg/auth');
const {
    registerRules,
    loginRules,
    emailRules,
    resetPasswordRules,
    magicLinkVerifyRules,
} = require('../middleware/validators/authValidators');

// POST /api/v1/auth/register
router.post('/register', registerRules, authController.register);

// POST /api/v1/auth/login
router.post('/login', loginRules, authController.login);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

// GET /api/v1/auth/refresh-session
router.get('/refresh-session', protect, authController.refreshSession);

// GET /api/v1/auth/me
router.get('/me', protect, authController.getMe);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', emailRules, authController.forgotPassword);

// POST /api/v1/auth/reset-password/:token
router.post('/reset-password/:token', resetPasswordRules, authController.resetPassword);

// POST /api/v1/auth/magic-link
router.post('/magic-link', emailRules, authController.sendMagicLink);

// POST /api/v1/auth/verify-magic-link
router.post('/verify-magic-link', magicLinkVerifyRules, authController.verifyMagicLink);

// POST /api/v1/auth/social-sync
router.post('/social-sync', authController.syncSocialUser);

module.exports = router;