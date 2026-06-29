import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authenticate, serviceController.createService);
router.put('/:id', authenticate, serviceController.updateService);
router.delete('/:id', authenticate, serviceController.deleteService);

export default router;
