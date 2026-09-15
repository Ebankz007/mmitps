/**
 * UserController — PostgreSQL edition.
 * req.user comes from middleware/pg/auth.js (camelCase, id = UUID string).
 */
const UserService = require('../../services/pg/UserService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

exports.getProfile = catchAsync(async (req, res) => {
    // req.user is already attached by auth middleware
    res.status(200).json(new ApiResponse(true, req.user, 'Profile retrieved'));
});

exports.updateProfile = catchAsync(async (req, res) => {
    const user = await UserService.updateProfile(req.user.id, req.body);
    res.status(200).json(new ApiResponse(true, user, 'Profile updated successfully'));
});

exports.changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await UserService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json(new ApiResponse(true, null, 'Password changed successfully'));
});

exports.uploadProfilePicture = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await UserService.updateProfilePicture(req.user.id, avatarUrl);
    res.status(200).json(new ApiResponse(true, { avatar: user.profile.avatar }, 'Profile picture updated successfully'));
});

exports.updatePreferences = catchAsync(async (req, res) => {
    const user = await UserService.updatePreferences(req.user.id, req.body);
    res.status(200).json(new ApiResponse(true, user.preferences, 'Preferences updated successfully'));
});