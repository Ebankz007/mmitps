/**
 * Standard API Response Class
 * Provides consistent response format across all API endpoints
 */

class ApiResponse {
    constructor(success, data = null, message = '', meta = {}) {
        this.success = success;

        if (data !== null) {
            this.data = data;
        }

        if (message) {
            this.message = message;
        }

        if (Object.keys(meta).length > 0) {
            this.meta = meta;
        }
    }

    /**
     * Create a success response
     * @param {*} data - Response data
     * @param {String} message - Success message
     * @param {Object} meta - Additional metadata
     * @returns {ApiResponse} Success response
     */
    static success(data = null, message = 'Success', meta = {}) {
        return new ApiResponse(true, data, message, meta);
    }

    /**
     * Create an error response
     * @param {String} message - Error message
     * @param {*} data - Error data (optional)
     * @param {Object} meta - Additional metadata
     * @returns {ApiResponse} Error response
     */
    static error(message = 'An error occurred', data = null, meta = {}) {
        return new ApiResponse(false, data, message, meta);
    }

    /**
     * Create a paginated response
     * @param {Array} results - Array of results
     * @param {Object} pagination - Pagination metadata
     * @param {String} message - Success message
     * @returns {ApiResponse} Paginated response
     */
    static paginated(results, pagination, message = 'Success') {
        return new ApiResponse(true, results, message, { pagination });
    }

    /**
     * Create a created response (201)
     * @param {*} data - Created resource data
     * @param {String} message - Success message
     * @returns {ApiResponse} Created response
     */
    static created(data, message = 'Resource created successfully') {
        return new ApiResponse(true, data, message);
    }

    /**
     * Create a no content response (204)
     * @param {String} message - Success message
     * @returns {ApiResponse} No content response
     */
    static noContent(message = 'Operation completed successfully') {
        return new ApiResponse(true, null, message);
    }
}

module.exports = ApiResponse;
