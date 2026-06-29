"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setting_controller_1 = require("../controllers/setting.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public route to fetch settings for the landing page
router.get('/', setting_controller_1.settingController.getSettings);
// Protected admin route to update settings
router.put('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), setting_controller_1.settingController.updateSettings);
exports.default = router;
