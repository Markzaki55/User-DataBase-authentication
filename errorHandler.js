const winston = require('winston');
const { router } = require('./routes/userRoutes');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log error with Winston or console.error
    winston.error(`Error: ${err.message}`);

    // Send appropriate HTTP status and error message
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};
exports.errorHandler = errorHandler;
// Add the error handler as the last middleware
router.use(errorHandler);
