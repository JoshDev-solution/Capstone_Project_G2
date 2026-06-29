import { Router } from 'express';
import { petController } from '../controllers/pet.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/', petController.getAllPets);
router.get('/:id', petController.getPetById);
router.get('/:id/history', petController.getPetHistory);
router.post('/', upload.single('profileImage'), petController.createPet);
router.put('/:id', upload.single('profileImage'), petController.updatePet);
router.delete('/:id', petController.deletePet);

export default router;
