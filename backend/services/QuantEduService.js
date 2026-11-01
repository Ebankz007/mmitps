class QuantEduService {
    constructor() {
    }

    /**
     * Get Quant Methodology educational content
     * @returns {Object} Educational modules and data
     */
    async getEduGuideContent() {
        return {
            pillars: [
                { id: 'risk', title: 'Risk Metrics', val: 'Shielding capital pools' },
                { id: 'yield', title: 'Yields', val: 'Cost of Money analysis' },
                { id: 'strategy', title: 'Strategies', val: 'Algorithmic alpha' },
                { id: 'mental', title: 'Mentality', val: 'Rule-based execution' }
            ],
            concepts: [
                'Price Action & Volume',
                'RR Ratios',
                'Margin Allocation',
                'Execution Criteria',
                'Asset Correlation',
                'Trade Visualization'
            ]
        };
    }
}

module.exports = new QuantEduService();
