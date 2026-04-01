import { Router } from 'express';

import {
  getProfile,
  updatePassword,
  updateProfile,
} from '../controllers/user.controller.js';
import authenticate from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  validatePasswordUpdate,
  validateProfileUpdate,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validate(validateProfileUpdate), updateProfile);
router.patch('/me/password', validate(validatePasswordUpdate), updatePassword);

export default router;
