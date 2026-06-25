import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All message routes require authentication
router.use(authenticate);

router.get('/inbox', messageController.getInbox);
router.get('/conversation/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);

export default router;
