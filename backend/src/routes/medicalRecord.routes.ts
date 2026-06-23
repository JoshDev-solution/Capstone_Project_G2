import { Router } from 'express';
import { medicalRecordController } from '../controllers/medicalRecord.controller';

const router = Router();

router.get('/', medicalRecordController.getAllMedicalRecords);
router.get('/:id', medicalRecordController.getMedicalRecordById);
router.post('/', medicalRecordController.createMedicalRecord);
router.put('/:id', medicalRecordController.updateMedicalRecord);
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

export default router;
