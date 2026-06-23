"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogController = exports.ActivityLogController = void 0;
const activityLog_service_1 = require("../services/activityLog.service");
class ActivityLogController {
    async getAll(req, res, next) {
        try {
            const records = await activityLog_service_1.activityLogService.getAll();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await activityLog_service_1.activityLogService.getById(id);
            if (!record) {
                return res.status(404).json({ message: 'ActivityLog not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const record = await activityLog_service_1.activityLogService.create(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await activityLog_service_1.activityLogService.update(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await activityLog_service_1.activityLogService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ActivityLogController = ActivityLogController;
exports.activityLogController = new ActivityLogController();
