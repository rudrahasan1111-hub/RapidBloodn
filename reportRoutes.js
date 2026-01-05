import { Router } from 'express';
import { protect, admin } from '../middleware/auth.js';
import { createReport, getReports, updateReportStatus, validateReport } from '../controllers/reportController.js';

const router = Router();

router.post('/', protect, validateReport, createReport);
router.get('/', protect, admin, getReports);
router.put('/:id/status', protect, admin, updateReportStatus);

export default router;


