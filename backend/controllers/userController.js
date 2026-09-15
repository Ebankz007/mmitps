const UserService = require('../services/UserService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getProfile = catchAsync(async (req, res) => {
    // req.user is already attached by auth middleware
    res.status(200).json(new ApiResponse(true, req.user, 'Profile retrieved'));
});

exports.updateProfile = catchAsync(async (req, res) => {
    const user = await UserService.updateProfile(req.user._id, req.body);
    res.status(200).json(new ApiResponse(true, user, 'Profile updated successfully'));
});

exports.changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // This logic should ideally be in UserService or AuthService
    // But since UserService handles updates, let's put it here or call a service method
    // For now, let's implement checking here or add changePassword to UserService

    // We'll add changePassword to UserService in next iteration if needed, 
    // but for now let's use the model directly via service or repository?
    // User model has comparePassword. 

    // Proper way: UserService.changePassword(userId, current, new)
    await UserService.changePassword(req.user._id, currentPassword, newPassword);

    res.status(200).json(new ApiResponse(true, null, 'Password changed successfully'));
});

exports.uploadProfilePicture = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll use the local file path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await UserService.updateProfilePicture(req.user._id, avatarUrl);
    res.status(200).json(new ApiResponse(true, { avatar: user.profile.avatar }, 'Profile picture updated successfully'));
});
exports.updatePreferences = catchAsync(async (req, res) => {
    const user = await UserService.updatePreferences(req.user._id, req.body);
    res.status(200).json(new ApiResponse(true, user.preferences, 'Preferences updated successfully'));
});
