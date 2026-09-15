/**
 * WalletController — PostgreSQL edition.
 * Mirrors the Mongo walletController. req.user comes from middleware/pg/auth.js
 * (camelCase, id = UUID string). Config-level routes (payment methods) unchanged.
 */
const WalletService = require('../../services/pg/WalletService');
const SystemConfigRepository = require('../../repositories/pg/SystemConfigRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const ApiServiceManager = require('../../services/ApiServiceManager');

exports.getActivePaymentMethods = catchAsync(async (req, res) => {
  const config = await ApiServiceManager.getConfig();
  const payments = config.payments || {};

  const activeMethods = [];
  for (const [key, details] of Object.entries(payments)) {
    if (details.status !== 'inactive') {
      activeMethods.push({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
      });
    }
  }

  res.status(200).json(new ApiResponse(true, activeMethods, 'Active payment methods retrieved securely'));
});

exports.getBalance = catchAsync(async (req, res) => {
  const { currency } = req.query;
  if (currency) {
    const balance = await WalletService.getBalance(req.user.id, currency);
    res.status(200).json(new ApiResponse(true, { currency: currency.toUpperCase(), balance }, 'Balance retrieved'));
  } else {
    const wallet = await WalletService.getWallet(req.user.id);
    res.status(200).json(new ApiResponse(true, wallet.balances, 'Balances retrieved'));
  }
});

exports.deposit = catchAsync(async (req, res) => {
  const { amount, currency, method } = req.body;
  const result = await WalletService.deposit(req.user.id, amount, currency, method);
  res.status(200).json(new ApiResponse(true, result, 'Deposit successful'));
});

exports.withdraw = catchAsync(async (req, res) => {
  const { amount, currency, details } = req.body;
  const transaction = await WalletService.withdraw(req.user.id, amount, currency, details);
  res.status(200).json(new ApiResponse(true, transaction, 'Withdrawal request submitted'));
});

exports.transfer = catchAsync(async (req, res) => {
  const { recipientEmail, amount, currency } = req.body;
  const transaction = await WalletService.transfer(req.user.id, recipientEmail, amount, currency);
  res.status(200).json(new ApiResponse(true, transaction, 'Transfer successful'));
});

/** Supported currencies — PG SystemConfig with find-or-create (mirrors Mongo behavior) */
exports.getSupportedCurrencies = catchAsync(async (req, res) => {
  let config = await SystemConfigRepository.findByKey('supportedCurrencies');
  if (!config) {
    config = await SystemConfigRepository.create({
      key: 'supportedCurrencies',
      category: 'financial',
      value: [
        { symbol: 'USD', name: 'US Dollar', type: 'fiat', isActive: true },
        { symbol: 'EUR', name: 'Euro', type: 'fiat', isActive: true },
        { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', isActive: true },
        { symbol: 'ETH', name: 'Ethereum', type: 'crypto', isActive: true },
        { symbol: 'USDT', name: 'Tether (TRC-20)', type: 'crypto', isActive: true },
        { symbol: 'BONUS', name: 'Bonus Credits', type: 'credits', isActive: true },
      ],
    });
  }
  res.status(200).json(new ApiResponse(true, config.value, 'Supported currencies retrieved'));
});

/** Admin: add a supported currency */
exports.addSupportedCurrency = catchAsync(async (req, res) => {
  const { symbol, name, type = 'fiat', isActive = true } = req.body;

  if (!symbol) throw new ApiError(400, 'Currency symbol is required');

  let config = await SystemConfigRepository.findByKey('supportedCurrencies');
  if (!config) {
    config = await SystemConfigRepository.create({
      key: 'supportedCurrencies',
      category: 'financial',
      value: [],
    });
  }

  const currencies = config.value || [];
  const upper = symbol.toUpperCase();
  if (currencies.some((c) => c.symbol === upper)) {
    throw new ApiError(400, `Currency ${upper} already exists`);
  }

  currencies.push({ symbol: upper, name: name || upper, type, isActive });
  await SystemConfigRepository.update(config.id, { value: currencies });

  res.status(201).json(new ApiResponse(true, currencies, 'Currency added successfully'));
});

/** Admin: overwrite a specific currency balance (raw control) */
exports.adminUpdateWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { currency, amount, frozen } = req.body;

  if (!currency) throw new ApiError(400, 'Currency is required');

  const { pool } = require('../../../db');
  const wallet = await WalletService.getWallet(userId);
  const balances = wallet.balances || [];
  const idx = balances.findIndex((b) => b.currency === currency.toUpperCase());

  if (idx > -1) {
    if (amount !== undefined) balances[idx].amount = amount;
    if (frozen !== undefined) balances[idx].frozen = frozen;
  } else {
    balances.push({ currency: currency.toUpperCase(), amount: amount || 0, frozen: frozen || 0 });
  }

  await pool.query('UPDATE wallets SET balances = $1, updated_at = NOW() WHERE user_id = $2', [
    JSON.stringify(balances),
    userId,
  ]);
  res.status(200).json(new ApiResponse(true, balances, 'Wallet updated by Admin'));
});

/** Admin: all user wallets (populated with user identity) */
exports.getUserWallets = catchAsync(async (req, res) => {
  const { pool } = require('../../../db');
  const { rows } = await pool.query(
    `SELECT w.*, u.email, u.username, u.role
     FROM wallets w JOIN users u ON u.id = w.user_id
     ORDER BY w.created_at DESC`
  );
  const wallets = rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    balances: r.balances,
    isActive: r.is_active,
    settings: r.settings,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    user: { email: r.email, username: r.username, role: r.role },
  }));
  res.status(200).json(new ApiResponse(true, wallets, 'All user wallets retrieved'));
});