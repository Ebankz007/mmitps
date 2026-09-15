/**
 * AdminPaymentController — PostgreSQL edition.
 * Payment gateway config (mirrors Mongo adminPaymentController).
 */
const PaymentGatewayRepository = require('../../repositories/pg/PaymentGatewayRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

const SENSITIVE_KEYS = ['secretKey', 'webhookSecret', 'clientSecret'];

/** GET /admin/payment-config */
exports.getPaymentConfig = catchAsync(async (req, res) => {
  const providers = await PaymentGatewayRepository.findAll({});

  const sanitized = {};
  providers.forEach(p => {
    const providerData = { ...p };
    if (providerData.config) {
      const config = { ...providerData.config };
      SENSITIVE_KEYS.forEach(k => {
        if (config[k]) config[k] = '***hidden***';
      });
      providerData.config = config;
    }
    providerData.enabled = providerData.isActive; // Map for frontend
    sanitized[p.name] = providerData;
  });

  res.status(200).json({ success: true, data: sanitized });
});

/** PUT /admin/payment-config/:provider */
exports.updatePaymentConfig = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const updateData = req.body;

  const p = await PaymentGatewayRepository.findByName(provider);
  if (!p) {
    return res.status(404).json({ success: false, error: 'Payment provider not found' });
  }

  const config = { ...(p.config || {}) };
  const data = {};

  if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
  if (updateData.currency) config.currency = updateData.currency;
  if (updateData.supportedMethods) data.supportedMethods = updateData.supportedMethods;

  // Update sensitive fields in config
  const sensitiveFields = ['publicKey', 'secretKey', 'webhookSecret', 'clientId', 'clientSecret', 'mode'];
  sensitiveFields.forEach(field => {
    if (updateData[field] !== undefined) {
      config[field] = updateData[field];
    }
  });
  data.config = config;

  const updated = await PaymentGatewayRepository.update(p.id, data);

  res.status(200).json({
    success: true,
    message: 'Payment configuration updated',
    data: { provider, isActive: updated.isActive },
  });
});

/** PUT /admin/payment — bulk update */
exports.bulkUpdatePaymentConfig = catchAsync(async (req, res) => {
  const updates = req.body; // e.g., { stripe: { ... }, paypal: { ... } }

  for (const [name, data] of Object.entries(updates)) {
    const p = await PaymentGatewayRepository.findByName(name);
    if (p) {
      const config = { ...(p.config || {}) };
      const update = {};

      if (data.enabled !== undefined) update.isActive = data.enabled;
      if (data.isActive !== undefined) update.isActive = data.isActive;

      const sensitiveFields = ['publicKey', 'secretKey', 'webhookSecret', 'clientId', 'clientSecret', 'mode', 'currency'];
      sensitiveFields.forEach(field => {
        if (data[field] !== undefined) {
          config[field] = data[field];
        }
      });
      update.config = config;

      await PaymentGatewayRepository.update(p.id, update);
    }
  }

  res.status(200).json({ success: true, message: 'Settings saved' });
});

/** PATCH /admin/payment-config/:provider/toggle */
exports.togglePaymentProvider = catchAsync(async (req, res) => {
  const { provider } = req.params;

  const p = await PaymentGatewayRepository.findByName(provider);
  if (!p) {
    return res.status(404).json({ success: false, error: 'Payment provider not found' });
  }

  const updated = await PaymentGatewayRepository.update(p.id, { isActive: !p.isActive });

  res.status(200).json({
    success: true,
    message: `${provider} ${updated.isActive ? 'enabled' : 'disabled'}`,
    data: { provider, isActive: updated.isActive },
  });
});

/** POST /admin/payment-config/:provider/test */
exports.testPaymentConnection = catchAsync(async (req, res) => {
  const { provider } = req.params;

  const p = await PaymentGatewayRepository.findByName(provider);
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
      status: 'connected',
    },
  });
});

/** POST /admin/payment-config */
exports.addPaymentProvider = catchAsync(async (req, res) => {
  const { providerName, currency, displayName, supportedMethods } = req.body;

  if (!providerName) {
    return res.status(400).json({ success: false, error: 'Provider name required' });
  }

  const existing = await PaymentGatewayRepository.findByName(providerName.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: 'Provider already exists' });
  }

  const p = await PaymentGatewayRepository.create({
    name: providerName.toLowerCase(),
    displayName: displayName || providerName,
    isActive: false,
    config: { currency: currency || 'USD' },
    supportedMethods: supportedMethods || [],
  });

  res.status(201).json({ success: true, data: p });
});