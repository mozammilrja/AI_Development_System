import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { authService } from '../services/auth.service.js';

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
