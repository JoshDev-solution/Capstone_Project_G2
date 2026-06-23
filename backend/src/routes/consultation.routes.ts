import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller';

const router = Router();

router.get('/', consultationController.getAllConsultations);
router.get('/:id', consultationController.getConsultationById);
router.post('/', consultationController.createConsultation);
router.put('/:id', consultationController.updateConsultation);
router.delete('/:id', consultationController.deleteConsultation);

export default router;
