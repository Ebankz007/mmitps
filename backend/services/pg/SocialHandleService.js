/**
 * SocialHandleService — PostgreSQL edition.
 */
const SocialHandleRepository = require('../../repositories/pg/SocialHandleRepository');
const SystemConfigRepository = require('../../repositories/pg/SystemConfigRepository');
const ApiError = require('../../utils/ApiError');

class SocialHandleService {
  /**
   * Get all active social handles grouped by category
   */
  async getHandlesByCategory() {
    const handles = await SocialHandleRepository.findAll({ isActive: true }, { sort: 'order', direction: 'asc' });

    const grouped = handles.reduce((acc, handle) => {
      if (!acc[handle.category]) {
        acc[handle.category] = [];
      }
      acc[handle.category].push(handle);
      return acc;
    }, {});

    return grouped;
  }

  /**
   * Get all social handles (for admin)
   */
  async getAllHandles() {
    return SocialHandleRepository.findAll({}, { sort: 'category', direction: 'asc' });
  }

  /**
   * Create a new social handle
   */
  async createHandle(handleData) {
    return SocialHandleRepository.create(handleData);
  }

  /**
   * Update a social handle
   */
  async updateHandle(id, updateData) {
    const handle = await SocialHandleRepository.update(id, updateData);

    if (!handle) {
      throw ApiError.notFound('Social handle not found');
    }

    return handle;
  }

  /**
   * Delete a social handle
   */
  async deleteHandle(id) {
    const handle = await SocialHandleRepository.delete(id);

    if (!handle) {
      throw ApiError.notFound('Social handle not found');
    }

    return handle;
  }

  /**
   * Get Global Broadcast Guard Settings (Admin)
   */
  async getGlobalBroadcastSettings() {
    let config = await SystemConfigRepository.findByKey('globalBroadcastGuard');
    if (!config) {
      config = await SystemConfigRepository.create({
        key: 'globalBroadcastGuard',
        category: 'broadcast',
        description: 'Admin routing rules for automatic broadcast posting',
        value: {
          selectedSignals: [],
          selectedContent: [],
          destinations: []
        }
      });
    }
    return config.value;
  }

  /**
   * Update Global Broadcast Guard Settings (Admin)
   */
  async updateGlobalBroadcastSettings(settingsData, adminUserId) {
    const config = await SystemConfigRepository.updateConfig('globalBroadcastGuard', settingsData, adminUserId);
    return config.value;
  }
}

module.exports = new SocialHandleService();