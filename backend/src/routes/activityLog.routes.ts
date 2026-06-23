import { Router } from 'express';
import { activityLogController } from '../controllers/activityLog.controller';

const router = Router();

router.get('/', activityLogController.getAll);
router.get('/:id', activityLogController.getById);
router.post('/', activityLogController.create);
router.put('/:id', activityLogController.update);
router.delete('/:id', activityLogController.delete);

export default router;
