"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All message routes require authentication
router.use(auth_middleware_1.authenticate);
router.get('/inbox', message_controller_1.messageController.getInbox);
router.get('/conversation/:userId', message_controller_1.messageController.getConversation);
router.post('/', message_controller_1.messageController.sendMessage);
exports.default = router;
