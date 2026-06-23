"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationController {
    async getAll(req, res, next) {
        try {
            const records = await notification_service_1.notificationService.getAll();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await notification_service_1.notificationService.getById(id);
            if (!record) {
                return res.status(404).json({ message: 'Notification not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const record = await notification_service_1.notificationService.create(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await notification_service_1.notificationService.update(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await notification_service_1.notificationService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
