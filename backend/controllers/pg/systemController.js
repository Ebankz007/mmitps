/**
 * systemController — PostgreSQL edition.
 * Geo-restrictions come from system_configs (pg), key 'geo_restrictions'.
 */
const SystemConfigRepository = require('../../repositories/pg/SystemConfigRepository');
const HealthService = require('../../services/HealthService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

const DEFAULT_GEO = {
  tokenization: { enabled: true, blockedCountries: [] },
  copytrading: { enabled: true, blockedCountries: [] },
  crypto: { enabled: true, blockedCountries: [] },
  leverage: { enabled: true, limitedCountries: {} },
  mlm: { enabled: true, blockedCountries: [] },
  global: { enabled: true, blockedCountries: [] },
};

exports.getGeoRestrictions = catchAsync(async (req, res) => {
  const config = await SystemConfigRepository.findByKey('geo_restrictions');
  res.status(200).json({
    success: true,
    data: config
      ? { key: 'geo_restrictions', value: config.value }
      : { key: 'geo_restrictions', value: DEFAULT_GEO },
  });
});

/** GET /admin/settings — all system configs */
exports.getAllSettings = catchAsync(async (req, res) => {
  // Ensure the global session timeout setting exists for the admin UI
  const sessionConfigExists = await SystemConfigRepository.findByKey('session_duration_minutes');
  if (!sessionConfigExists) {
    await SystemConfigRepository.create({
      key: 'session_duration_minutes',
      value: 60,
      category: 'security',
      description: 'Global default session timeout in minutes',
      isPublic: false,
    });
  }

  const settings = await SystemConfigRepository.findAll({});
  res.status(200).json({ success: true, data: settings });
});

/** PUT /admin/settings/:key — update or create a setting */
exports.updateSetting = catchAsync(async (req, res) => {
  const { key } = req.params;
  const { value, category, description, isPublic } = req.body;

  let setting = await SystemConfigRepository.findByKey(key);

  if (setting) {
    const data = { lastModifiedBy: req.user.id };
    if (value !== undefined) data.value = value;
    if (category) data.category = category;
    if (description) data.description = description;
    if (isPublic !== undefined) data.isPublic = isPublic;
    setting = await SystemConfigRepository.update(setting.id, data);
  } else {
    setting = await SystemConfigRepository.create({
      key,
      value,
      category,
      description,
      isPublic,
      lastModifiedBy: req.user.id,
    });
  }

  res.status(200).json({ success: true, data: setting });
});

/** PUT /admin/settings/geo-restrictions */
exports.updateGeoRestrictions = catchAsync(async (req, res) => {
  const { value } = req.body;

  const geoConfig = await SystemConfigRepository.updateConfig('geo_restrictions', value, req.user.id);

  res.status(200).json({ success: true, data: geoConfig });
});

/** GET /admin/system/health */
exports.getDatabaseHealth = catchAsync(async (req, res) => {
  const health = await HealthService.getDatabaseStatus();
  res.status(200).json({ success: true, data: health });
});

/** POST /admin/system/db-repair */
exports.repairDatabaseConnection = catchAsync(async (req, res) => {
  const result = await HealthService.repairConnection();
  res.status(result.success ? 200 : 500).json(result);
});