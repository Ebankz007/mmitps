const express = require('express');
const router = express.Router();
const TierRepository = require('../repositories/pg/TierRepository');

/**
 * @route   GET /api/v1/tiers
 * @desc    Get all active tiers for public display (registration page)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const tiers = await TierRepository.findActive();
        res.status(200).json({
            success: true,
            data: tiers
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;