const { PaymentGateway } = require('../models');

// @desc    Get payment gateway configuration
// @route   GET /api/v1/admin/payment-config
// @access  Private/Admin
exports.getPaymentConfig = async (req, res) => {
    try {
        const providers = await PaymentGateway.find();

        // Sanitize sensitive keys for display
        const sanitized = {};
        providers.forEach(p => {
            const providerData = p.toObject();
            if (providerData.config) {
                if (providerData.config.secretKey) providerData.config.secretKey = '***hidden***';
                if (providerData.config.webhookSecret) providerData.config.webhookSecret = '***hidden***';
                if (providerData.config.clientSecret) providerData.config.clientSecret = '***hidden***';
            }
            providerData.enabled = providerData.isActive; // Map for frontend
            sanitized[p.name] = providerData;
        });

        res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update payment gateway configuration
// @route   PUT /api/v1/admin/payment-config/:provider
// @access  Private/Admin
exports.updatePaymentConfig = async (req, res) => {
    try {
        const { provider } = req.params;
        const updateData = req.body;

        const p = await PaymentGateway.findOne({ name: provider });
        if (!p) {
            return res.status(404).json({ success: false, error: 'Payment provider not found' });
        }

        // Map flat body fields to config object if needed, or just update the whole thing
        if (updateData.isActive !== undefined) p.isActive = updateData.isActive;
        if (updateData.currency) p.config.currency = updateData.currency;
        if (updateData.supportedMethods) p.supportedMethods = updateData.supportedMethods;

        // Update sensitive fields in config
        const sensitiveFields = ['publicKey', 'secretKey', 'webhookSecret', 'clientId', 'clientSecret', 'mode'];
        sensitiveFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (!p.config) p.config = {};
                p.config[field] = updateData[field];
            }
        });

        p.markModified('config');
        await p.save();

        res.status(200).json({
            success: true,
            message: 'Payment configuration updated',
            data: { provider, isActive: p.isActive }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Bulk update payment configuration
// @route   PUT /api/v1/admin/payment
// @access  Private/Admin
exports.bulkUpdatePaymentConfig = async (req, res) => {
    try {
        const updates = req.body; // e.g., { stripe: { ... }, paypal: { ... } }

        for (const [name, data] of Object.entries(updates)) {
            const p = await PaymentGateway.findOne({ name });
            if (p) {
                if (data.enabled !== undefined) p.isActive = data.enabled;
                if (data.isActive !== undefined) p.isActive = data.isActive;

                // Update config fields
                const sensitiveFields = ['publicKey', 'secretKey', 'webhookSecret', 'clientId', 'clientSecret', 'mode', 'currency'];
                sensitiveFields.forEach(field => {
                    if (data[field] !== undefined) {
                        if (!p.config) p.config = {};
                        p.config[field] = data[field];
                    }
                });

                p.markModified('config');
                await p.save();
            }
        }

        res.status(200).json({ success: true, message: 'Settings saved' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Toggle payment provider
// @route   PATCH /api/v1/admin/payment-config/:provider/toggle
// @access  Private/Admin
exports.togglePaymentProvider = async (req, res) => {
    try {
        const { provider } = req.params;

        const p = await PaymentGateway.findOne({ name: provider });
        if (!p) {
            return res.status(404).json({ success: false, error: 'Payment provider not found' });
        }

        p.isActive = !p.isActive;
        await p.save();

        res.status(200).json({
            success: true,
            message: `${provider} ${p.isActive ? 'enabled' : 'disabled'}`,
            data: { provider, isActive: p.isActive }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Test payment gateway connection
// @route   POST /api/v1/admin/payment-config/:provider/test
// @access  Private/Admin
exports.testPaymentConnection = async (req, res) => {
    try {
        const { provider } = req.params;

        const p = await PaymentGateway.findOne({ name: provider });
        if (!p) {
            return res.status(404).json({ success: false, error: 'Payment provider not found' });
        }

        if (!p.isActive) {
            return res.status(400).json({ success: false, error: 'Provider is not active' });
        }

        // Mock connection test
        res.status(200).json({
            success: true,
            message: `${provider} connection successful`,
            data: {
                provider,
                timestamp: new Date(),
                status: 'connected'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add new payment provider
// @route   POST /api/v1/admin/payment-config
// @access  Private/Admin
exports.addPaymentProvider = async (req, res) => {
    try {
        const { providerName, currency, displayName, supportedMethods } = req.body;

        if (!providerName) {
            return res.status(400).json({ success: false, error: 'Provider name required' });
        }

        const existing = await PaymentGateway.findOne({ name: providerName.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Provider already exists' });
        }

        const p = await PaymentGateway.create({
            name: providerName.toLowerCase(),
            displayName: displayName || providerName,
            isActive: false,
            config: { currency: currency || 'USD' },
            supportedMethods: supportedMethods || []
        });

        res.status(201).json({
            success: true,
            data: p
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
