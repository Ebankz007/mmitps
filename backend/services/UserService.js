const BaseService = require('./BaseService');
const UserRepository = require('../repositories/UserRepository');
const ApiError = require('../utils/ApiError');

class UserService extends BaseService {
    constructor() {
        super(UserRepository);
    }

    /**
     * @override
     * Validate user data
     * @param {Object} data 
     */
    async validate(data) {
        if (!data.email) {
            throw ApiError.validationError('Email is required');
        }
        // Additional validation can go here if not covered by Zod
        // But mostly we rely on Zod middleware now
    }

    /**
     * Update user profile
     * @param {String} userId 
     * @param {Object} data 
     * @returns {Promise<Document>}
     */
    async updateProfile(userId, data) {
        const allowedUpdates = ['profile', 'preferences'];
        const updates = {};

        // Only allow updating specific fields to prevent security issues
        Object.keys(data).forEach(key => {
            if (allowedUpdates.includes(key) || key === 'username' || key === 'sessionDuration') {
                updates[key] = data[key];
            }
        });

        // Handle nested profile updates
        if (data.firstName || data.lastName || data.phone) {
            updates['profile.firstName'] = data.firstName;
            updates['profile.lastName'] = data.lastName;
            updates['profile.phone'] = data.phone;
        }

        return this.update(userId, updates);
    }

    /**
     * Update user profile picture
     * @param {String} userId 
     * @param {String} avatarUrl 
     * @returns {Promise<Document>}
     */
    async updateProfilePicture(userId, avatarUrl) {
        return this.update(userId, { 'profile.avatar': avatarUrl });
    }

    /**
     * Check if email is taken (excluding current user)
     * @param {String} email 
     * @param {String} excludeUserId 
     * @returns {Promise<Boolean>}
     */
    async isEmailTaken(email, excludeUserId = null) {
        const user = await UserRepository.findByEmail(email);
        if (!user) return false;
        if (excludeUserId && user._id.toString() === excludeUserId.toString()) return false;
        return true;
    }
    /**
     * Change user password
     * @param {String} userId 
     * @param {String} currentPassword 
     * @param {String} newPassword 
     * @returns {Promise<void>}
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await UserRepository.findByIdWithPassword(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (!(await user.comparePassword(currentPassword))) {
            throw ApiError.unauthorized('Incorrect current password');
        }

        user.password = newPassword;
        await user.save();
    }

    async updatePreferences(userId, preferences) {
        const User = require('../models/User');
        const user = await User.findById(userId);

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // Merge preferences carefully. Using spread on user.preferences can be risky 
        // with Mongoose subdocuments if they have defaults or validation.
        // We iterate and set to ensure Mongoose treats it as a partial update.
        if (preferences && typeof preferences === 'object') {
            Object.keys(preferences).forEach(key => {
                user.set(`preferences.${key}`, preferences[key]);
            });
        }
        
        await user.save();

        return user;
    }
}

module.exports = new UserService();
