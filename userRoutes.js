import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listDonors, listRecipients, getDonor, getRecipient } from '../controllers/userController.js';

const router = Router();

router.get('/donors', protect, listDonors);
router.get('/recipients', protect, listRecipients);
router.get('/donors/:id', protect, getDonor);
router.get('/recipients/:id', protect, getRecipient);

export default router;


