const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/pg/auth');
const TierRepository = require('../../repositories/pg/TierRepository');
const ApiError = require('../../utils/ApiError');

// Protected admin routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

/**
 * @route   GET /api/admin/tiers
 * @desc    Get all available tiers
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
    try {
        const tiers = await TierRepository.findAll({}, { sort: 'level' });
        res.status(200).json({
            success: true,
            data: tiers
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/admin/tiers
 * @desc    Create a new registration tier
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
    try {
        const existingCode = await TierRepository.findByCode(req.body.code);
        if (existingCode) {
            throw new ApiError(400, 'Tier code already exists');
        }

        const tier = await TierRepository.create(req.body);
        res.status(201).json({
            success: true,
            data: tier
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   PUT /api/admin/tiers/:id
 * @desc    Update a tier's pricing, features, or commission percentages
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
    try {
        const tier = await TierRepository.update(req.params.id, req.body);

        if (!tier) {
            throw new ApiError(404, 'Tier not found');
        }

        res.status(200).json({
            success: true,
            data: tier
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   DELETE /api/admin/tiers/:id
 * @desc    Delete a tier
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const tier = await TierRepository.findById(req.params.id);
        if (!tier) throw new ApiError(404, 'Tier not found');

        // Note: Should check if users are actively using this tier before hard deleting
        await TierRepository.delete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;