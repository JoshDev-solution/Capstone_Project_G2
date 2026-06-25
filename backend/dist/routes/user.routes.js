"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.get('/list', auth_middleware_1.authenticate, user_controller_1.userController.getAllUsers);
router.get('/counts', auth_middleware_1.authenticate, user_controller_1.userController.getCounts);
router.get('/clients', auth_middleware_1.authenticate, user_controller_1.userController.getClients);
router.get('/vets', auth_middleware_1.authenticate, user_controller_1.userController.getVets);
router.get('/profile', auth_middleware_1.authenticate, user_controller_1.userController.getProfile);
router.put('/profile', auth_middleware_1.authenticate, user_controller_1.userController.updateProfile);
router.post('/profile/picture', auth_middleware_1.authenticate, upload.single('file'), user_controller_1.userController.uploadProfilePicture);
router.get('/registrations', auth_middleware_1.authenticate, user_controller_1.userController.getRegistrations);
router.put('/registrations/:id/approve', auth_middleware_1.authenticate, user_controller_1.userController.approveRegistration);
router.put('/registrations/:id/reject', auth_middleware_1.authenticate, user_controller_1.userController.rejectRegistration);
router.get('/notifications', auth_middleware_1.authenticate, user_controller_1.userController.getNotifications);
router.put('/notifications/read-all', auth_middleware_1.authenticate, user_controller_1.userController.readAllNotifications);
router.put('/notifications/:id/read', auth_middleware_1.authenticate, user_controller_1.userController.readNotification);
router.post('/manage', auth_middleware_1.authenticate, user_controller_1.userController.createUser);
router.put('/manage/:id', auth_middleware_1.authenticate, user_controller_1.userController.updateUser);
router.delete('/manage/:id', auth_middleware_1.authenticate, user_controller_1.userController.deleteUser);
exports.default = router;
