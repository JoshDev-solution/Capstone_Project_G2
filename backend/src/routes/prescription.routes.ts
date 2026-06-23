import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';

const router = Router();

router.get('/', prescriptionController.getAllPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.post('/', prescriptionController.createPrescription);
router.put('/:id', prescriptionController.updatePrescription);
router.delete('/:id', prescriptionController.deletePrescription);

export default router;
