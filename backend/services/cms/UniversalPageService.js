const COTService = require('../trading/COTService');
const SeasonalityService = require('../trading/SeasonalityService');
const FundamentalService = require('../pg/FundamentalService');
const ApiServiceManager = require('../ApiServiceManager');

class UniversalPageService {
    async getPageContext(pageId, userId) {
        const context = {
            pageId,
            timestamp: new Date(),
            config: await this.getGlobalConfig(),
            data: {}
        };

        // 1. Calculators (calc-*)
        if (pageId.startsWith('calc-')) {
            context.data = await this.getCalculatorContext(pageId);
        }
        // 2. Strategies (strat-*)
        else if (pageId.startsWith('strat-')) {
            context.data = await this.getStrategyContext(pageId);
        }
        // 3. COT Data
        else if (pageId.includes('cot-')) {
            const asset = this.extractAsset(pageId) || 'EUR';
            context.data = await COTService.getLatestReport(asset);
        }
        // 4. Seasonality
        else if (pageId.includes('seasonality')) {
            const asset = this.extractAsset(pageId) || 'EURUSD';
            context.data = await SeasonalityService.getSeasonality(asset);
        }
        // 5. Macro/Fundamental
        else if (pageId === 'global-macro' || pageId === 'currency-outlook') {
            context.data = await FundamentalService.getStrengthScores();
        }

        return context;
    }

    async getGlobalConfig() {
        return {
            isMockMode: await ApiServiceManager.isMockMode(),
            defaultCurrency: 'USD',
            refreshInterval: 300000
        };
    }

    async getCalculatorContext(pageId) {
        // Return constants and settings for specific calculators
        return {
            type: 'financial_calculator',
            subType: pageId.replace('calc-', ''),
            precision: 2,
            constants: {
                standardLotSize: 100000,
                pipValueDecimal: 0.0001
            }
        };
    }

    async getStrategyContext(pageId) {
        // Fetch strategy content from CMS or Mock
        return {
            title: pageId.replace('strat-', '').toUpperCase().replace('-', ' '),
            difficulty: 'Intermediate',
            winRate: '65%',
            content: `This is a dynamic strategy guide for ${pageId}. It includes entry/exit rules and risk management settings.`
        };
    }

    extractAsset(pageId) {
        // Simple heuristic to extract asset from ID like 'cot-gold' or 'seasonality-eurusd'
        const parts = pageId.split('-');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
    }
}

module.exports = new UniversalPageService();
