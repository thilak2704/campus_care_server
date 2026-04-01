import { Router } from 'express';

import { echoName, getHealth } from '../controllers/health.controller.js';
import validate from '../middleware/validate.js';
import { validateNamePayload } from '../validators/example.validator.js';

const router = Router();

router.get('/health', getHealth);
router.post('/echo', validate(validateNamePayload), echoName);

export default router;
