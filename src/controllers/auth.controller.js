import bcrypt from 'bcryptjs';

import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/async-handler.js';
import { signToken } from '../utils/jwt.js';
import {
  createUser,
  findUserByEmail,
  sanitizeUser,
} from '../models/user.model.js';

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
  });

  const token = signToken({
    sub: user.id,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

export { register, login, getMe };
