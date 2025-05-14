import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import process from 'process';
import { User } from '../models/User.js';

dotenv.config();

export const registerUserService = async ({ name, email, password }) => {
  // Check existing user
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
    status: 'active'
  });

  // JWT creation
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const loginUserService = async ({ email, password }) => {
  // Check existing user
  const user = await User.findOne({ where: { email, role: 'user' } });
  if (!user) {
    throw new Error('User not found with this email');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Update lastLogin and totalAttempted
  user.lastLogin = new Date();

  user.totalAttempted = (user.totalAttempted || 0) + 1;
  
  await user.save();

  // JWT creation
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      totalAttempted: user.totalAttempted,
      progressSummary: user.progressSummary,
      status: user.status
    }
  };
};

export const loginAdminService = async ({ email, password }) => {
  // Find admin by email and role
  const admin = await User.findOne({ where: { email, role: 'admin' } });
  if (!admin) {
    throw new Error('Admin not found with this email');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Update lastLogin and totalAttempted
  admin.lastLogin = new Date();

  admin.totalAttempted = (admin.totalAttempted || 0) + 1;
  
  await admin.save();

  // JWT creation
  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    message: 'Admin login successful',
    token
    // user: {
    //   id: admin.id,
    //   name: admin.name,
    //   email: admin.email,
    //   role: admin.role,
    //   lastLogin: admin.lastLogin,
    //   totalAttempted: admin.totalAttempted,
    //   progressSummary: admin.progressSummary,
    //   status: admin.status
    // }
  };
};


