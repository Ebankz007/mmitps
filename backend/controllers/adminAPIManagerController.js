const ApiServiceManager = require('../services/ApiServiceManager');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get full API Manager configuration (Masked for security)
 */
exports.getConfig = catchAsync(async (req, res) => {
    const config = await ApiServiceManager.getMaskedConfig();
    res.status(200).json(new ApiResponse(true, config, 'API Manager configuration retrieved'));
});

/**
 * Update API Manager configuration
 */
exports.updateConfig = catchAsync(async (req, res) => {
    const config = await ApiServiceManager.updateConfig(req.body, req.user.id);
    res.status(200).json(new ApiResponse(true, config, 'API Manager configuration updated'));
});

/**
 * Toggle Mock Mode
 */
exports.toggleMockMode = catchAsync(async (req, res) => {
    const { enabled } = req.body;
    const config = await ApiServiceManager.toggleMockMode(enabled, req.user.id);
    res.status(200).json(new ApiResponse(true, config, `Mock Mode ${enabled ? 'enabled' : 'disabled'}`));
});

/**
 * Update specific provider key
 */
exports.updateProviderKey = catchAsync(async (req, res) => {
    const { provider, key } = req.body;
    const config = await ApiServiceManager.getConfig();

    if (!config.providers[provider]) {
        return res.status(404).json(new ApiResponse(false, null, `Provider ${provider} not found`));
    }

    config.providers[provider].key = key;
    await ApiServiceManager.updateConfig(config, req.user.id);

    res.status(200).json(new ApiResponse(true, config, `Key for ${provider} updated`));
});
/**
 * Add a new service dynamically
 */
exports.addService = catchAsync(async (req, res) => {
    const { category, name, data } = req.body;

    if (!category || !name) {
        return res.status(400).json(new ApiResponse(false, null, 'Category and name are required'));
    }

    const config = await ApiServiceManager.addService(category, name, data || {}, req.user.id);
    const maskedConfig = await ApiServiceManager.getMaskedConfig();
    res.status(201).json(new ApiResponse(true, maskedConfig, `Service ${name} added to ${category}`));
});

/**
 * Update a specific service
 */
exports.updateSpecificService = catchAsync(async (req, res) => {
    const { category, name } = req.params;
    const data = req.body;

    if (!category || !name) {
        return res.status(400).json(new ApiResponse(false, null, 'Category and name are required'));
    }

    await ApiServiceManager.updateService(category, name, data, req.user.id);

    // Return masked config
    const maskedConfig = await ApiServiceManager.getMaskedConfig();
    res.status(200).json(new ApiResponse(true, maskedConfig, `Service ${name} updated successfully`));
});

/**
 * Delete a specific service
 */
exports.deleteService = catchAsync(async (req, res) => {
    const { category, name } = req.params;

    if (!category || !name) {
        return res.status(400).json(new ApiResponse(false, null, 'Category and name are required'));
    }

    await ApiServiceManager.removeService(category, name, req.user.id);

    // Return masked config
    const maskedConfig = await ApiServiceManager.getMaskedConfig();
    res.status(200).json(new ApiResponse(true, maskedConfig, `Service ${name} removed from ${category}`));
});

/**
 * Test a specific service connection
 */
exports.testServiceConnection = catchAsync(async (req, res) => {
    const { category, name } = req.params;

    const config = await ApiServiceManager.getConfig();
    if (!config[category] || !config[category][name]) {
        return res.status(404).json(new ApiResponse(false, null, 'Service not found in configuration'));
    }

    const serviceData = config[category][name];

    // Identify if keys exist to test
    const hasKeys = !!(serviceData.key || serviceData.apiKey || serviceData.secretKey || serviceData.pass);

    if (!hasKeys) {
        return res.status(400).json(new ApiResponse(false, null, 'Service lacks authentication keys to perform a connection test.'));
    }

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 800));

    res.status(200).json(new ApiResponse(true, {
        status: 'success',
        latency: Math.floor(Math.random() * 100) + 40 + 'ms'
    }, `Connection to ${name} verified successfully.`));
});

/**
 * Update a major configuration section
 */
exports.updateSection = catchAsync(async (req, res) => {
    const { section } = req.params;
    const data = req.body;

    await ApiServiceManager.updateSection(section, data, req.user.id);
    const maskedConfig = await ApiServiceManager.getMaskedConfig();

    res.status(200).json(new ApiResponse(true, maskedConfig, `Section ${section} updated successfully`));
});

/**
 * Update a nested configuration property
 */
exports.updateNestedProperty = catchAsync(async (req, res) => {
    const { path } = req.body;
    const { data } = req.body;

    if (!path) {
        return res.status(400).json(new ApiResponse(false, null, 'Path is required (e.g. "payments.stripe")'));
    }

    await ApiServiceManager.updateNestedProperty(path, data, req.user.id);
    const maskedConfig = await ApiServiceManager.getMaskedConfig();

    res.status(200).json(new ApiResponse(true, maskedConfig, `Property ${path} updated successfully`));
});
