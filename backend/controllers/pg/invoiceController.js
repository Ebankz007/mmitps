/**
 * InvoiceController — PostgreSQL edition.
 */
const InvoiceRepository = require('../../repositories/pg/InvoiceRepository');

// @desc    Get all invoices for current user
// @route   GET /api/v1/invoices
// @access  Private
exports.getMyInvoices = async (req, res) => {
    try {
        const invoices = await InvoiceRepository.findByUser(req.user.id, { sort: 'createdAt', direction: 'desc' });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error('Get Invoices Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single invoice
// @route   GET /api/v1/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Make sure user owns the invoice or is admin
        if (invoice.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Get Invoice Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create manual invoice (Admin only or internal use)
// @route   POST /api/v1/invoices
// @access  Private/Admin
exports.createInvoice = async (req, res) => {
    try {
        const invoice = await InvoiceRepository.create({
            userId: req.body.user,
            subscriptionId: req.body.subscription,
            amount: req.body.amount,
            currency: req.body.currency || 'USD',
            status: req.body.status || 'open',
            paidAt: req.body.status === 'paid' ? new Date() : null
        });

        res.status(201).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Create Invoice Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};