/**
 * Auth Middleware — PostgreSQL edition.
 * Verifies JWT via pg TokenService, loads user via pg UserService.
 */
const ApiError = require('../../utils/ApiError');
const TokenService = require('../../services/pg/TokenService');
const UserService = require('../../services/pg/UserService');
const catchAsync = require('../../utils/catchAsync');
const logger = require('../../utils/logger');

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn(`[AUTH-PG] No token provided for ${req.originalUrl}`);
    throw ApiError.unauthorized('Please authenticate');
  }

  try {
    const payload = await TokenService.verifyToken(token, 'access');

    const user = await UserService.findById(payload.sub);
    if (!user) {
      logger.warn(`[AUTH-PG] User not found for ID: ${payload.sub}`);
      throw ApiError.unauthorized('User belonging to this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`[AUTH-PG ERROR] ${error.message} for ${req.originalUrl}`);
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