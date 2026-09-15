const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/pg/auth');
const TierService = require('../../services/pg/TierService');
const TierRepository = require('../../repositories/pg/TierRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const ApiError = require('../../utils/ApiError');

router.use(protect);

/**
 * @route   GET /api/v1/financial/upgrade/info
 * @desc    Get all available upgrade paths and current locked balance
 * @access  Private
 */
router.get('/info', async (req, res, next) => {
    try {
        const user = await UserRepository.findById(req.user.id);

        let availableTiers = [];
        if (user.tierId) {
            const currentTier = await TierRepository.findById(user.tierId);
            if (currentTier) {
                availableTiers = (await TierRepository.findAll({ isActive: true }, { sort: 'level' }))
                    .filter(t => t.level > currentTier.level);
            } else {
                availableTiers = await TierRepository.findActive();
            }
        } else {
            availableTiers = await TierRepository.findActive();
        }

        const currentTier = user.tierId ? await TierRepository.findById(user.tierId) : null;
        const paths = await Promise.all(availableTiers.map(async t => {
            const cost = TierService.calculateUpgradeCost(currentTier, t);
            return {
                tierId: t.id,
                code: t.code,
                name: t.name,
                level: t.level,
                proratedCost: cost,
                canAffordWithLockedBalance: Number(user.lockedWalletBalance || 0) >= cost
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                currentTier: currentTier ? currentTier.name : 'Unknown',
                lockedBalance: Number(user.lockedWalletBalance || 0),
                upgradePaths: paths
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/v1/financial/upgrade/locked-balance
 * @desc    Process a tier upgrade using locked commissions
 * @access  Private
 */
router.post('/locked-balance', async (req, res, next) => {
    try {
        const { targetTierId } = req.body;
        if (!targetTierId) throw new ApiError(400, 'targetTierId is required');

        // Check if exigency holds
        await TierService.checkLockedBalanceUpgradeExigency(req.user.id, targetTierId);

        // Perform transactional upgrade
        const result = await TierService.upgradeViaLockedBalance(req.user.id, targetTierId);

        res.status(200).json({
            success: true,
            message: `Successfully upgraded to ${result.newTier}`,
            data: result
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/v1/financial/upgrade/checkout
 * @desc    Generate a standard Stripe/Crypto payment intent to upgrade
 * @access  Private
 */
router.post('/checkout', async (req, res, next) => {
    try {
        const { targetTierId, method } = req.body;
        // In reality, this would bridge to Stripe or CoinPayments
        // For now, we simulate success for demonstration purposes
        await TierService.upgradeNormally(req.user.id, targetTierId);

        res.status(200).json({
            success: true,
            message: 'Tier upgrade payment mocked successfully!'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;