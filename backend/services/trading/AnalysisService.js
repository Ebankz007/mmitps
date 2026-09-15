const AnalysisRepository = require('../../repositories/AnalysisRepository');
const ApiError = require('../../utils/ApiError');

class AnalysisService {
    async createAnalysis(userId, data) {
        data.author = userId;
        return AnalysisRepository.create(data);
    }

    async getActiveAnalysis() {
        return AnalysisRepository.findActive();
    }

    async getAnalysisByPair(pair) {
        return AnalysisRepository.findByPair(pair);
    }

    async deleteAnalysis(id, userId) {
        const analysis = await AnalysisRepository.findById(id);
        if (!analysis) throw new ApiError(404, 'Analysis not found');
        if (analysis.author.toString() !== userId.toString()) {
            throw new ApiError(403, 'Not authorized to delete this analysis');
        }
        return AnalysisRepository.delete(id);
    }
}

module.exports = new AnalysisService();
