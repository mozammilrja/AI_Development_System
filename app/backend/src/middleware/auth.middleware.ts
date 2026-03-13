import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { User, IUser } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

declare global { namespace Express { interface Request { user?: IUser; } } }

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authorized, no token', 401);
  
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User not found', 401);
  req.user = user;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Not authorized for this action', 403);
    }
    next();
  };
};

// Alias for compatibility
export const authMiddleware = protect;
