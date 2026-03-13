import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chathub';

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role: 'user',
  },
  {
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    role: 'user',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    for (const userData of users) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    }

    console.log('\n✅ Seeding complete!\n');
    console.log('Login credentials:');
    console.log('┌─────────────────────────┬─────────────┐');
    console.log('│ Email                   │ Password    │');
    console.log('├─────────────────────────┼─────────────┤');
    console.log('│ admin@example.com       │ admin123    │');
    console.log('│ test@example.com        │ test123     │');
    console.log('│ demo@example.com        │ demo123     │');
    console.log('└─────────────────────────┴─────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
