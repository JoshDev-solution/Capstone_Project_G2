import { Router } from 'express';
import { auditLogController } from '../controllers/auditLog.controller';

const router = Router();

router.get('/', auditLogController.getAll);
router.get('/:id', auditLogController.getById);
router.post('/', auditLogController.create);
router.put('/:id', auditLogController.update);
router.delete('/:id', auditLogController.delete);

export default router;
