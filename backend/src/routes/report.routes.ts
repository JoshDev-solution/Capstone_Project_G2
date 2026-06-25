import { Router } from 'express';
import { reportController } from '../controllers/report.controller';

const router = Router();

router.get('/', reportController.getAll);
router.post('/generate', reportController.generate);
router.get('/:id', reportController.getById);
router.post('/', reportController.create);
router.put('/:id', reportController.update);
router.delete('/:id', reportController.delete);

export default router;
