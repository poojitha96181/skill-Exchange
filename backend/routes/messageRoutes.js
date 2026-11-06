import { Router } from 'express';
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.post('/', createOrGetConversation);
router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;