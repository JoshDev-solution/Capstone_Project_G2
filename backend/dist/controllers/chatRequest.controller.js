"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRequestController = exports.ChatRequestController = void 0;
const chatRequest_service_1 = require("../services/chatRequest.service");
class ChatRequestController {
    /** Client creates a chat request to a vet (REQ181) */
    async createRequest(req, res, next) {
        try {
            const clientUserId = req.user?.userId;
            if (!clientUserId)
                return res.status(401).json({ message: 'Unauthorized' });
            const { vetUserId, reason, escalatedFromBot } = req.body;
            if (!vetUserId)
                return res.status(400).json({ message: 'vetUserId is required' });
            const request = await chatRequest_service_1.chatRequestService.createRequest(clientUserId, parseInt(vetUserId), reason, escalatedFromBot || false);
            res.status(201).json(request);
        }
        catch (error) {
            if (error.message)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    /** Vet accepts a chat request (REQ087) */
    async acceptRequest(req, res, next) {
        try {
            const vetUserId = req.user?.userId;
            if (!vetUserId)
                return res.status(401).json({ message: 'Unauthorized' });
            const chatRequestId = parseInt(req.params.id);
            const result = await chatRequest_service_1.chatRequestService.acceptRequest(chatRequestId, vetUserId);
            res.json(result);
        }
        catch (error) {
            if (error.message)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    /** Vet declines a chat request (REQ088) */
    async declineRequest(req, res, next) {
        try {
            const vetUserId = req.user?.userId;
            if (!vetUserId)
                return res.status(401).json({ message: 'Unauthorized' });
            const chatRequestId = parseInt(req.params.id);
            const { declineReason } = req.body;
            const result = await chatRequest_service_1.chatRequestService.declineRequest(chatRequestId, vetUserId, declineReason);
            res.json(result);
        }
        catch (error) {
            if (error.message)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    /** Vet views all chat requests (REQ084, REQ086) */
    async getVetRequests(req, res, next) {
        try {
            const vetUserId = req.user?.userId;
            if (!vetUserId)
                return res.status(401).json({ message: 'Unauthorized' });
            const filter = req.query.filter;
            const requests = await chatRequest_service_1.chatRequestService.getVetRequests(vetUserId, filter || 'all');
            res.json(requests);
        }
        catch (error) {
            next(error);
        }
    }
    /** Client views their chat requests (REQ182) */
    async getClientRequests(req, res, next) {
        try {
            const clientUserId = req.user?.userId;
            if (!clientUserId)
                return res.status(401).json({ message: 'Unauthorized' });
            const requests = await chatRequest_service_1.chatRequestService.getClientRequests(clientUserId);
            res.json(requests);
        }
        catch (error) {
            next(error);
        }
    }
    /** View conversation messages for a chat request (REQ085, REQ184) */
    async getConversation(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const chatRequestId = parseInt(req.params.id);
            const messages = await chatRequest_service_1.chatRequestService.getConversation(chatRequestId, userId);
            res.json(messages);
        }
        catch (error) {
            if (error.message)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    /** Send a message in an approved chat request (REQ089, REQ183) */
    async sendMessage(req, res, next) {
        try {
            const senderId = req.user?.userId;
            if (!senderId)
                return res.status(401).json({ message: 'Unauthorized' });
            const chatRequestId = parseInt(req.params.id);
            const { body } = req.body;
            if (!body)
                return res.status(400).json({ message: 'Message body is required' });
            const message = await chatRequest_service_1.chatRequestService.sendMessage(chatRequestId, senderId, body);
            res.status(201).json(message);
        }
        catch (error) {
            if (error.message)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
}
exports.ChatRequestController = ChatRequestController;
exports.chatRequestController = new ChatRequestController();
