"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatRequest_controller_1 = require("../controllers/chatRequest.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Client routes
router.post('/', chatRequest_controller_1.chatRequestController.createRequest); // REQ181: Create a chat request
router.get('/my-requests', chatRequest_controller_1.chatRequestController.getClientRequests); // REQ182: View own request statuses
// Vet routes
router.get('/vet-inbox', chatRequest_controller_1.chatRequestController.getVetRequests); // REQ084/086: View all incoming requests
router.patch('/:id/accept', chatRequest_controller_1.chatRequestController.acceptRequest); // REQ087: Accept a request
router.patch('/:id/decline', chatRequest_controller_1.chatRequestController.declineRequest); // REQ088: Decline a request
// Shared conversation routes
router.get('/:id/messages', chatRequest_controller_1.chatRequestController.getConversation); // REQ085/184: View conversation
router.post('/:id/messages', chatRequest_controller_1.chatRequestController.sendMessage); // REQ089/183: Send message
exports.default = router;
