const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/pg/RecommendationController');
const { protect } = require('../middleware/pg/auth');

router.use(protect);
router.get('/insights', recommendationController.getRecommendations);

module.exports = router;