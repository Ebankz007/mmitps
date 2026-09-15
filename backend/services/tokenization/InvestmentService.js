const InvestmentRepository = require('../../repositories/InvestmentRepository');
const TokenPoolRepository = require('../../repositories/TokenPoolRepository');
const WalletService = require('../financial/WalletService');
const ApiError = require('../../utils/ApiError');

class InvestmentService {

    async invest(userId, poolId, amount) {
        // 1. Get Pool
        const pool = await TokenPoolRepository.findById(poolId);
        if (!pool) throw new ApiError(404, 'Pool not found');
        if (pool.status !== 'open') throw new ApiError(400, 'Pool is not open for investment');

        // 2. Calculate Tokens
        const tokensToBuy = amount / pool.tokenPrice;
        if (tokensToBuy < pool.minInvestment) throw new ApiError(400, `Minimum investment is ${pool.minInvestment} tokens`);

        // 3. Check Supply
        if (pool.tokensSold + tokensToBuy > pool.totalTokenSupply) {
            throw new ApiError(400, 'Not enough tokens remaining');
        }

        // 4. Process Payment (Withdraw from Wallet)
        // Using WalletService to handle the balance deduction
        await WalletService.withdraw(userId, amount, 'USD', {
            bank: 'System',
            account: 'TokenInvestment'
        });

        // 5. Create Investment Record
        const investment = await InvestmentRepository.create({
            user: userId,
            pool: poolId,
            tokensPurchased: tokensToBuy,
            amountInvested: amount,
            status: 'active'
        });

        // 6. Update Pool Stats
        await TokenPoolRepository.update(poolId, {
            tokensSold: pool.tokensSold + tokensToBuy
        });

        return investment;
    }

    async getUserInvestments(userId) {
        return InvestmentRepository.findByUser(userId);
    }

    /**
     * Liquidate a pool and return capital to investors
     * @param {string} poolId - The ID of the pool to liquidate
     */
    async liquidatePool(poolId) {
        const pool = await TokenPoolRepository.findById(poolId);
        if (!pool) throw new ApiError(404, 'Pool not found');

        // 1. Get all active investments for this pool
        const investments = await InvestmentRepository.find({ pool: poolId, status: 'active' });

        logger.info(`Liquidating pool ${poolId} for ${investments.length} investors`);

        // 2. Process returns for each investor
        await Promise.all(investments.map(async (inv) => {
            // Return capital: amountInvested
            // In a real scenario, we'd calculate current value based on pool performance
            const returnAmount = inv.amountInvested;

            await WalletService.deposit(inv.user, returnAmount, 'USD', {
                bank: 'System',
                account: 'TokenLiquidation',
                reference: `Liquidation return for ${pool.name}`
            });

            inv.status = 'closed';
            inv.closedAt = new Date();
            await inv.save();
        }));

        // 3. Update pool status
        await TokenPoolRepository.update(poolId, {
            status: 'closed',
            allowNewInvestments: false
        });

        return { success: true, investorsProcessed: investments.length };
    }

    /**
     * Distribute earned profits to token holders
     * @param {string} poolId 
     * @param {number} totalProfit - Total USD amount to distribute
     */
    async distributeProfits(poolId, totalProfit) {
        const pool = await TokenPoolRepository.findById(poolId);
        if (!pool) throw new ApiError(404, 'Pool not found');

        const investments = await InvestmentRepository.find({ pool: poolId, status: 'active' });
        if (investments.length === 0) return { success: true, message: 'No investors to distribute to' };

        // Ratio per token: totalProfit / tokensSold
        const profitPerToken = totalProfit / pool.tokensSold;

        await Promise.all(investments.map(async (inv) => {
            const share = inv.tokensPurchased * profitPerToken;

            await WalletService.deposit(inv.user, share, 'USD', {
                bank: 'System',
                account: 'StakingRewards',
                reference: `Profit share from ${pool.name}`
            });

            // Update investment PnL
            inv.dividendsEarned = (inv.dividendsEarned || 0) + share;
            await inv.save();
        }));

        return { success: true, totalDistributed: totalProfit };
    }
}

module.exports = new InvestmentService();
