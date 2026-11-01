const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/RecommendationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/insights', recommendationController.getRecommendations);

module.exports = router;

