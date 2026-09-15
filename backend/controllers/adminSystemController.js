const { SystemConfig } = require('../models');
const HealthService = require('../services/HealthService');

// @desc    Get all system configurations
// @route   GET /api/v1/admin/settings
// @access  Private/Admin
exports.getAllSettings = async (req, res) => {
    try {
        // Ensure the global session timeout setting exists for the admin UI
        const sessionConfigExists = await SystemConfig.findOne({ key: 'session_duration_minutes' });
        if (!sessionConfigExists) {
            await SystemConfig.create({
                key: 'session_duration_minutes',
                value: 60,
                category: 'security',
                description: 'Global default session timeout in minutes',
                isPublic: false
            });
        }

        const settings = await SystemConfig.find();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get settings by category
// @route   GET /api/v1/admin/settings/category/:category
// @access  Private/Admin
exports.getSettingsByCategory = async (req, res) => {
    try {
        const settings = await SystemConfig.find({ category: req.params.category });
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update or create a setting
// @route   PUT /api/v1/admin/settings/:key
// @access  Private/Admin
exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, category, description, isPublic } = req.body;

        let setting = await SystemConfig.findOne({ key });

        if (setting) {
            if (value !== undefined) setting.value = value;
            if (category) setting.category = category;
            if (description) setting.description = description;
            if (isPublic !== undefined) setting.isPublic = isPublic;
            setting.lastModifiedBy = req.user.id;
            await setting.save();
        } else {
            setting = await SystemConfig.create({
                key,
                value,
                category,
                description,
                isPublic,
                lastModifiedBy: req.user.id
            });
        }

        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get Geo-Restrictions
// @route   GET /api/v1/admin/settings/geo-restrictions
// @access  Private/Admin
exports.getGeoRestrictions = async (req, res) => {
    try {
        let geoConfig = await SystemConfig.findOne({ key: 'geo_restrictions' });

        if (!geoConfig) {
            // Return empty/default if not found
            return res.status(200).json({
                success: true,
                data: {
                    key: 'geo_restrictions',
                    value: {
                        tokenization: { enabled: true, blockedCountries: ['US', 'CN', 'KP', 'IR'] },
                        copytrading: { enabled: true, blockedCountries: ['US'] },
                        crypto: { enabled: true, blockedCountries: ['KP', 'IR', 'SY', 'CU'] },
                        leverage: { enabled: true, limitedCountries: { 'EU': 30, 'GB': 30, 'AU': 30 } },
                        mlm: { enabled: true, blockedCountries: ['CN', 'FR'] },
                        global: { enabled: true, blockedCountries: [] }
                    }
                }
            });
        }

        res.status(200).json({ success: true, data: geoConfig });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update Geo-Restrictions
// @route   PUT /api/v1/admin/settings/geo-restrictions
// @access  Private/Admin
exports.updateGeoRestrictions = async (req, res) => {
    try {
        const { value } = req.body;

        let geoConfig = await SystemConfig.findOneAndUpdate(
            { key: 'geo_restrictions' },
            {
                value,
                category: 'security',
                description: 'Country-based feature restrictions',
                lastModifiedBy: req.user.id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: geoConfig });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get detailed database health status
// @route   GET /api/v1/admin/system/db-health
// @access  Private/Admin
exports.getDatabaseHealth = async (req, res) => {
    try {
        const health = await HealthService.getDatabaseStatus();
        res.status(200).json({ success: true, data: health });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Force a database reconnection
// @route   POST /api/v1/admin/system/db-repair
// @access  Private/Admin
exports.repairDatabaseConnection = async (req, res) => {
    try {
        const result = await HealthService.repairConnection();
        res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
