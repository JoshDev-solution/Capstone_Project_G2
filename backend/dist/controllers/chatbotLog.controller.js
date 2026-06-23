"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotLogController = exports.ChatbotLogController = void 0;
const chatbotLog_service_1 = require("../services/chatbotLog.service");
class ChatbotLogController {
    async getAll(req, res, next) {
        try {
            const records = await chatbotLog_service_1.chatbotLogService.getAll();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await chatbotLog_service_1.chatbotLogService.getById(id);
            if (!record) {
                return res.status(404).json({ message: 'ChatbotLog not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const record = await chatbotLog_service_1.chatbotLogService.create(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await chatbotLog_service_1.chatbotLogService.update(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await chatbotLog_service_1.chatbotLogService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChatbotLogController = ChatbotLogController;
exports.chatbotLogController = new ChatbotLogController();
