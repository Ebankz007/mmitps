/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    MMITPS PAYMENT GATEWAY INTEGRATIONS                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Complete payment processing for:                                          ║
 * ║  • PayStack (Nigeria, Ghana, Kenya, South Africa)                         ║
 * ║  • Flutterwave (30+ African countries, global cards)                      ║
 * ║  • Korapay (Nigeria, Kenya, Ghana)                                        ║
 * ║  • Cryptocurrency (BTC, ETH, USDT, USDC on multiple chains)              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PAYMENT_CONFIG = {
    // PayStack Configuration
    PAYSTACK: {
        SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        BASE_URL: 'https://api.paystack.co',
        WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
        SUPPORTED_CURRENCIES: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],
        SUPPORTED_COUNTRIES: ['NG', 'GH', 'ZA', 'KE'],
        CHANNELS: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    },
    
    // Flutterwave Configuration
    FLUTTERWAVE: {
        SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X',
        PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X',
        ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY || 'FLWSECK_TESTxxxxxxxxxxxxxxxx',
        BASE_URL: 'https://api.flutterwave.com/v3',
        WEBHOOK_SECRET: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
        SUPPORTED_CURRENCIES: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'ZAR', 'XAF', 'XOF', 'USD', 'EUR', 'GBP', 'ZMW', 'RWF'],
        SUPPORTED_COUNTRIES: ['NG', 'GH', 'KE', 'UG', 'TZ', 'ZA', 'CM', 'CI', 'SN', 'ZM', 'RW', 'MW', 'BW'],
        PAYMENT_TYPES: ['card', 'banktransfer', 'ussd', 'mpesa', 'mobilemoneyghana', 'mobilemoneyuganda', 'mobilemoneyrwanda', 'mobilemoneyzambia', 'barter', 'nqr'],
    },
    
    // Korapay Configuration
    KORAPAY: {
        SECRET_KEY: process.env.KORAPAY_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        PUBLIC_KEY: process.env.KORAPAY_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        ENCRYPTION_KEY: process.env.KORAPAY_ENCRYPTION_KEY,
        BASE_URL: 'https://api.korapay.com/merchant/api/v1',
        WEBHOOK_SECRET: process.env.KORAPAY_WEBHOOK_SECRET,
        SUPPORTED_CURRENCIES: ['NGN', 'KES', 'GHS', 'USD'],
        SUPPORTED_COUNTRIES: ['NG', 'KE', 'GH'],
        CHANNELS: ['card', 'bank_transfer', 'pay_with_bank', 'mobile_money'],
    },
    
    // Cryptocurrency Configuration
    CRYPTO: {
        // Fireblocks (Institutional)
        FIREBLOCKS_API_KEY: process.env.FIREBLOCKS_API_KEY,
        FIREBLOCKS_API_SECRET: process.env.FIREBLOCKS_API_SECRET,
        FIREBLOCKS_VAULT_ID: process.env.FIREBLOCKS_VAULT_ID || '0',
        
        // Coinbase Commerce
        COINBASE_COMMERCE_KEY: process.env.COINBASE_COMMERCE_KEY,
        COINBASE_COMMERCE_WEBHOOK_SECRET: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
        
        // NOWPayments
        NOWPAYMENTS_API_KEY: process.env.NOWPAYMENTS_API_KEY,
        NOWPAYMENTS_IPN_SECRET: process.env.NOWPAYMENTS_IPN_SECRET,
        
        // Supported chains and tokens
        SUPPORTED_CHAINS: {
            ethereum: { name: 'Ethereum', symbol: 'ETH', confirmations: 12, explorer: 'https://etherscan.io' },
            bsc: { name: 'BNB Smart Chain', symbol: 'BNB', confirmations: 15, explorer: 'https://bscscan.com' },
            polygon: { name: 'Polygon', symbol: 'MATIC', confirmations: 128, explorer: 'https://polygonscan.com' },
            tron: { name: 'Tron', symbol: 'TRX', confirmations: 19, explorer: 'https://tronscan.org' },
            solana: { name: 'Solana', symbol: 'SOL', confirmations: 32, explorer: 'https://solscan.io' },
            arbitrum: { name: 'Arbitrum', symbol: 'ETH', confirmations: 12, explorer: 'https://arbiscan.io' },
            optimism: { name: 'Optimism', symbol: 'ETH', confirmations: 12, explorer: 'https://optimistic.etherscan.io' },
            avalanche: { name: 'Avalanche', symbol: 'AVAX', confirmations: 12, explorer: 'https://snowtrace.io' },
            bitcoin: { name: 'Bitcoin', symbol: 'BTC', confirmations: 3, explorer: 'https://blockchain.com' },
        },
        SUPPORTED_TOKENS: ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'MATIC', 'TRX', 'AVAX', 'DAI'],
        
        // Fee structure
        DEPOSIT_FEE_PERCENT: 0.5,
        WITHDRAWAL_FEE_PERCENT: 1.0,
        MIN_DEPOSIT: {
            BTC: 0.0005,
            ETH: 0.01,
            USDT: 10,
            USDC: 10,
            BNB: 0.05,
            SOL: 0.5,
            default: 10,
        },
        MIN_WITHDRAWAL: {
            BTC: 0.001,
            ETH: 0.02,
            USDT: 20,
            USDC: 20,
            BNB: 0.1,
            SOL: 1,
            default: 20,
        },
    },
    
    // General Settings
    WEBHOOK_BASE_URL: process.env.WEBHOOK_BASE_URL || 'https://api.mmitps.com/webhooks',
    REDIRECT_BASE_URL: process.env.REDIRECT_BASE_URL || 'https://mmitps.com',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique reference ID
 */
function generateReference(prefix = 'MMITPS') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Verify PayStack webhook signature
 */
function verifyPaystackWebhook(body, signature) {
    const hash = crypto
        .createHmac('sha512', PAYMENT_CONFIG.PAYSTACK.SECRET_KEY)
        .update(JSON.stringify(body))
        .digest('hex');
    return hash === signature;
}

/**
 * Verify Flutterwave webhook signature
 */
function verifyFlutterwaveWebhook(body, signature) {
    const hash = crypto
        .createHmac('sha256', PAYMENT_CONFIG.FLUTTERWAVE.WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
    return hash === signature;
}

/**
 * Verify Korapay webhook signature
 */
function verifyKorapayWebhook(body, signature) {
    const hash = crypto
        .createHmac('sha256', PAYMENT_CONFIG.KORAPAY.WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
    return hash === signature;
}

/**
 * Convert amount to smallest currency unit
 */
function toSmallestUnit(amount, currency) {
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND'];
    if (noDecimalCurrencies.includes(currency.toUpperCase())) {
        return Math.round(amount);
    }
    return Math.round(amount * 100);
}

/**
 * Convert from smallest currency unit
 */
function fromSmallestUnit(amount, currency) {
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND'];
    if (noDecimalCurrencies.includes(currency.toUpperCase())) {
        return amount;
    }
    return amount / 100;
}

// ============================================================================
// PAYSTACK INTEGRATION
// ============================================================================

const PayStackService = {
    /**
     * Initialize a transaction
     */
    async initializeTransaction(data) {
        const { email, amount, currency, metadata, callback_url, channels } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/transaction/initialize`,
                {
                    email,
                    amount: toSmallestUnit(amount, currency),
                    currency: currency || 'NGN',
                    reference: generateReference('PS'),
                    callback_url: callback_url || `${PAYMENT_CONFIG.REDIRECT_BASE_URL}/payment/callback`,
                    metadata: {
                        ...metadata,
                        platform: 'MMITPS',
                        timestamp: new Date().toISOString(),
                    },
                    channels: channels || PAYMENT_CONFIG.PAYSTACK.CHANNELS,
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    reference: response.data.data.reference,
                    authorization_url: response.data.data.authorization_url,
                    access_code: response.data.data.access_code,
                },
            };
        } catch (error) {
            console.error('PayStack Initialize Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Transaction initialization failed',
            };
        }
    },
    
    /**
     * Verify a transaction
     */
    async verifyTransaction(reference) {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                    },
                }
            );
            
            const { status, amount, currency, paid_at, channel, authorization } = response.data.data;
            
            return {
                success: true,
                data: {
                    status,
                    amount: fromSmallestUnit(amount, currency),
                    currency,
                    paid_at,
                    channel,
                    card_type: authorization?.card_type,
                    last4: authorization?.last4,
                    bank: authorization?.bank,
                },
            };
        } catch (error) {
            console.error('PayStack Verify Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed',
            };
        }
    },
    
    /**
     * Create transfer recipient
     */
    async createTransferRecipient(data) {
        const { type, name, account_number, bank_code, currency } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/transferrecipient`,
                {
                    type: type || 'nuban',
                    name,
                    account_number,
                    bank_code,
                    currency: currency || 'NGN',
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    recipient_code: response.data.data.recipient_code,
                    name: response.data.data.name,
                    bank_name: response.data.data.details.bank_name,
                    account_number: response.data.data.details.account_number,
                },
            };
        } catch (error) {
            console.error('PayStack Create Recipient Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create recipient',
            };
        }
    },
    
    /**
     * Initiate transfer (payout)
     */
    async initiateTransfer(data) {
        const { amount, recipient_code, reason, currency, reference } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/transfer`,
                {
                    source: 'balance',
                    amount: toSmallestUnit(amount, currency || 'NGN'),
                    recipient: recipient_code,
                    reason: reason || 'MMITPS Withdrawal',
                    reference: reference || generateReference('PS_WD'),
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    transfer_code: response.data.data.transfer_code,
                    reference: response.data.data.reference,
                    status: response.data.data.status,
                    amount: fromSmallestUnit(response.data.data.amount, currency || 'NGN'),
                },
            };
        } catch (error) {
            console.error('PayStack Transfer Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Transfer failed',
            };
        }
    },
    
    /**
     * Get list of banks
     */
    async getBanks(country = 'nigeria') {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/bank?country=${country}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                    },
                }
            );
            
            return {
                success: true,
                data: response.data.data.map(bank => ({
                    name: bank.name,
                    code: bank.code,
                    type: bank.type,
                })),
            };
        } catch (error) {
            console.error('PayStack Get Banks Error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to fetch banks',
            };
        }
    },
    
    /**
     * Resolve account number
     */
    async resolveAccount(account_number, bank_code) {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    account_name: response.data.data.account_name,
                    account_number: response.data.data.account_number,
                    bank_id: response.data.data.bank_id,
                },
            };
        } catch (error) {
            console.error('PayStack Resolve Account Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to resolve account',
            };
        }
    },
    
    /**
     * Charge mobile money (Ghana, Kenya)
     */
    async chargeMobileMoney(data) {
        const { email, amount, currency, phone, provider, metadata } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.PAYSTACK.BASE_URL}/charge`,
                {
                    email,
                    amount: toSmallestUnit(amount, currency),
                    currency,
                    mobile_money: {
                        phone,
                        provider, // 'mtn', 'vod', 'tgo' for Ghana; 'mpesa' for Kenya
                    },
                    metadata,
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.PAYSTACK.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error('PayStack Mobile Money Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Mobile money charge failed',
            };
        }
    },
};

// ============================================================================
// FLUTTERWAVE INTEGRATION
// ============================================================================

const FlutterwaveService = {
    /**
     * Initialize standard payment
     */
    async initializePayment(data) {
        const { tx_ref, amount, currency, redirect_url, customer, customizations, payment_options, meta } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/payments`,
                {
                    tx_ref: tx_ref || generateReference('FW'),
                    amount,
                    currency: currency || 'NGN',
                    redirect_url: redirect_url || `${PAYMENT_CONFIG.REDIRECT_BASE_URL}/payment/callback`,
                    customer: {
                        email: customer.email,
                        name: customer.name,
                        phonenumber: customer.phone,
                    },
                    customizations: {
                        title: customizations?.title || 'MMITPS Payment',
                        logo: customizations?.logo || 'https://mmitps.com/logo.png',
                        description: customizations?.description || 'Deposit to trading account',
                    },
                    payment_options: payment_options || 'card,banktransfer,ussd,mobilemoney',
                    meta: {
                        ...meta,
                        platform: 'MMITPS',
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    link: response.data.data.link,
                    tx_ref: tx_ref || generateReference('FW'),
                },
            };
        } catch (error) {
            console.error('Flutterwave Initialize Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment initialization failed',
            };
        }
    },
    
    /**
     * Verify transaction
     */
    async verifyTransaction(transactionId) {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/transactions/${transactionId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                    },
                }
            );
            
            const { status, amount, currency, tx_ref, flw_ref, payment_type, charged_amount, card } = response.data.data;
            
            return {
                success: true,
                data: {
                    status,
                    amount,
                    currency,
                    tx_ref,
                    flw_ref,
                    payment_type,
                    charged_amount,
                    card_type: card?.type,
                    last4: card?.last_4digits,
                },
            };
        } catch (error) {
            console.error('Flutterwave Verify Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed',
            };
        }
    },
    
    /**
     * Create transfer (payout)
     */
    async createTransfer(data) {
        const { bank_code, account_number, amount, currency, narration, beneficiary_name, reference, debit_currency } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/transfers`,
                {
                    account_bank: bank_code,
                    account_number,
                    amount,
                    currency: currency || 'NGN',
                    narration: narration || 'MMITPS Withdrawal',
                    beneficiary_name,
                    reference: reference || generateReference('FW_WD'),
                    debit_currency: debit_currency || currency || 'NGN',
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    id: response.data.data.id,
                    reference: response.data.data.reference,
                    status: response.data.data.status,
                    amount: response.data.data.amount,
                    fee: response.data.data.fee,
                },
            };
        } catch (error) {
            console.error('Flutterwave Transfer Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Transfer failed',
            };
        }
    },
    
    /**
     * Get all banks
     */
    async getBanks(country = 'NG') {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/banks/${country}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                    },
                }
            );
            
            return {
                success: true,
                data: response.data.data.map(bank => ({
                    name: bank.name,
                    code: bank.code,
                    id: bank.id,
                })),
            };
        } catch (error) {
            console.error('Flutterwave Get Banks Error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to fetch banks',
            };
        }
    },
    
    /**
     * Verify account number
     */
    async verifyAccount(account_number, account_bank) {
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/accounts/resolve`,
                {
                    account_number,
                    account_bank,
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    account_name: response.data.data.account_name,
                    account_number: response.data.data.account_number,
                },
            };
        } catch (error) {
            console.error('Flutterwave Verify Account Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Account verification failed',
            };
        }
    },
    
    /**
     * Charge via M-Pesa (Kenya)
     */
    async chargeMpesa(data) {
        const { tx_ref, amount, phone_number, email, fullname } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/charges?type=mpesa`,
                {
                    tx_ref: tx_ref || generateReference('FW_MP'),
                    amount,
                    currency: 'KES',
                    phone_number,
                    email,
                    fullname,
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error('Flutterwave M-Pesa Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'M-Pesa charge failed',
            };
        }
    },
    
    /**
     * Charge via Mobile Money Ghana
     */
    async chargeMobileMoneyGhana(data) {
        const { tx_ref, amount, phone_number, email, network } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/charges?type=mobile_money_ghana`,
                {
                    tx_ref: tx_ref || generateReference('FW_GH'),
                    amount,
                    currency: 'GHS',
                    phone_number,
                    email,
                    network, // 'MTN', 'VODAFONE', 'TIGO'
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error('Flutterwave Ghana MoMo Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Mobile money charge failed',
            };
        }
    },
    
    /**
     * Create virtual account (for recurring deposits)
     */
    async createVirtualAccount(data) {
        const { email, tx_ref, amount, is_permanent, bvn, narration } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.FLUTTERWAVE.BASE_URL}/virtual-account-numbers`,
                {
                    email,
                    tx_ref: tx_ref || generateReference('FW_VA'),
                    amount,
                    is_permanent: is_permanent || false,
                    bvn,
                    narration: narration || 'MMITPS Deposit',
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    account_number: response.data.data.account_number,
                    bank_name: response.data.data.bank_name,
                    order_ref: response.data.data.order_ref,
                    expires_at: response.data.data.expiry_date,
                },
            };
        } catch (error) {
            console.error('Flutterwave Virtual Account Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Virtual account creation failed',
            };
        }
    },
};

// ============================================================================
// KORAPAY INTEGRATION
// ============================================================================

const KorapayService = {
    /**
     * Initialize payment
     */
    async initializePayment(data) {
        const { reference, amount, currency, customer, redirect_url, channels, metadata } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.KORAPAY.BASE_URL}/charges/initialize`,
                {
                    reference: reference || generateReference('KP'),
                    amount,
                    currency: currency || 'NGN',
                    customer: {
                        email: customer.email,
                        name: customer.name,
                    },
                    notification_url: `${PAYMENT_CONFIG.WEBHOOK_BASE_URL}/korapay`,
                    redirect_url: redirect_url || `${PAYMENT_CONFIG.REDIRECT_BASE_URL}/payment/callback`,
                    channels: channels || PAYMENT_CONFIG.KORAPAY.CHANNELS,
                    default_channel: 'card',
                    metadata: {
                        ...metadata,
                        platform: 'MMITPS',
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.KORAPAY.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    reference: response.data.data.reference,
                    checkout_url: response.data.data.checkout_url,
                },
            };
        } catch (error) {
            console.error('Korapay Initialize Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment initialization failed',
            };
        }
    },
    
    /**
     * Verify transaction
     */
    async verifyTransaction(reference) {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.KORAPAY.BASE_URL}/charges/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.KORAPAY.SECRET_KEY}`,
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    status: response.data.data.status,
                    amount: response.data.data.amount,
                    currency: response.data.data.currency,
                    reference: response.data.data.reference,
                    payment_method: response.data.data.payment_method,
                },
            };
        } catch (error) {
            console.error('Korapay Verify Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed',
            };
        }
    },
    
    /**
     * Create payout
     */
    async createPayout(data) {
        const { reference, amount, currency, destination, narration } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.KORAPAY.BASE_URL}/transactions/disburse`,
                {
                    reference: reference || generateReference('KP_WD'),
                    amount,
                    currency: currency || 'NGN',
                    destination: {
                        type: destination.type || 'bank_account',
                        amount,
                        currency: currency || 'NGN',
                        bank_account: {
                            bank: destination.bank_code,
                            account: destination.account_number,
                        },
                        customer: {
                            name: destination.account_name,
                            email: destination.email,
                        },
                    },
                    narration: narration || 'MMITPS Withdrawal',
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.KORAPAY.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    reference: response.data.data.reference,
                    status: response.data.data.status,
                    amount: response.data.data.amount,
                },
            };
        } catch (error) {
            console.error('Korapay Payout Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payout failed',
            };
        }
    },
    
    /**
     * Get banks
     */
    async getBanks(country = 'NG') {
        try {
            const response = await axios.get(
                `${PAYMENT_CONFIG.KORAPAY.BASE_URL}/misc/banks?countryCode=${country}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.KORAPAY.SECRET_KEY}`,
                    },
                }
            );
            
            return {
                success: true,
                data: response.data.data.map(bank => ({
                    name: bank.name,
                    code: bank.code,
                    country: bank.country,
                })),
            };
        } catch (error) {
            console.error('Korapay Get Banks Error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Failed to fetch banks',
            };
        }
    },
    
    /**
     * Resolve bank account
     */
    async resolveAccount(bank, account) {
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.KORAPAY.BASE_URL}/misc/banks/resolve`,
                {
                    bank,
                    account,
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.KORAPAY.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    account_name: response.data.data.account_name,
                    account_number: response.data.data.account_number,
                    bank_code: response.data.data.bank_code,
                    bank_name: response.data.data.bank_name,
                },
            };
        } catch (error) {
            console.error('Korapay Resolve Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Account resolution failed',
            };
        }
    },
    
    /**
     * Create virtual bank account
     */
    async createVirtualAccount(data) {
        const { account_name, account_reference, permanent, bank_code, customer } = data;
        
        try {
            const response = await axios.post(
                `${PAYMENT_CONFIG.KORAPAY.BASE_URL}/virtual-bank-account`,
                {
                    account_name: account_name || 'MMITPS User',
                    account_reference: account_reference || generateReference('KP_VA'),
                    permanent: permanent || false,
                    bank_code: bank_code || '035', // Wema Bank
                    customer: {
                        name: customer.name,
                        email: customer.email,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYMENT_CONFIG.KORAPAY.SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return {
                success: true,
                data: {
                    account_number: response.data.data.account_number,
                    account_name: response.data.data.account_name,
                    bank_name: response.data.data.bank_name,
                    bank_code: response.data.data.bank_code,
                    account_reference: response.data.data.account_reference,
                },
            };
        } catch (error) {
            console.error('Korapay Virtual Account Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Virtual account creation failed',
            };
        }
    },
};

// ============================================================================
// CRYPTOCURRENCY PAYMENT SERVICE
// ============================================================================

const CryptoPaymentService = {
    /**
     * Get supported chains and tokens
     */
    getSupportedAssets() {
        return {
            chains: PAYMENT_CONFIG.CRYPTO.SUPPORTED_CHAINS,
            tokens: PAYMENT_CONFIG.CRYPTO.SUPPORTED_TOKENS,
        };
    },
    
    /**
     * Generate deposit address
     * In production, integrate with Fireblocks, BitGo, or similar
     */
    async generateDepositAddress(userId, chain, token) {
        try {
            // Validate chain and token
            if (!PAYMENT_CONFIG.CRYPTO.SUPPORTED_CHAINS[chain]) {
                return { success: false, error: 'Unsupported chain' };
            }
            
            if (!PAYMENT_CONFIG.CRYPTO.SUPPORTED_TOKENS.includes(token)) {
                return { success: false, error: 'Unsupported token' };
            }
            
            // In production, this would:
            // 1. Call Fireblocks/BitGo API to generate new address
            // 2. Store the address mapping in database
            // 3. Set up webhook for deposit monitoring
            
            // Demo addresses per chain (DO NOT USE IN PRODUCTION)
            const demoAddresses = {
                ethereum: `0x${crypto.randomBytes(20).toString('hex')}`,
                bsc: `0x${crypto.randomBytes(20).toString('hex')}`,
                polygon: `0x${crypto.randomBytes(20).toString('hex')}`,
                tron: `T${crypto.randomBytes(20).toString('hex').substring(0, 33)}`,
                solana: crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '').substring(0, 44),
                arbitrum: `0x${crypto.randomBytes(20).toString('hex')}`,
                optimism: `0x${crypto.randomBytes(20).toString('hex')}`,
                avalanche: `0x${crypto.randomBytes(20).toString('hex')}`,
                bitcoin: `bc1q${crypto.randomBytes(20).toString('hex')}`,
            };
            
            const chainConfig = PAYMENT_CONFIG.CRYPTO.SUPPORTED_CHAINS[chain];
            const minDeposit = PAYMENT_CONFIG.CRYPTO.MIN_DEPOSIT[token] || PAYMENT_CONFIG.CRYPTO.MIN_DEPOSIT.default;
            
            return {
                success: true,
                data: {
                    address: demoAddresses[chain],
                    chain,
                    chain_name: chainConfig.name,
                    token,
                    network_fee: chain === 'ethereum' ? 'Gas fees apply' : 'Low network fees',
                    min_deposit: minDeposit,
                    min_deposit_formatted: `${minDeposit} ${token}`,
                    confirmations_required: chainConfig.confirmations,
                    explorer_url: chainConfig.explorer,
                    qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${demoAddresses[chain]}`,
                    memo: chain === 'solana' || chain === 'tron' ? null : undefined,
                    tag: undefined,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    warning: chain === 'ethereum' ? 'Only send ETH and ERC-20 tokens to this address' : null,
                },
            };
        } catch (error) {
            console.error('Generate Deposit Address Error:', error);
            return { success: false, error: 'Failed to generate address' };
        }
    },
    
    /**
     * Estimate withdrawal fee
     */
    async estimateWithdrawalFee(chain, token, amount) {
        try {
            // In production, fetch real-time gas prices and calculate fees
            const baseFees = {
                ethereum: { ETH: 0.005, USDT: 15, USDC: 15 },
                bsc: { BNB: 0.0005, USDT: 0.5, USDC: 0.5 },
                polygon: { MATIC: 0.01, USDT: 0.1, USDC: 0.1 },
                tron: { TRX: 1, USDT: 1, USDC: 1 },
                solana: { SOL: 0.00025, USDT: 0.01, USDC: 0.01 },
                arbitrum: { ETH: 0.0001, USDT: 0.5, USDC: 0.5 },
                optimism: { ETH: 0.0001, USDT: 0.5, USDC: 0.5 },
                avalanche: { AVAX: 0.01, USDT: 0.5, USDC: 0.5 },
                bitcoin: { BTC: 0.0001 },
            };
            
            const platformFeePercent = PAYMENT_CONFIG.CRYPTO.WITHDRAWAL_FEE_PERCENT;
            const networkFee = baseFees[chain]?.[token] || 1;
            const platformFee = amount * (platformFeePercent / 100);
            
            return {
                success: true,
                data: {
                    network_fee: networkFee,
                    network_fee_token: token,
                    platform_fee: platformFee,
                    platform_fee_percent: platformFeePercent,
                    total_fee: networkFee + platformFee,
                    you_receive: amount - networkFee - platformFee,
                    estimated_time: chain === 'bitcoin' ? '30-60 minutes' : '5-15 minutes',
                },
            };
        } catch (error) {
            console.error('Estimate Fee Error:', error);
            return { success: false, error: 'Failed to estimate fees' };
        }
    },
    
    /**
     * Create withdrawal request
     */
    async createWithdrawal(data) {
        const { userId, chain, token, amount, destinationAddress, memo } = data;
        
        try {
            // Validate inputs
            if (!PAYMENT_CONFIG.CRYPTO.SUPPORTED_CHAINS[chain]) {
                return { success: false, error: 'Unsupported chain' };
            }
            
            const minWithdrawal = PAYMENT_CONFIG.CRYPTO.MIN_WITHDRAWAL[token] || PAYMENT_CONFIG.CRYPTO.MIN_WITHDRAWAL.default;
            if (amount < minWithdrawal) {
                return { success: false, error: `Minimum withdrawal is ${minWithdrawal} ${token}` };
            }
            
            // Validate address format (basic validation)
            const addressValidation = this.validateAddress(destinationAddress, chain);
            if (!addressValidation.valid) {
                return { success: false, error: addressValidation.error };
            }
            
            // Calculate fees
            const feeEstimate = await this.estimateWithdrawalFee(chain, token, amount);
            if (!feeEstimate.success) {
                return feeEstimate;
            }
            
            // In production, this would:
            // 1. Check user balance
            // 2. Create pending withdrawal in database
            // 3. Submit to Fireblocks/BitGo for signing
            // 4. Return transaction ID
            
            const withdrawalId = generateReference('CW');
            
            return {
                success: true,
                data: {
                    withdrawal_id: withdrawalId,
                    status: 'pending',
                    chain,
                    chain_name: PAYMENT_CONFIG.CRYPTO.SUPPORTED_CHAINS[chain].name,
                    token,
                    amount,
                    destination_address: destinationAddress,
                    memo,
                    network_fee: feeEstimate.data.network_fee,
                    platform_fee: feeEstimate.data.platform_fee,
                    total_fee: feeEstimate.data.total_fee,
                    you_receive: feeEstimate.data.you_receive,
                    estimated_time: feeEstimate.data.estimated_time,
                    created_at: new Date().toISOString(),
                    confirmations_required: PAYMENT_CONFIG.CRYPTO.SUPPORTED_CHAINS[chain].confirmations,
                },
            };
        } catch (error) {
            console.error('Create Withdrawal Error:', error);
            return { success: false, error: 'Withdrawal creation failed' };
        }
    },
    
    /**
     * Validate cryptocurrency address
     */
    validateAddress(address, chain) {
        const patterns = {
            ethereum: /^0x[a-fA-F0-9]{40}$/,
            bsc: /^0x[a-fA-F0-9]{40}$/,
            polygon: /^0x[a-fA-F0-9]{40}$/,
            arbitrum: /^0x[a-fA-F0-9]{40}$/,
            optimism: /^0x[a-fA-F0-9]{40}$/,
            avalanche: /^0x[a-fA-F0-9]{40}$/,
            tron: /^T[a-zA-Z0-9]{33}$/,
            solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
            bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
        };
        
        const pattern = patterns[chain];
        if (!pattern) {
            return { valid: false, error: 'Unsupported chain for validation' };
        }
        
        if (!pattern.test(address)) {
            return { valid: false, error: `Invalid ${chain} address format` };
        }
        
        return { valid: true };
    },
    
    /**
     * Get real-time crypto prices
     */
    async getPrices(tokens = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL']) {
        try {
            // In production, fetch from CoinGecko, CoinMarketCap, or Binance API
            // Demo prices
            const demoPrices = {
                BTC: { usd: 97500, change_24h: 2.5 },
                ETH: { usd: 3250, change_24h: 1.8 },
                USDT: { usd: 1.00, change_24h: 0.0 },
                USDC: { usd: 1.00, change_24h: 0.0 },
                BNB: { usd: 625, change_24h: -0.5 },
                SOL: { usd: 195, change_24h: 5.2 },
                MATIC: { usd: 0.45, change_24h: -1.2 },
                TRX: { usd: 0.24, change_24h: 0.8 },
                AVAX: { usd: 38, change_24h: 3.1 },
                DAI: { usd: 1.00, change_24h: 0.0 },
            };
            
            const prices = {};
            tokens.forEach(token => {
                if (demoPrices[token]) {
                    prices[token] = demoPrices[token];
                }
            });
            
            return {
                success: true,
                data: {
                    prices,
                    timestamp: new Date().toISOString(),
                },
            };
        } catch (error) {
            console.error('Get Prices Error:', error);
            return { success: false, error: 'Failed to fetch prices' };
        }
    },
    
    /**
     * Process webhook from crypto payment provider
     */
    async processWebhook(provider, payload, signature) {
        try {
            // Verify webhook signature based on provider
            // Process deposit confirmation
            // Update user balance
            // Send notification
            
            return { success: true, message: 'Webhook processed' };
        } catch (error) {
            console.error('Webhook Processing Error:', error);
            return { success: false, error: 'Webhook processing failed' };
        }
    },
};

// ============================================================================
// EXPRESS ROUTER - PAYMENT ENDPOINTS
// ============================================================================

const paymentGatewayRouter = express.Router();

// Middleware for authentication (should be imported from main server)
const authenticateToken = (req, res, next) => {
    // Placeholder - import from main server
    next();
};

// ----------------------
// PAYSTACK ENDPOINTS
// ----------------------

paymentGatewayRouter.post('/paystack/initialize', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, email, metadata, channels } = req.body;
        
        const result = await PayStackService.initializeTransaction({
            email: email || req.user?.email,
            amount,
            currency: currency || 'NGN',
            metadata: {
                ...metadata,
                user_id: req.user?._id?.toString(),
            },
            channels,
        });
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('PayStack Initialize Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Payment initialization failed' });
    }
});

paymentGatewayRouter.get('/paystack/verify/:reference', authenticateToken, async (req, res) => {
    try {
        const { reference } = req.params;
        const result = await PayStackService.verifyTransaction(reference);
        res.json(result);
    } catch (error) {
        console.error('PayStack Verify Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

paymentGatewayRouter.post('/paystack/transfer', authenticateToken, async (req, res) => {
    try {
        const { amount, recipient_code, reason, currency } = req.body;
        const result = await PayStackService.initiateTransfer({
            amount,
            recipient_code,
            reason,
            currency,
        });
        res.json(result);
    } catch (error) {
        console.error('PayStack Transfer Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Transfer failed' });
    }
});

paymentGatewayRouter.get('/paystack/banks/:country?', async (req, res) => {
    try {
        const { country } = req.params;
        const result = await PayStackService.getBanks(country || 'nigeria');
        res.json(result);
    } catch (error) {
        console.error('PayStack Banks Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch banks' });
    }
});

paymentGatewayRouter.post('/paystack/resolve-account', authenticateToken, async (req, res) => {
    try {
        const { account_number, bank_code } = req.body;
        const result = await PayStackService.resolveAccount(account_number, bank_code);
        res.json(result);
    } catch (error) {
        console.error('PayStack Resolve Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Account resolution failed' });
    }
});

paymentGatewayRouter.post('/paystack/mobile-money', authenticateToken, async (req, res) => {
    try {
        const { email, amount, currency, phone, provider, metadata } = req.body;
        const result = await PayStackService.chargeMobileMoney({
            email: email || req.user?.email,
            amount,
            currency,
            phone,
            provider,
            metadata,
        });
        res.json(result);
    } catch (error) {
        console.error('PayStack Mobile Money Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Mobile money charge failed' });
    }
});

// PayStack Webhook
paymentGatewayRouter.post('/webhooks/paystack', express.json(), async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];
        
        if (!verifyPaystackWebhook(req.body, signature)) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        const event = req.body;
        console.log('PayStack Webhook Event:', event.event);
        
        switch (event.event) {
            case 'charge.success':
                // Handle successful payment
                // Update transaction status
                // Credit user wallet
                break;
            case 'transfer.success':
                // Handle successful transfer
                break;
            case 'transfer.failed':
                // Handle failed transfer
                // Refund user balance
                break;
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('PayStack Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ----------------------
// FLUTTERWAVE ENDPOINTS
// ----------------------

paymentGatewayRouter.post('/flutterwave/initialize', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, customer, customizations, payment_options, meta } = req.body;
        
        const result = await FlutterwaveService.initializePayment({
            amount,
            currency: currency || 'NGN',
            customer: {
                email: customer?.email || req.user?.email,
                name: customer?.name || req.user?.name,
                phone: customer?.phone || req.user?.phone,
            },
            customizations,
            payment_options,
            meta: {
                ...meta,
                user_id: req.user?._id?.toString(),
            },
        });
        
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Initialize Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Payment initialization failed' });
    }
});

paymentGatewayRouter.get('/flutterwave/verify/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const result = await FlutterwaveService.verifyTransaction(transactionId);
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Verify Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

paymentGatewayRouter.post('/flutterwave/transfer', authenticateToken, async (req, res) => {
    try {
        const { bank_code, account_number, amount, currency, narration, beneficiary_name } = req.body;
        const result = await FlutterwaveService.createTransfer({
            bank_code,
            account_number,
            amount,
            currency,
            narration,
            beneficiary_name,
        });
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Transfer Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Transfer failed' });
    }
});

paymentGatewayRouter.get('/flutterwave/banks/:country?', async (req, res) => {
    try {
        const { country } = req.params;
        const result = await FlutterwaveService.getBanks(country || 'NG');
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Banks Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch banks' });
    }
});

paymentGatewayRouter.post('/flutterwave/verify-account', authenticateToken, async (req, res) => {
    try {
        const { account_number, account_bank } = req.body;
        const result = await FlutterwaveService.verifyAccount(account_number, account_bank);
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Verify Account Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Account verification failed' });
    }
});

paymentGatewayRouter.post('/flutterwave/mpesa', authenticateToken, async (req, res) => {
    try {
        const { amount, phone_number, email, fullname } = req.body;
        const result = await FlutterwaveService.chargeMpesa({
            amount,
            phone_number,
            email: email || req.user?.email,
            fullname: fullname || req.user?.name,
        });
        res.json(result);
    } catch (error) {
        console.error('Flutterwave M-Pesa Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'M-Pesa charge failed' });
    }
});

paymentGatewayRouter.post('/flutterwave/mobile-money-ghana', authenticateToken, async (req, res) => {
    try {
        const { amount, phone_number, email, network } = req.body;
        const result = await FlutterwaveService.chargeMobileMoneyGhana({
            amount,
            phone_number,
            email: email || req.user?.email,
            network,
        });
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Ghana MoMo Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Mobile money charge failed' });
    }
});

paymentGatewayRouter.post('/flutterwave/virtual-account', authenticateToken, async (req, res) => {
    try {
        const { amount, is_permanent, bvn, narration } = req.body;
        const result = await FlutterwaveService.createVirtualAccount({
            email: req.user?.email,
            amount,
            is_permanent,
            bvn,
            narration,
        });
        res.json(result);
    } catch (error) {
        console.error('Flutterwave Virtual Account Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Virtual account creation failed' });
    }
});

// Flutterwave Webhook
paymentGatewayRouter.post('/webhooks/flutterwave', express.json(), async (req, res) => {
    try {
        const signature = req.headers['verif-hash'];
        
        if (signature !== PAYMENT_CONFIG.FLUTTERWAVE.WEBHOOK_SECRET) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        const event = req.body;
        console.log('Flutterwave Webhook Event:', event.event);
        
        if (event.event === 'charge.completed' && event.data.status === 'successful') {
            // Handle successful payment
            // Update transaction status
            // Credit user wallet
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Flutterwave Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ----------------------
// KORAPAY ENDPOINTS
// ----------------------

paymentGatewayRouter.post('/korapay/initialize', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, customer, channels, metadata } = req.body;
        
        const result = await KorapayService.initializePayment({
            amount,
            currency: currency || 'NGN',
            customer: {
                email: customer?.email || req.user?.email,
                name: customer?.name || req.user?.name,
            },
            channels,
            metadata: {
                ...metadata,
                user_id: req.user?._id?.toString(),
            },
        });
        
        res.json(result);
    } catch (error) {
        console.error('Korapay Initialize Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Payment initialization failed' });
    }
});

paymentGatewayRouter.get('/korapay/verify/:reference', authenticateToken, async (req, res) => {
    try {
        const { reference } = req.params;
        const result = await KorapayService.verifyTransaction(reference);
        res.json(result);
    } catch (error) {
        console.error('Korapay Verify Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

paymentGatewayRouter.post('/korapay/payout', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, destination, narration } = req.body;
        const result = await KorapayService.createPayout({
            amount,
            currency,
            destination,
            narration,
        });
        res.json(result);
    } catch (error) {
        console.error('Korapay Payout Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Payout failed' });
    }
});

paymentGatewayRouter.get('/korapay/banks/:country?', async (req, res) => {
    try {
        const { country } = req.params;
        const result = await KorapayService.getBanks(country || 'NG');
        res.json(result);
    } catch (error) {
        console.error('Korapay Banks Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch banks' });
    }
});

paymentGatewayRouter.post('/korapay/resolve-account', authenticateToken, async (req, res) => {
    try {
        const { bank, account } = req.body;
        const result = await KorapayService.resolveAccount(bank, account);
        res.json(result);
    } catch (error) {
        console.error('Korapay Resolve Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Account resolution failed' });
    }
});

paymentGatewayRouter.post('/korapay/virtual-account', authenticateToken, async (req, res) => {
    try {
        const { account_name, permanent, bank_code } = req.body;
        const result = await KorapayService.createVirtualAccount({
            account_name,
            permanent,
            bank_code,
            customer: {
                name: req.user?.name,
                email: req.user?.email,
            },
        });
        res.json(result);
    } catch (error) {
        console.error('Korapay Virtual Account Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Virtual account creation failed' });
    }
});

// Korapay Webhook
paymentGatewayRouter.post('/webhooks/korapay', express.json(), async (req, res) => {
    try {
        const signature = req.headers['x-korapay-signature'];
        
        if (!verifyKorapayWebhook(req.body, signature)) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        const event = req.body;
        console.log('Korapay Webhook Event:', event.event);
        
        if (event.event === 'charge.success') {
            // Handle successful payment
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Korapay Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ----------------------
// CRYPTOCURRENCY ENDPOINTS
// ----------------------

paymentGatewayRouter.get('/crypto/supported-assets', (req, res) => {
    const assets = CryptoPaymentService.getSupportedAssets();
    res.json({ success: true, data: assets });
});

paymentGatewayRouter.post('/crypto/deposit-address', authenticateToken, async (req, res) => {
    try {
        const { chain, token } = req.body;
        const result = await CryptoPaymentService.generateDepositAddress(
            req.user?._id,
            chain,
            token
        );
        res.json(result);
    } catch (error) {
        console.error('Crypto Deposit Address Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate address' });
    }
});

paymentGatewayRouter.post('/crypto/estimate-fee', authenticateToken, async (req, res) => {
    try {
        const { chain, token, amount } = req.body;
        const result = await CryptoPaymentService.estimateWithdrawalFee(chain, token, amount);
        res.json(result);
    } catch (error) {
        console.error('Crypto Estimate Fee Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Failed to estimate fees' });
    }
});

paymentGatewayRouter.post('/crypto/withdraw', authenticateToken, async (req, res) => {
    try {
        const { chain, token, amount, destination_address, memo } = req.body;
        const result = await CryptoPaymentService.createWithdrawal({
            userId: req.user?._id,
            chain,
            token,
            amount,
            destinationAddress: destination_address,
            memo,
        });
        res.json(result);
    } catch (error) {
        console.error('Crypto Withdraw Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Withdrawal failed' });
    }
});

paymentGatewayRouter.post('/crypto/validate-address', (req, res) => {
    try {
        const { address, chain } = req.body;
        const result = CryptoPaymentService.validateAddress(address, chain);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Crypto Validate Address Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Validation failed' });
    }
});

paymentGatewayRouter.get('/crypto/prices', async (req, res) => {
    try {
        const tokens = req.query.tokens?.split(',') || undefined;
        const result = await CryptoPaymentService.getPrices(tokens);
        res.json(result);
    } catch (error) {
        console.error('Crypto Prices Endpoint Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch prices' });
    }
});

// Crypto Webhooks (from providers like Fireblocks, NOWPayments)
paymentGatewayRouter.post('/webhooks/crypto/:provider', express.json(), async (req, res) => {
    try {
        const { provider } = req.params;
        const signature = req.headers['x-signature'] || req.headers['x-nowpayments-sig'];
        
        const result = await CryptoPaymentService.processWebhook(provider, req.body, signature);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Crypto Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Services
    PayStackService,
    FlutterwaveService,
    KorapayService,
    CryptoPaymentService,
    
    // Router
    paymentGatewayRouter,
    
    // Configuration
    PAYMENT_CONFIG,
    
    // Utilities
    generateReference,
    verifyPaystackWebhook,
    verifyFlutterwaveWebhook,
    verifyKorapayWebhook,
    toSmallestUnit,
    fromSmallestUnit,
};

/**
 * USAGE IN MAIN SERVER:
 * 
 * const { paymentGatewayRouter } = require('./mmitps-payment-gateways');
 * app.use('/api/v1/payments', paymentGatewayRouter);
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * 
 * # PayStack
 * PAYSTACK_SECRET_KEY=sk_live_xxxxx
 * PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
 * PAYSTACK_WEBHOOK_SECRET=xxxxx
 * 
 * # Flutterwave
 * FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
 * FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
 * FLUTTERWAVE_ENCRYPTION_KEY=xxxxx
 * FLUTTERWAVE_WEBHOOK_SECRET=xxxxx
 * 
 * # Korapay
 * KORAPAY_SECRET_KEY=sk_live_xxxxx
 * KORAPAY_PUBLIC_KEY=pk_live_xxxxx
 * KORAPAY_ENCRYPTION_KEY=xxxxx
 * KORAPAY_WEBHOOK_SECRET=xxxxx
 * 
 * # Crypto
 * FIREBLOCKS_API_KEY=xxxxx
 * FIREBLOCKS_API_SECRET=xxxxx
 * FIREBLOCKS_VAULT_ID=0
 * COINBASE_COMMERCE_KEY=xxxxx
 * NOWPAYMENTS_API_KEY=xxxxx
 * 
 * # General
 * WEBHOOK_BASE_URL=https://api.mmitps.com/webhooks
 * REDIRECT_BASE_URL=https://mmitps.com
 */
