const express = require('express');
const router = express.Router();
const { getGeoRestrictions } = require('../controllers/systemController');

// @desc    Get public system settings (including geo-restrictions)
// @route   GET /api/v1/system/geo-restrictions
// @access  Public
router.get('/geo-restrictions', getGeoRestrictions);

module.exports = router;
