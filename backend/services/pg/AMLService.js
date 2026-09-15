/**
 * AMLService — PostgreSQL edition.
 */
const AMLRepository = require('../../repositories/pg/AMLRepository');
const logger = require('../../utils/logger');

class AMLService {
  /**
   * Perform an automated AML check (simulated — would integrate with SumSub/Onfido)
   */
  async performCheck(userId, type = 'onboarding') {
    try {
      // Simulate API call
      const riskScore = Math.floor(Math.random() * 100);
      let riskLevel = 'low';
      if (riskScore > 30) riskLevel = 'medium';
      if (riskScore > 70) riskLevel = 'high';
      if (riskScore > 90) riskLevel = 'critical';

      const check = await AMLRepository.create({
        userId,
        checkType: 'sanctions', // Default for now
        provider: 'internal_sim',
        reference: `SIM-${Date.now()}`,
        status: riskLevel === 'low' ? 'clear' : 'potential_match',
        riskScore,
        riskLevel,
        result: { simulated: true },
        reviewRequired: riskLevel !== 'low'
      });

      logger.info(`Performed AML check for user ${userId}: ${riskLevel}`);
      return check;
    } catch (error) {
      logger.error('Error in AML check:', error);
      throw error;
    }
  }

  /**
   * Get user's AML checks
   */
  async getUserChecks(userId) {
    return AMLRepository.findByUser(userId);
  }
}

module.exports = new AMLService();