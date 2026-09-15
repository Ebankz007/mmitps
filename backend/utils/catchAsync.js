/**
 * Async Error Handler Wrapper
 * Catches errors in async route handlers and passes them to error middleware
 */

const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync;
