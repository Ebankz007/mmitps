const UserRepository = require('../../repositories/UserRepository');
const TransactionRepository = require('../../repositories/TransactionRepository');
const SubscriptionRepository = require('../../repositories/SubscriptionRepository');
const SignalRepository = require('../../repositories/SignalRepository');

class AnalyticsService {
    async getOverview() {
        // Aggregate high-level stats
        const totalUsers = await UserRepository.model.countDocuments();
        const activeSubscriptions = await SubscriptionRepository.model.countDocuments({ status: 'active' });

        // Simple aggregation for revenue (sum of successful transactions with type 'deposit' or similar)
        const revenueData = await TransactionRepository.model.aggregate([
            { $match: { status: 'success', type: 'deposit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        return {
            users: { total: totalUsers },
            subscriptions: { active: activeSubscriptions },
            financial: { totalRevenue },
            timestamp: new Date()
        };
    }

    async getUserStats() {
        const stats = await UserRepository.model.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        return stats;
    }

    async getTradingStats() {
        const totalSignals = await SignalRepository.model.countDocuments();
        const activeSignals = await SignalRepository.model.countDocuments({ status: 'active' });
        return { totalSignals, activeSignals };
    }
}

module.exports = new AnalyticsService();
