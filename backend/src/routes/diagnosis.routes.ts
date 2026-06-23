import { Router } from 'express';
import { diagnosisController } from '../controllers/diagnosis.controller';

const router = Router();

router.get('/', diagnosisController.getAllDiagnoses);
router.get('/:id', diagnosisController.getDiagnosisById);
router.post('/', diagnosisController.createDiagnosis);
router.put('/:id', diagnosisController.updateDiagnosis);
router.delete('/:id', diagnosisController.deleteDiagnosis);

export default router;
