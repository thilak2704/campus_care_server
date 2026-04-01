import bcrypt from 'bcryptjs';

import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/async-handler.js';
import {
  findUserByEmail,
  sanitizeUser,
  updateUserPassword,
  updateUserProfile,
} from '../models/user.model.js';

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser && existingUser.id !== req.user.id) {
    throw new AppError('Email is already in use', 409);
  }

  const updatedUser = await updateUserProfile({
    id: req.user.id,
    name: name.trim(),
    email: normalizedEmail,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: sanitizeUser(updatedUser),
    },
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const isPasswordValid = await bcrypt.compare(currentPassword, req.user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword({
    id: req.user.id,
    passwordHash,
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

export { getProfile, updateProfile, updatePassword };
