const ApiServiceManager = require('../ApiServiceManager');

class ContractCalendarService {
    /**
     * Get summary stats for the contracts dashboard
     */
    async getContractStats() {
        // In a real implementation, this would query a database of contract schedules
        // For MMITPS, we simulate institutional data
        return {
            expiringSoon: 3,
            inRollover: 5,
            activeContracts: 42,
            thisMonth: 8
        };
    }

    /**
     * Get critical rollover alerts
     */
    async getCriticalAlerts() {
        return [
            {
                id: 'alert-1',
                symbol: 'CL (WTI)',
                message: '3 contracts expiring: ES (Feb 21), NQ (Feb 21), GC (Feb 26)',
                type: 'critical',
                expiryDate: '2026-02-21'
            }
        ];
    }

    /**
     * Get calendar event markers for a specific month
     * @param {number} year 
     * @param {number} month (1-12)
     */
    async getCalendarData(year, month) {
        // Simulate high-fidelity calendar markers
        // markers: { [day]: [{ type, label, symbol }] }
        // types: 'exp' (Expiration), 'roll' (Rollover), 'fnd' (First Notice Day), 'set' (Settlement)

        const markers = {
            12: [{ type: 'roll', label: 'Rollover', symbol: 'ES/NQ' }],
            20: [{ type: 'fnd', label: 'First Notice Day', symbol: 'CL' }],
            21: [
                { type: 'exp', label: 'Expiration', symbol: 'ES' },
                { type: 'exp', label: 'Expiration', symbol: 'NQ' }
            ],
            26: [{ type: 'exp', label: 'Expiration', symbol: 'GC' }]
        };

        return {
            year,
            month,
            markers
        };
    }

    /**
     * Get detailed expiration schedule table data
     * @param {number} year 
     * @param {number} month 
     */
    async getExpirationSchedule(year, month) {
        // ... (existing implementation)
        return [
            {
                contract: 'E-mini S&P 500',
                symbol: 'ESH26',
                firstNotice: 'Feb 20',
                lastTrade: 'Feb 21',
                expiration: 'Feb 21',
                status: 'Expiring',
                color: 'text-cyan-400'
            },
            {
                contract: 'E-mini Nasdaq',
                symbol: 'NQH26',
                firstNotice: 'Feb 20',
                lastTrade: 'Feb 21',
                expiration: 'Feb 21',
                status: 'Expiring',
                color: 'text-cyan-400'
            },
            {
                contract: 'Gold',
                symbol: 'GCG26',
                firstNotice: 'Feb 25',
                lastTrade: 'Feb 26',
                expiration: 'Feb 26',
                status: 'FND Soon',
                color: 'text-amber-500'
            },
            {
                contract: 'Crude Oil',
                symbol: 'CLH26',
                firstNotice: 'Feb 12',
                lastTrade: 'Feb 20',
                expiration: 'Feb 20',
                status: 'In Rollover',
                color: 'text-red-500'
            },
            {
                contract: 'Euro FX',
                symbol: '6EH26',
                firstNotice: 'Mar 13',
                lastTrade: 'Mar 16',
                expiration: 'Mar 16',
                status: 'Active',
                color: 'text-brand-500'
            }
        ];
    }

    /**
     * Get user's planner watchlist
     */
    async getPlannerWatchlist() {
        return [
            {
                symbol: 'ESH26',
                name: 'E-mini S&P 500 - March 2026',
                status: 'EXPIRING SOON',
                statusType: 'critical',
                daysLeft: 5,
                expiryDate: 'Feb 21',
                rollTarget: 'ESM26'
            },
            {
                symbol: 'GCG26',
                name: 'Gold - February 2026',
                status: 'FND APPROACHING',
                statusType: 'warning',
                daysLeft: 12,
                expiryDate: 'Feb 25'
            },
            {
                symbol: 'CLJ26',
                name: 'Crude Oil - April 2026',
                status: 'ACTIVE',
                statusType: 'success',
                daysLeft: 45,
                expiryDate: 'Mar 20'
            },
            {
                symbol: '6EM26',
                name: 'Euro FX - June 2026',
                status: 'ACTIVE',
                statusType: 'success',
                daysLeft: 108,
                expiryDate: 'Jun 16'
            }
        ];
    }

    /**
     * Get contract specs for calculator
     */
    async getContractSpecs() {
        return [
            { id: 'es', name: 'ES - E-mini S&P 500', tickValue: 12.50, tickSize: 0.25, margin: 12650 },
            { id: 'nq', name: 'NQ - E-mini Nasdaq 100', tickValue: 5.00, tickSize: 0.25, margin: 17600 },
            { id: 'gc', name: 'GC - Gold', tickValue: 10.00, tickSize: 0.1, margin: 9900 },
            { id: 'cl', name: 'CL - Crude Oil', tickValue: 10.00, tickSize: 0.01, margin: 7700 },
            { id: '6e', name: '6E - Euro FX', tickValue: 6.25, tickSize: 0.00005, margin: 2530 }
        ];
    }
}

module.exports = new ContractCalendarService();
