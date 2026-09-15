/**
 * AdminFeatureController — PostgreSQL edition.
 * Feature flags + plan rate limits (mirrors Mongo adminAPIController).
 */
const FeatureFlagRepository = require('../../repositories/pg/FeatureFlagRepository');
const PlanRepository = require('../../repositories/pg/PlanRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** GET /admin/features — keyed by name for frontend compatibility */
exports.getAllFeatures = catchAsync(async (req, res) => {
  const features = await FeatureFlagRepository.findAll({});

  const featureFlags = {};
  features.forEach(f => {
    featureFlags[f.name] = {
      enabled: f.enabled,
      requiredTier: f.requiredTier,
      description: f.description,
      category: f.category,
    };
  });

  res.status(200).json({ success: true, data: featureFlags });
});

/** PUT /admin/features/:featureName */
exports.updateFeature = catchAsync(async (req, res) => {
  const { featureName } = req.params;
  const { enabled, requiredTier, description, category } = req.body;

  const feature = await FeatureFlagRepository.findByName(featureName);
  if (!feature) {
    return res.status(404).json({ success: false, error: 'Feature not found' });
  }

  const data = {};
  if (typeof enabled !== 'undefined') data.enabled = enabled;
  if (requiredTier) data.requiredTier = requiredTier;
  if (description) data.description = description;
  if (category) data.category = category;

  const updated = await FeatureFlagRepository.update(feature.id, data);
  res.status(200).json({ success: true, data: updated });
});

/** POST /admin/features */
exports.addFeatureFlag = catchAsync(async (req, res) => {
  const { featureName, enabled, requiredTier, description, category } = req.body;

  if (!featureName) {
    return res.status(400).json({ success: false, error: 'Feature name required' });
  }

  const existing = await FeatureFlagRepository.findByName(featureName);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Feature already exists' });
  }

  const feature = await FeatureFlagRepository.create({
    name: featureName,
    enabled: enabled !== undefined ? enabled : false,
    requiredTier: requiredTier || 'PRO',
    description,
    category: category || 'platform',
  });

  res.status(201).json({ success: true, data: feature });
});

/** GET /admin/rate-limits */
exports.getRateLimits = catchAsync(async (req, res) => {
  const plans = await PlanRepository.findAll({});
  // Map to name/code/limits (rateLimits lives in plans.limits jsonb on PG)
  const mapped = plans.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
    rateLimits: p.limits?.rateLimits || {},
  }));
  res.status(200).json({ success: true, data: mapped });
});

/** PUT /admin/rate-limits/:planId */
exports.updateRateLimits = catchAsync(async (req, res) => {
  const { planId } = req.params;
  const { apiCallsPerDay, wsConnectionsPerSession } = req.body;

  const plan = await PlanRepository.findById(planId);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }

  const limits = { ...(plan.limits || {}), rateLimits: { ...(plan.limits?.rateLimits || {}) } };
  if (apiCallsPerDay) limits.rateLimits.apiCallsPerDay = apiCallsPerDay;
  if (wsConnectionsPerSession) limits.rateLimits.wsConnectionsPerSession = wsConnectionsPerSession;

  const updated = await PlanRepository.update(plan.id, { limits });
  res.status(200).json({ success: true, data: updated });
});