// ===========================================
// FILE 1: middleware/errorMiddleware.js
// ===========================================

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose bad ObjectId (jika nanti pakai MongoDB)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Joi validation error
    if (err.name === 'ValidationError') {
        message = 'Validation Error';
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'production' ? null : err.stack
    });

    // Log error untuk debugging
    console.error(`❌ Error ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }
};

module.exports = {
    notFound,
    errorHandler
};
