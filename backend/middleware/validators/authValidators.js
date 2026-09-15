/**
 * Auth route validators — express-validator rules for the auth surface.
 * First real use of express-validator in the codebase (was installed but unused).
 *
 * NOTE: deliberately NO normalizeEmail() — AuthService does exact-match lookups,
 * so transforming the address would break logins for already-registered users.
 */
const { body, param, validationResult } = require('express-validator');
const ApiError = require('../../utils/ApiError');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const apiError = new ApiError(400, 'Validation failed');
    apiError.details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(apiError);
  }
  next();
};

const registerRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').optional().isString().trim().isLength({ max: 100 }).withMessage('firstName must be a string (max 100)'),
  body('lastName').optional().isString().trim().isLength({ max: 100 }).withMessage('lastName must be a string (max 100)'),
  body('phone').optional().isString().trim().isLength({ max: 30 }).withMessage('phone must be a string (max 30)'),
  body('country').optional().isString().trim().isLength({ max: 100 }),
  body('sponsorId').optional().isUUID().withMessage('sponsorId must be a valid UUID'),
  body('tierId').optional().isUUID().withMessage('tierId must be a valid UUID'),
  handleValidation,
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const emailRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  handleValidation,
];

const resetPasswordRules = [
  param('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation,
];

const magicLinkVerifyRules = [
  body('token').notEmpty().withMessage('Token is required'),
  handleValidation,
];

module.exports = { registerRules, loginRules, emailRules, resetPasswordRules, magicLinkVerifyRules };