import { Router } from 'express';
import { chatbotLogController } from '../controllers/chatbotLog.controller';

const router = Router();

router.get('/', chatbotLogController.getAll);
router.get('/:id', chatbotLogController.getById);
router.post('/', chatbotLogController.create);
router.put('/:id', chatbotLogController.update);
router.delete('/:id', chatbotLogController.delete);

export default router;
