const { SystemService } = require('../models');

// @desc    Get all services
// @route   GET /api/v1/admin/services
// @access  Private/Admin
exports.getAllServices = async (req, res) => {
    try {
        const services = await SystemService.find();

        // Convert array to object keyed by name to maintain frontend compatibility
        const servicesConfig = {};
        services.forEach(s => {
            servicesConfig[s.name] = s.toObject();
        });

        res.status(200).json({
            success: true,
            data: servicesConfig
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update service configuration
// @route   PUT /api/v1/admin/services/:serviceName
// @access  Private/Admin
exports.updateService = async (req, res) => {
    try {
        const { serviceName } = req.params;
        const { url, apiKey, isActive, healthEndpoint, description } = req.body;

        const svc = await SystemService.findOne({ name: serviceName });
        if (!svc) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        if (url) svc.url = url;
        if (apiKey !== undefined) svc.apiKey = apiKey;
        if (typeof isActive !== 'undefined') svc.isActive = isActive;
        if (healthEndpoint) svc.healthEndpoint = healthEndpoint;
        if (description) svc.description = description;

        await svc.save();

        res.status(200).json({
            success: true,
            data: svc
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Add new service
// @route   POST /api/v1/admin/services
// @access  Private/Admin
exports.addService = async (req, res) => {
    try {
        const { serviceName, url, apiKey, healthEndpoint = '/health', description } = req.body;

        if (!serviceName || !url) {
            return res.status(400).json({ success: false, error: 'Service name and URL required' });
        }

        const existing = await SystemService.findOne({ name: serviceName });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Service already exists' });
        }

        const svc = await SystemService.create({
            name: serviceName,
            url,
            healthEndpoint,
            apiKey: apiKey || '',
            status: 'offline',
            isActive: true,
            description
        });

        res.status(201).json({
            success: true,
            data: svc
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Remove service
// @route   DELETE /api/v1/admin/services/:serviceName
// @access  Private/Admin
exports.removeService = async (req, res) => {
    try {
        const { serviceName } = req.params;

        const svc = await SystemService.findOneAndDelete({ name: serviceName });
        if (!svc) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Test service health
// @route   POST /api/v1/admin/services/:serviceName/health
// @access  Private/Admin
exports.testServiceHealth = async (req, res) => {
    try {
        const { serviceName } = req.params;

        const svc = await SystemService.findOne({ name: serviceName });
        if (!svc) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        // Mock health check (in production, would make actual HTTP request)
        svc.status = 'online';
        svc.lastHealthCheck = new Date();
        await svc.save();

        res.status(200).json({
            success: true,
            message: 'Health check successful',
            data: svc
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
