import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.get('/list', authenticate, userController.getAllUsers);
router.get('/counts', authenticate, userController.getCounts);
router.get('/clients', authenticate, userController.getClients);
router.get('/vets', authenticate, userController.getVets);
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/profile/picture', authenticate, upload.single('file'), userController.uploadProfilePicture);
router.post('/manage', authenticate, userController.createUser);
router.put('/manage/:id', authenticate, userController.updateUser);
router.delete('/manage/:id', authenticate, userController.deleteUser);

export default router;
