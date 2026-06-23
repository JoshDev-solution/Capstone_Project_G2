import { Router } from 'express';
import { petController } from '../controllers/pet.controller';

const router = Router();

router.get('/', petController.getAllPets);
router.get('/:id', petController.getPetById);
router.post('/', petController.createPet);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

export default router;
