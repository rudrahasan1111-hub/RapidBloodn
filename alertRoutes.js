import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createSOS, respondToAlert, validateCreateSOS } from '../controllers/alertController.js';

const router = Router();

router.post('/sos', protect, validateCreateSOS, createSOS);
router.post('/:id/respond', protect, respondToAlert);

export default router;


