/**
 * AnalysisService — PostgreSQL edition.
 * Mirrors the Mongo AnalysisService (createAnalysis/getActiveAnalysis/
 * getAnalysisByPair/deleteAnalysis).
 */
const AnalysisRepository = require('../../repositories/pg/AnalysisRepository');
const ApiError = require('../../utils/ApiError');

class AnalysisService {
  async createAnalysis(userId, data) {
    return AnalysisRepository.create({
      ...data,
      authorId: userId,
    });
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
    if (analysis.authorId !== userId) {
      throw new ApiError(403, 'Not authorized to delete this analysis');
    }
    return AnalysisRepository.delete(id);
  }
}

module.exports = new AnalysisService();