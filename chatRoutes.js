import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getChats, getMessages, sendMessage, upload } from '../controllers/chatController.js';

const router = Router();

router.get('/', protect, getChats);
router.get('/:chatId', protect, getMessages);
router.post('/:chatId/messages', protect, upload.single('file'), sendMessage);

export default router;


