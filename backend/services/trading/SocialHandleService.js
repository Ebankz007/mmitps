const SocialHandle = require('../../models/SocialHandle');
const SystemConfig = require('../../models/System/SystemConfig');
const ApiError = require('../../utils/ApiError');

class SocialHandleService {
    /**
     * Get all active social handles grouped by category
     */
    async getHandlesByCategory() {
        const handles = await SocialHandle.find({ isActive: true }).sort({ order: 1 });

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
        return await SocialHandle.find().sort({ category: 1, order: 1 });
    }

    /**
     * Create a new social handle
     */
    async createHandle(handleData) {
        return await SocialHandle.create(handleData);
    }

    /**
     * Update a social handle
     */
    async updateHandle(id, updateData) {
        const handle = await SocialHandle.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!handle) {
            throw ApiError.notFound('Social handle not found');
        }

        return handle;
    }

    /**
     * Delete a social handle
     */
    async deleteHandle(id) {
        const handle = await SocialHandle.findByIdAndDelete(id);

        if (!handle) {
            throw ApiError.notFound('Social handle not found');
        }

        return handle;
    }

    /**
     * Get Global Broadcast Guard Settings (Admin)
     */
    async getGlobalBroadcastSettings() {
        let config = await SystemConfig.findOne({ key: 'globalBroadcastGuard' });
        if (!config) {
            config = await SystemConfig.create({
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
        const config = await SystemConfig.findOneAndUpdate(
            { key: 'globalBroadcastGuard' },
            {
                value: settingsData,
                lastModifiedBy: adminUserId,
                category: 'broadcast'
            },
            { new: true, upsert: true }
        );
        return config.value;
    }
}

module.exports = new SocialHandleService();
