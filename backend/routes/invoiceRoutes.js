const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/pg/auth');
const {
    getMyInvoices,
    getInvoiceById,
    createInvoice
} = require('../controllers/pg/invoiceController');

router.use(protect);

router.get('/', getMyInvoices);
router.post('/', authorize('admin', 'super_admin'), createInvoice);

router.get('/:id', getInvoiceById);

module.exports = router;