import { User, IUser } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthService {
  async register(data: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new AppError('Email already in use', 400);
    
    const user = await User.create(data);
    const token = generateToken(user);
    return { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token };
  }

  async login(data: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user || !(await user.comparePassword(data.password))) {
      throw new AppError('Invalid email or password', 401);
    }
    const token = generateToken(user);
    return { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token };
  }

  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return { _id: user._id, name: user.name, email: user.email, role: user.role };
  }
}

export const authService = new AuthService();
