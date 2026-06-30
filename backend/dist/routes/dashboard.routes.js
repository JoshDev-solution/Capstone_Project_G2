"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Dashboard routes (we can extend this later with /manager, /cashier, /vet if needed)
router.get('/admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), dashboard_controller_1.dashboardController.getAdminStats);
exports.default = router;
