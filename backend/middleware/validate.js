const { z } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request data against Zod schema
 * @param {Object} schema - Zod schema object
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
    try {
        const { body, query, params } = req;

        // Validate request parts against schema
        const result = schema.parse({
            body,
            query,
            params,
        });

        // Replace request data with validated/transformed data
        req.body = result.body;
        req.query = result.query;
        req.params = result.params;

        return next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map((details) => ({
                field: details.path.join('.'),
                message: details.message,
            }));

            // Attach validation details as a property — NOT the stack field,
            // which would leak into error responses (see server.js error handler).
            const apiError = new ApiError(400, 'Validation failed');
            apiError.details = errorMessage;
            return next(apiError);
        }
        return next(error);
    }
};

module.exports = validate;
