import { Router } from 'express';

import { getMe, login, register } from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(validateRegister), register);
router.post('/login', validate(validateLogin), login);
router.get('/me', authenticate, getMe);

export default router;
