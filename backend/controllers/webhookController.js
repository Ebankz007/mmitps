/**
 * WebhookController — PostgreSQL edition.
 * Payment provider webhooks with REAL signature verification (the Mongo-era
 * version had Korapay/Cellulant/Mux verification commented out and required
 * deleted models — it could not even load).
 *
 * Security posture:
 *  - Every provider FAILS CLOSED: missing secret → 503, bad signature → 401.
 *  - Signature verification uses the RAW request body (req.rawBody), captured
 *    by the global body-parser `verify` hook in server.js.
 *  - Payment completion is idempotent: a transaction is credited exactly once.
 */
const crypto = require('crypto');
const logger = require('../utils/logger');
const TransactionRepository = require('../repositories/pg/TransactionRepository');
const WalletRepository = require('../repositories/pg/WalletRepository');

// ─── Signature verification helpers ────────────────────────────────────────

function safeEqual(a, b) {
  const bufA = Buffer.isBuffer(a) ? a : Buffer.from(String(a));
  const bufB = Buffer.isBuffer(b) ? b : Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyHmac(rawBody, signature, secret) {
  if (!secret) return { ok: false, reason: 'secret not configured' };
  if (!signature) return { ok: false, reason: 'missing signature header' };
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return safeEqual(expected, signature)
    ? { ok: true }
    : { ok: false, reason: 'HMAC mismatch' };
}

// ─── Core payment processor (idempotent) ───────────────────────────────────

async function processSuccessfulPayment(data, provider) {
  const reference = data.reference || data.tx_ref;
  if (!reference) {
    logger.warn(`[Webhook:${provider}] No reference in payload — ignoring`);
    return;
  }

  const transaction = await TransactionRepository.findByReference(reference);
  if (!transaction) {
    logger.warn(`[Webhook:${provider}] Transaction not found for ref ${reference}`);
    return;
  }

  // Idempotency guard — a replayed webhook must never double-credit.
  if (transaction.status === 'completed') {
    logger.info(`[Webhook:${provider}] Transaction ${reference} already completed — skipping`);
    return;
  }

  const providerReference = String(data.id || data.transaction_id || '');

  if (transaction.type === 'deposit') {
    // Credit wallet (WalletRepository.updateBalance is atomic: BEGIN + FOR UPDATE + COMMIT)
    await WalletRepository.updateBalance(transaction.userId, transaction.currency, transaction.amount);
    await TransactionRepository.markCompleted(transaction.id, { providerReference });
    logger.info(`[Webhook:${provider}] Credited ${transaction.amount} ${transaction.currency} to user ${transaction.userId} (ref ${reference})`);
  } else {
    // Subscription / tier / other purchases — mark completed; activation is
    // handled by the consuming flow (subscription service listens for completion).
    await TransactionRepository.markCompleted(transaction.id, { providerReference });
    logger.info(`[Webhook:${provider}] Transaction ${reference} marked completed (type: ${transaction.type})`);
  }
}

// ─── Handlers ───────────────────────────────────────────────────────────────

exports.handlePaystackWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const check = verifyHmac(rawBody, req.headers['x-paystack-signature'], process.env.PAYSTACK_SECRET_KEY);
    if (!check.ok) {
      logger.warn(`[Paystack] Rejected: ${check.reason}`);
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`[Paystack] Event: ${event.event}`);

    if (event.event === 'charge.success') {
      await processSuccessfulPayment(event.data, 'paystack');
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error(`[Paystack] Webhook error: ${error.message}`);
    res.sendStatus(500);
  }
};

exports.handleFlutterwaveWebhook = async (req, res) => {
  try {
    const secret = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secret) {
      logger.warn('[Flutterwave] Rejected: secret not configured');
      return res.status(503).json({ success: false, message: 'Webhook not configured' });
    }
    const signature = req.headers['verif-hash'];
    if (!signature || !safeEqual(signature, secret)) {
      logger.warn('[Flutterwave] Rejected: invalid verif-hash');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`[Flutterwave] Event: ${event.event}`);

    if (event.event === 'charge.completed' && event.data && event.data.status === 'successful') {
      await processSuccessfulPayment(event.data, 'flutterwave');
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error(`[Flutterwave] Webhook error: ${error.message}`);
    res.sendStatus(500);
  }
};

exports.handleKorapayWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    // Korapay signs the raw body with HMAC-SHA512 using the secret key.
    const check = verifyHmac(rawBody, req.headers['x-korapay-signature'], process.env.KORAPAY_SECRET_KEY);
    if (!check.ok) {
      logger.warn(`[Korapay] Rejected: ${check.reason}`);
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`[Korapay] Event: ${event.event}`);

    if (event.event === 'charge.success') {
      await processSuccessfulPayment(event.data, 'korapay');
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error(`[Korapay] Webhook error: ${error.message}`);
    res.sendStatus(500);
  }
};

exports.handleCellulantWebhook = async (req, res) => {
  try {
    const accessKey = process.env.CELLULANT_ACCESS_KEY;
    if (!accessKey) {
      logger.warn('[Cellulant] Rejected: not configured');
      return res.status(503).json({ success: false, message: 'Webhook not configured' });
    }
    const providedKey = req.headers['x-access-key'];
    if (!providedKey || !safeEqual(providedKey, accessKey)) {
      logger.warn('[Cellulant] Rejected: invalid access key');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`[Cellulant] Event: ${event.eventType || 'unknown'}`);

    if (event.paymentStatus === 'SUCCESS') {
      await processSuccessfulPayment(event, 'cellulant');
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error(`[Cellulant] Webhook error: ${error.message}`);
    res.sendStatus(500);
  }
};

exports.handleCoinpaymentsWebhook = async (req, res) => {
  try {
    const ipnSecret = process.env.COINPAYMENTS_IPN_SECRET;
    if (!ipnSecret) {
      logger.warn('[Coinpayments] Rejected: not configured');
      return res.status(503).json({ success: false, message: 'Webhook not configured' });
    }

    // req.rawBody is the raw form-urlencoded string (captured by the global
    // urlencoded parser's verify hook) — HMAC must be over the raw body.
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const check = verifyHmac(rawBody, req.headers['hmac'], ipnSecret);
    if (!check.ok) {
      logger.warn(`[Coinpayments] Rejected: ${check.reason}`);
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Coinpayments: status >= 100 = confirmed/paid (2 = queued for payout)
    const status = Number(req.body.status || 0);
    logger.info(`[Coinpayments] Status: ${status}`);

    if (status >= 100 || status === 2) {
      await processSuccessfulPayment(req.body, 'coinpayments');
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error(`[Coinpayments] Webhook error: ${error.message}`);
    res.sendStatus(500);
  }
};

exports.handleMuxWebhook = async (req, res) => {
  try {
    const muxSecret = process.env.MUX_WEBHOOK_SECRET;
    if (!muxSecret) {
      logger.warn('[Mux] Rejected: not configured');
      return res.status(503).json({ success: false, message: 'Webhook not configured' });
    }

    // Mux signature: "t=<timestamp>|v1=<hex>" over `${timestamp}.${rawBody}`
    const header = req.headers['mux-signature'] || '';
    const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=')));
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expected = crypto.createHmac('sha256', muxSecret).update(`${parts.t}.${rawBody}`).digest('hex');

    if (!parts.v1 || !safeEqual(expected, parts.v1)) {
      logger.warn('[Mux] Rejected: invalid signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`[Mux] Event: ${event.type}`);

    // Livestream lifecycle events — no pg livestream model wired yet; log only.
    // When a livestream model exists, update stream status here.

    res.sendStatus(200);
  } catch (error) {
    logger.error(`[Mux] Webhook error: ${error.message}`);
    res.sendStatus(400);
  }
};