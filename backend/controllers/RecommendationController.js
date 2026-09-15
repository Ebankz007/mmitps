const RecommendationService = require('../services/ai/RecommendationService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get personalized recommendations for the authenticated user
 */
exports.getRecommendations = async (req, res, next) => {
    try {
        const insights = await RecommendationService.getInsights(req.user._id);
        res.status(200).json(new ApiResponse(true, insights, 'Personalized recommendations retrieved'));
    } catch (error) {
        next(error);
    }
};
