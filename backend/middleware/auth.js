const ApiError = require('../utils/ApiError');
const TokenService = require('../services/TokenService');
const UserService = require('../services/UserService');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

/**
 * Auth Middleware
 * Verifies JWT token and attaches user to request
 */
const protect = catchAsync(async (req, res, next) => {
    let token;

    // 1) Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        logger.warn(`[AUTH] No token provided for ${req.originalUrl}`);
        throw ApiError.unauthorized('Please authenticate');
    }

    // 2) Verify token
    try {
        const payload = await TokenService.verifyToken(token, 'access');

        // 3) Check if user still exists
        const user = await UserService.findById(payload.sub);
        if (!user) {
            logger.warn(`[AUTH] User not found for ID: ${payload.sub}`);
            throw ApiError.unauthorized('User belonging to this token no longer exists');
        }

        // Grant access
        req.user = user;
        next();
    } catch (error) {
        logger.error(`[AUTH ERROR] ${error.message} for ${req.originalUrl}`);
        throw error;
    }
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw ApiError.forbidden('Not authorized to access this route');
        }
        next();
    };
};

module.exports = { protect, authorize, restrictTo: authorize };
