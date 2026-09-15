/**
 * InvestmentService — PostgreSQL edition.
 */
const InvestmentRepository = require('../../repositories/pg/InvestmentRepository');
const TokenPoolRepository = require('../../repositories/pg/TokenPoolRepository');
const WalletService = require('./WalletService');
const ApiError = require('../../utils/ApiError');

class InvestmentService {
  async invest(userId, poolId, amount) {
    // 1. Get Pool
    const pool = await TokenPoolRepository.findById(poolId);
    if (!pool) throw new ApiError(404, 'Pool not found');
    if (pool.status !== 'open') throw new ApiError(400, 'Pool is not open for investment');

    // 2. Calculate Tokens
    const tokensToBuy = amount / Number(pool.tokenPrice);
    if (tokensToBuy < Number(pool.minInvestment || 1)) throw new ApiError(400, `Minimum investment is ${pool.minInvestment} tokens`);

    // 3. Check Supply
    if (Number(pool.tokensSold || 0) + tokensToBuy > Number(pool.totalTokenSupply)) {
      throw new ApiError(400, 'Not enough tokens remaining');
    }

    // 4. Process Payment (Withdraw from Wallet)
    await WalletService.withdraw(userId, amount, 'USD', {
      bank: 'System',
      account: 'TokenInvestment'
    });

    // 5. Create Investment Record
    const investment = await InvestmentRepository.create({
      userId,
      poolId,
      tokensPurchased: tokensToBuy,
      amountInvested: amount,
      status: 'active'
    });

    // 6. Update Pool Stats
    await TokenPoolRepository.update(poolId, {
      tokensSold: Number(pool.tokensSold || 0) + tokensToBuy
    });

    return investment;
  }

  async getUserInvestments(userId) {
    return InvestmentRepository.findByUser(userId);
  }

  /**
   * Liquidate a pool and return capital to investors
   */
  async liquidatePool(poolId) {
    const pool = await TokenPoolRepository.findById(poolId);
    if (!pool) throw new ApiError(404, 'Pool not found');

    const investments = await InvestmentRepository.findActiveByPool(poolId);

    console.log(`Liquidating pool ${poolId} for ${investments.length} investors`);

    for (const inv of investments) {
      const returnAmount = Number(inv.amountInvested);

      await WalletService.deposit(inv.userId, returnAmount, 'USD', {
        bank: 'System',
        account: 'TokenLiquidation',
        reference: `Liquidation return for ${pool.name}`
      });

      await InvestmentRepository.update(inv.id, { status: 'cancelled' });
    }

    await TokenPoolRepository.update(poolId, {
      status: 'closed'
    });

    return { success: true, investorsProcessed: investments.length };
  }

  /**
   * Distribute earned profits to token holders
   */
  async distributeProfits(poolId, totalProfit) {
    const pool = await TokenPoolRepository.findById(poolId);
    if (!pool) throw new ApiError(404, 'Pool not found');

    const investments = await InvestmentRepository.findActiveByPool(poolId);
    if (investments.length === 0) return { success: true, message: 'No investors to distribute to' };

    // Ratio per token: totalProfit / tokensSold
    const profitPerToken = totalProfit / Number(pool.tokensSold || 0);

    for (const inv of investments) {
      const share = Number(inv.tokensPurchased) * profitPerToken;

      await WalletService.deposit(inv.userId, share, 'USD', {
        bank: 'System',
        account: 'StakingRewards',
        reference: `Profit share from ${pool.name}`
      });

      // Update investment PnL
      await InvestmentRepository.update(inv.id, {
        dividendsEarned: Number(inv.dividendsEarned || 0) + share
      });
    }

    return { success: true, totalDistributed: totalProfit };
  }
}

module.exports = new InvestmentService();