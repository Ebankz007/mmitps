/**
 * Custom API Error Class
 * Extends Error to provide consistent error handling across the application
 */

class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Create a Bad Request error (400)
     */
    static badRequest(message = 'Bad Request') {
        return new ApiError(400, message);
    }

    /**
     * Create an Unauthorized error (401)
     */
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    /**
     * Create a Forbidden error (403)
     */
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    /**
     * Create a Not Found error (404)
     */
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    /**
     * Create a Conflict error (409)
     */
    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    /**
     * Create a Validation error (422)
     */
    static validationError(message = 'Validation failed') {
        return new ApiError(422, message);
    }

    /**
     * Create an Internal Server error (500)
     */
    static internal(message = 'Internal server error') {
        return new ApiError(500, message, false);
    }
}

module.exports = ApiError;
