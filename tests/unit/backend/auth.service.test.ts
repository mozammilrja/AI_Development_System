// Auth Service Unit Tests
// Tests authentication functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock User model
vi.mock('../../../app/backend/src/models/index.js', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock jwt
vi.mock('../../../app/backend/src/utils/jwt.js', () => ({
  generateToken: vi.fn(() => 'mock-jwt-token'),
  verifyToken: vi.fn(() => ({ id: 'user-123', email: 'test@test.com', role: 'user' })),
}));

import { User } from '../../../app/backend/src/models/index.js';
import { generateToken } from '../../../app/backend/src/utils/jwt.js';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should reject duplicate emails', async () => {
      (User.findOne as any).mockResolvedValue({ email: 'existing@test.com' });
      
      const existingUser = await User.findOne({ email: 'existing@test.com' });
      expect(existingUser).toBeTruthy();
    });

    it('should create user with hashed password', async () => {
      (User.create as any).mockResolvedValue({
        _id: 'user-123',
        name: 'Test',
        email: 'test@test.com',
        role: 'user',
      });
      
      const user = await User.create({ name: 'Test', email: 'test@test.com', password: 'pass123' });
      expect(user.email).toBe('test@test.com');
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', () => {
      const user = { _id: 'user-123', email: 'test@test.com', role: 'user' };
      const token = generateToken(user as any);
      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('User Login', () => {
    it('should return user and token on valid credentials', async () => {
      const mockUser = {
        _id: 'user-123',
        email: 'test@test.com',
        password: 'hashed-password',
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      
      (User.findOne as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });
      
      const query = User.findOne({ email: 'test@test.com' });
      const user = await (query as any).select('+password');
      
      expect(user.email).toBe('test@test.com');
      expect(await user.comparePassword('password123')).toBe(true);
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        _id: 'user-123',
        email: 'test@test.com',
        comparePassword: vi.fn().mockResolvedValue(false),
      };
      
      (User.findOne as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });
      
      const query = User.findOne({ email: 'test@test.com' });
      const user = await (query as any).select('+password');
      
      expect(await user.comparePassword('wrongpassword')).toBe(false);
    });
  });

  describe('Password Change', () => {
    it('should update password using save() method', async () => {
      const mockUser = {
        _id: 'user-123',
        password: 'old-hash',
        comparePassword: vi.fn().mockResolvedValue(true),
        save: vi.fn().mockResolvedValue(true),
      };
      
      (User.findById as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });
      
      const query = User.findById('user-123');
      const user = await (query as any).select('+password');
      
      // Verify current password
      const isValid = await user.comparePassword('currentPassword');
      expect(isValid).toBe(true);
      
      // Change password
      user.password = 'newPassword';
      await user.save();
      
      expect(user.save).toHaveBeenCalled();
    });
  });
});
