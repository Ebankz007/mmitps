const SystemConfigRepository = require('../repositories/pg/SystemConfigRepository');
const logger = require('../utils/logger');

class ApiServiceManager {
    constructor() {
        this.configKey = 'api_service_manager';
    }

    /**
     * Get the global API configuration (PostgreSQL edition)
     */
    async getConfig() {
        let config = await SystemConfigRepository.findByKey(this.configKey);

        if (!config) {
            // Initialize with default settings if not exists
            config = await SystemConfigRepository.create({
                key: this.configKey,
                category: 'integrations',
                description: 'Global API Service Manager settings',
                value: {
                    mockMode: true, // Default to true for safety/presentation
                    providers: {
                        alphaVantage: { key: '', status: 'active', priority: 1 },
                        twelveData: { key: '', status: 'active', priority: 2 },
                        coinMarketCap: { key: '', status: 'active', priority: 1 },
                        binance: { key: '', status: 'active', priority: 1 },
                        barchart: { key: process.env.BARCHART_API_KEY || '', status: 'active', priority: 1 }
                    },
                    email: {
                        host: process.env.SMTP_HOST || 'smtp.gmail.com',
                        port: process.env.SMTP_PORT || 587,
                        secure: process.env.SMTP_SECURE === 'true',
                        user: process.env.SMTP_USER || '',
                        pass: process.env.SMTP_PASS || '',
                        fromName: 'MMITPS Academy'
                    },
                    payments: {
                        stripe: {
                            secretKey: process.env.STRIPE_SECRET_KEY || '',
                            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
                            status: 'active'
                        },
                        cellulant: {
                            clientId: process.env.CELLULANT_CLIENT_ID || '',
                            clientSecret: process.env.CELLULANT_CLIENT_SECRET || '',
                            serviceCode: process.env.CELLULANT_SERVICE_CODE || '',
                            accessKey: process.env.CELLULANT_ACCESS_KEY || '',
                            status: 'inactive'
                        },
                        coinpayments: {
                            merchantId: process.env.COINPAYMENTS_MERCHANT_ID || '',
                            ipnSecret: process.env.COINPAYMENTS_IPN_SECRET || '',
                            status: 'inactive'
                        },
                        korapay: {
                            secretKey: process.env.KORAPAY_SECRET_KEY || '',
                            publicKey: process.env.KORAPAY_PUBLIC_KEY || '',
                            encryptionKey: process.env.KORAPAY_ENCRYPTION_KEY || '',
                            status: 'inactive'
                        },
                        crypto: {
                            btcAddress: '',
                            ethAddress: '',
                            usdtAddress: '',
                            network: 'ERC20'
                        }
                    },
                    vps: {
                        provider: 'default',
                        apiKey: '',
                        apiSecret: '',
                        endpoint: '',
                        status: 'inactive'
                    },
                    ai: {
                        openai: {
                            apiKey: process.env.OPENAI_API_KEY || '',
                            model: 'gpt-4-turbo-preview',
                            status: 'active'
                        },
                        anthropic: {
                            apiKey: '',
                            model: 'claude-3-opus-20240229',
                            status: 'inactive'
                        }
                    },
                    livestream: {
                        activeProvider: 'mux',
                        mux: {
                            tokenId: process.env.MUX_TOKEN_ID || '',
                            tokenSecret: process.env.MUX_TOKEN_SECRET || '',
                            webhookSecret: process.env.MUX_WEBHOOK_SECRET || '',
                            status: 'active'
                        },
                        awsIvs: {
                            accessKeyId: process.env.AWS_IVS_ACCESS_KEY || '',
                            secretAccessKey: process.env.AWS_IVS_SECRET_KEY || '',
                            region: process.env.AWS_IVS_REGION || 'us-east-1',
                            channelArn: process.env.AWS_IVS_CHANNEL_ARN || '',
                            status: 'inactive'
                        }
                    },
                    marketFeeds: {
                        refreshInterval: 60000, // 1 minute
                        enableSocketUpdates: true,
                        activeProviders: ['alphaVantage', 'binance']
                    },
                    fundamentalAnalysis: {
                        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS', 'THB', 'RON'],
                        indicators: [
                            { name: 'CPI YoY', weight: 20 },
                            { name: 'Core CPI YoY', weight: 15 },
                            { name: 'GDP QoQ', weight: 20 },
                            { name: 'Interest Rate', weight: 25 },
                            { name: 'Unemployment Rate', weight: 10 },
                            { name: 'Average Hourly Earnings', weight: 10 },
                            { name: 'Core Retail Sales MoM', weight: 5 },
                            { name: 'ISM MPMI', weight: 5 },
                            { name: 'ISM SPMI', weight: 5 },
                            { name: 'Consumer Confidence', weight: 5 },
                            { name: 'Trade Balance', weight: 10 }
                        ]
                    },
                    marketInstruments: {
                        'Forex': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'EURGBP', 'GBPJPY', 'AUDJPY', 'NZDUSD'],
                        'Commodities': ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NGAS', 'XPTUSD', 'XPDUSD'],
                        'Indices': ['US30', 'US100', 'US500', 'GER40', 'UK100', 'NIKKEI', 'FRA40', 'ESP35'],
                        'Crypto': ['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD', 'XRPUSD', 'ADAUSD', 'DOTUSD', 'LINKUSD'],
                        'Stocks': ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD']
                    },
                    rateLimits: {
                        'Basic': 100,
                        'Pro': 1000,
                        'Institutional': 10000
                    }
                }
            });
        }

        return config.value;
    }

    /**
     * Get the global API configuration with sensitive keys masked (for frontend/admin display)
     */
    async getMaskedConfig() {
        const rawConfig = await this.getConfig();
        // deep clone to avoid mutating the in-memory object
        const masked = JSON.parse(JSON.stringify(rawConfig));

        const maskString = (str) => {
            if (!str || typeof str !== 'string') return str;
            if (str.length <= 8) return '********';
            return `${str.substring(0, 4)}......${str.substring(str.length - 4)}`;
        };

        const maskObjectKeys = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            for (const key in obj) {
                if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('pass')) {
                    if (obj[key] !== '') obj[key] = maskString(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    maskObjectKeys(obj[key]);
                }
            }
        };

        maskObjectKeys(masked);
        return masked;
    }

    /**
     * Update global config (PostgreSQL edition)
     */
    async updateConfig(newValue, userId) {
        const existing = await SystemConfigRepository.findByKey(this.configKey);
        const data = {
            value: newValue,
            lastModifiedById: userId
        };

        let config;
        if (existing) {
            config = await SystemConfigRepository.update(existing.id, data);
        } else {
            config = await SystemConfigRepository.create({
                key: this.configKey,
                category: 'integrations',
                description: 'Global API Service Manager settings',
                ...data
            });
        }

        logger.info(`API Service Manager config updated by ${userId}`);
        return config.value;
    }

    /**
     * Check if Mock Mode is enabled
     */
    async isMockMode() {
        const config = await this.getConfig();
        return config.mockMode === true;
    }

    /**
     * Get key for a specific provider
     */
    async getProviderKey(provider) {
        const config = await this.getConfig();
        return config.providers[provider]?.key || '';
    }

    /**
     * Toggle Mock Mode
     */
    async toggleMockMode(enabled, userId) {
        const config = await this.getConfig();
        config.mockMode = enabled;
        return this.updateConfig(config, userId);
    }

    /**
     * Add a new service dynamically to a configuration category
     * @param {string} category - Category (providers, ai, marketFeeds, vps, email)
     * @param {string} name - Internal name for the service
     * @param {Object} data - Service configuration data
     * @param {string} userId - ID of the user performing the action
     */
    async addService(category, name, data, userId) {
        const config = await this.getConfig();

        if (!config[category]) {
            config[category] = {};
        }

        if (config[category][name]) {
            throw new Error(`Service ${name} already exists in ${category}`);
        }

        config[category][name] = {
            ...data,
            status: data.status || 'active',
            addedAt: new Date(),
            addedBy: userId
        };

        return await this.updateConfig(config, userId);
    }

    /**
     * Update a specific service dynamically
     */
    async updateService(category, name, data, userId) {
        const config = await this.getConfig();

        if (!config[category] || !config[category][name]) {
            throw new Error(`Service ${name} not found in ${category}`);
        }

        // Merge properties without overwriting nested objects destructively
        config[category][name] = {
            ...config[category][name],
            ...data,
            lastModifiedAt: new Date(),
            lastModifiedBy: userId
        };

        return await this.updateConfig(config, userId);
    }

    /**
     * Remove a specific service
     */
    async removeService(category, name, userId) {
        const config = await this.getConfig();

        if (!config[category] || !config[category][name]) {
            throw new Error(`Service ${name} not found in ${category}`);
        }

        delete config[category][name];

        return await this.updateConfig(config, userId);
    }

    /**
     * Update the status of a specific service
     */
    async updateServiceStatus(category, name, status, userId) {
        const config = await this.getConfig();

        if (!config[category] || !config[category][name]) {
            throw new Error(`Service ${name} not found in ${category}`);
        }

        config[category][name].status = status;

        return await this.updateConfig(config, userId);
    }

    /**
     * Update a top-level configuration section (e.g. marketFeeds, fundamentalAnalysis)
     */
    async updateSection(section, data, userId) {
        const config = await this.getConfig();

        if (!config[section]) {
            throw new Error(`Section ${section} not found in configuration`);
        }

        config[section] = {
            ...config[section],
            ...data,
            lastModifiedAt: new Date(),
            lastModifiedBy: userId
        };

        return await this.updateConfig(config, userId);
    }

    /**
     * Update a specific nested property using dot notation (e.g. 'payments.stripe')
     */
    async updateNestedProperty(path, data, userId) {
        const config = await this.getConfig();
        const keys = path.split('.');
        let target = config;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        target[lastKey] = typeof data === 'object' && data !== null && !Array.isArray(data)
            ? { ...target[lastKey], ...data }
            : data;

        return await this.updateConfig(config, userId);
    }
}

module.exports = new ApiServiceManager();
