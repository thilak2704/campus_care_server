import env from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details || null,
    ...(env.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
