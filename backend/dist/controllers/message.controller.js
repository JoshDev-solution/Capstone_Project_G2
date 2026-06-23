"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = exports.MessageController = void 0;
const message_service_1 = require("../services/message.service");
class MessageController {
    async getAll(req, res, next) {
        try {
            const records = await message_service_1.messageService.getAll();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await message_service_1.messageService.getById(id);
            if (!record) {
                return res.status(404).json({ message: 'Message not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const record = await message_service_1.messageService.create(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await message_service_1.messageService.update(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await message_service_1.messageService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessageController = MessageController;
exports.messageController = new MessageController();
