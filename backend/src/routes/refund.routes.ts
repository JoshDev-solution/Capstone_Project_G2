import { Router } from 'express';
import { refundController } from '../controllers/refund.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, refundController.getAllRefunds);
router.get('/:id', authenticate, refundController.getRefundById);
router.post('/', authenticate, refundController.processRefund);
router.put('/:id/status', authenticate, refundController.updateRefundStatus);

export default router;
