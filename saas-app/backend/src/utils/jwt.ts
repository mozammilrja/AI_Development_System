import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { IUser } from '../models/index.js';

interface JwtPayload { id: string; email: string; role: string; }

export function generateToken(user: IUser): string {
  const payload: JwtPayload = { id: user._id.toString(), email: user.email, role: user.role };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
