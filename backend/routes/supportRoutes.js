const express = require('express');
const router = express.Router();
const supportController = require('../controllers/pg/supportController');
const { protect, authorize } = require('../middleware/pg/auth');

// User routes - all require login
router.use(protect);

router.post('/', supportController.createTicket);
router.get('/', supportController.getMyTickets);
router.get('/:id', supportController.getTicket);
router.post('/:id/reply', supportController.replyTicket);
router.put('/:id/close', supportController.closeTicket);

// Admin routes
router.use(authorize('admin', 'super_admin', 'support_agent'));

router.get('/admin/all', supportController.getAllTickets);
router.post('/admin/:id/reply', supportController.adminReply);
router.put('/admin/:id/status', supportController.updateStatus);
router.post('/admin/:id/note', supportController.addInternalNote);

module.exports = router;
