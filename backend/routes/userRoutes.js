const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const noteController = require('../controllers/noteController');
const userEmailController = require('../controllers/userEmailController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');

// All routes below are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.patch('/update-preferences', userController.updatePreferences);
router.patch('/change-password', userController.changePassword);
router.post('/profile/avatar', uploadLimiter, uploadAvatar, userController.uploadProfilePicture);

// Note management routes
router.get('/notes', noteController.getNotes);
router.post('/notes', noteController.createNote);
router.put('/notes/:id', noteController.updateNote);
router.delete('/notes/:id', noteController.deleteNote);
router.patch('/notes/:id/pin', noteController.togglePin);

// Email notification preferences
router.get('/email-preferences',  userEmailController.getEmailPreferences);
router.put('/email-preferences',  userEmailController.updateEmailPreferences);

module.exports = router;

