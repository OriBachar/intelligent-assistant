import { ErrorRequestHandler } from 'express';
import { config } from '../config/env';
import util from 'util';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (config.server.env === 'development') {
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            details: err.details ? util.inspect(err.details, { depth: null, colors: true }) : undefined,
            path: req.path,
            method: req.method
        });
    } else {
        console.error('Error:', {
            name: err.name,
            message: err.message,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }

    const statusCode = err.statusCode || 500;
    const message = config.server.env === 'production' 
        ? 'An unexpected error occurred' 
        : err.message || 'Internal server error';

    return res.status(statusCode).json({
        status: 'error',
        message,
        ...(err.details && { details: err.details }),
        ...(config.server.env === 'development' && { stack: err.stack })
    });
};

export default errorHandler;