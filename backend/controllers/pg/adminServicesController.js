/**
 * AdminServicesController — PostgreSQL edition.
 * System services CRUD + health (mirrors Mongo adminServicesController).
 */
const SystemServiceRepository = require('../../repositories/pg/SystemServiceRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** GET /admin/services — keyed by name for frontend compatibility */
exports.getAllServices = catchAsync(async (req, res) => {
  const services = await SystemServiceRepository.findAll({});
  const servicesConfig = {};
  services.forEach(s => {
    servicesConfig[s.name] = s;
  });
  res.status(200).json({ success: true, data: servicesConfig });
});

/** PUT /admin/services/:serviceName */
exports.updateService = catchAsync(async (req, res) => {
  const { serviceName } = req.params;
  const { url, apiKey, isActive, healthEndpoint, description } = req.body;

  const svc = await SystemServiceRepository.findByName(serviceName);
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }

  const data = {};
  if (url) data.url = url;
  if (apiKey !== undefined) data.apiKey = apiKey;
  if (typeof isActive !== 'undefined') data.isActive = isActive;
  if (healthEndpoint) data.healthEndpoint = healthEndpoint;
  if (description) data.description = description;

  const updated = await SystemServiceRepository.update(svc.id, data);
  res.status(200).json({ success: true, data: updated });
});

/** POST /admin/services */
exports.addService = catchAsync(async (req, res) => {
  const { serviceName, url, apiKey, healthEndpoint = '/health', description } = req.body;

  if (!serviceName || !url) {
    return res.status(400).json({ success: false, error: 'Service name and URL required' });
  }

  const existing = await SystemServiceRepository.findByName(serviceName);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Service already exists' });
  }

  const svc = await SystemServiceRepository.create({
    name: serviceName,
    url,
    healthEndpoint,
    apiKey: apiKey || '',
    status: 'offline',
    isActive: true,
    description,
  });

  res.status(201).json({ success: true, data: svc });
});

/** DELETE /admin/services/:serviceName */
exports.removeService = catchAsync(async (req, res) => {
  const { serviceName } = req.params;

  const svc = await SystemServiceRepository.findByName(serviceName);
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }

  await SystemServiceRepository.delete(svc.id);
  res.status(200).json({ success: true, data: {} });
});

/** POST /admin/services/:serviceName/health */
exports.testServiceHealth = catchAsync(async (req, res) => {
  const { serviceName } = req.params;

  const svc = await SystemServiceRepository.findByName(serviceName);
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }

  // Mock health check (in production, would make actual HTTP request)
  const updated = await SystemServiceRepository.update(svc.id, {
    status: 'online',
    lastHealthCheck: new Date(),
  });

  res.status(200).json({
    success: true,
    message: 'Health check successful',
    data: updated,
  });
});