import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { authService } from '../services/auth.service.js';
import { User } from '../models/index.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!._id.toString());
  sendSuccess(res, profile);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user!._id.toString(), currentPassword, newPassword);
  sendSuccess(res, { message: 'Password changed successfully' });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || typeof q !== 'string') {
    return sendSuccess(res, { users: [] });
  }

  // Search by email or name (case-insensitive)
  const users = await User.find({
    $and: [
      { _id: { $ne: req.user!._id } }, // Exclude current user
      {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
        ],
      },
    ],
  })
    .select('_id name email avatar')
    .limit(Number(limit));

  sendSuccess(res, { users });
});
