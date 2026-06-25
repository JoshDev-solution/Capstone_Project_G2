"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = exports.MessageController = void 0;
const message_service_1 = require("../services/message.service");
class MessageController {
    async getInbox(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const inbox = await message_service_1.messageService.getInbox(userId);
            res.json(inbox);
        }
        catch (error) {
            next(error);
        }
    }
    async getConversation(req, res, next) {
        try {
            const userId = req.user?.userId;
            const otherUserId = parseInt(req.params.userId);
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            if (isNaN(otherUserId))
                return res.status(400).json({ message: 'Invalid user ID' });
            const messages = await message_service_1.messageService.getConversation(userId, otherUserId);
            res.json(messages);
        }
        catch (error) {
            next(error);
        }
    }
    async sendMessage(req, res, next) {
        try {
            const senderId = req.user?.userId;
            const { receiverId, body } = req.body;
            if (!senderId)
                return res.status(401).json({ message: 'Unauthorized' });
            if (!receiverId || !body)
                return res.status(400).json({ message: 'receiverId and body are required' });
            const message = await message_service_1.messageService.sendMessage(senderId, parseInt(receiverId), body);
            res.status(201).json(message);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessageController = MessageController;
exports.messageController = new MessageController();
