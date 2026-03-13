import { Response } from 'express';

interface ApiResponse<T> { success: boolean; data?: T; message?: string; }

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 400): void {
  const response: ApiResponse<never> = { success: false, message };
  res.status(statusCode).json(response);
}
