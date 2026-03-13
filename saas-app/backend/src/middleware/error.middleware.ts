import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  res.status(statusCode).json({ success: false, message, ...(env.nodeEnv === 'development' && { stack: err.stack }) });
};
