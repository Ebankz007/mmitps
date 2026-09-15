const SocialHandleService = require('../services/trading/SocialHandleService');

class SocialHandleController {
    /**
     * Get all active handles grouped by category
     * GET /api/v1/social-handles
     */
    async getHandles(req, res) {
        try {
            const handles = await SocialHandleService.getHandlesByCategory();
            res.json({
                success: true,
                data: handles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all handles (Admin)
     * GET /api/v1/social-handles/admin
     */
    async getAllHandles(req, res) {
        try {
            const handles = await SocialHandleService.getAllHandles();
            res.json({
                success: true,
                data: handles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Create handle (Admin)
     * POST /api/v1/social-handles
     */
    async createHandle(req, res) {
        try {
            const handle = await SocialHandleService.createHandle(req.body);
            res.status(201).json({
                success: true,
                data: handle
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update handle (Admin)
     * PATCH /api/v1/social-handles/:id
     */
    async updateHandle(req, res) {
        try {
            const handle = await SocialHandleService.updateHandle(req.params.id, req.body);
            res.json({
                success: true,
                data: handle
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete handle (Admin)
     * DELETE /api/v1/social-handles/:id
     */
    async deleteHandle(req, res) {
        try {
            await SocialHandleService.deleteHandle(req.params.id);
            res.json({
                success: true,
                message: 'Social handle deleted'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * Get Global Broadcast Guard Settings (Admin)
     * GET /api/v1/social-handles/broadcast-settings
     */
    async getGlobalBroadcastSettings(req, res) {
        try {
            const settings = await SocialHandleService.getGlobalBroadcastSettings();
            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update Global Broadcast Guard Settings (Admin)
     * PUT /api/v1/social-handles/broadcast-settings
     */
    async updateGlobalBroadcastSettings(req, res) {
        try {
            const settings = await SocialHandleService.updateGlobalBroadcastSettings(req.body, req.user._id);
            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new SocialHandleController();
