"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogController = exports.AuditLogController = void 0;
const auditLog_service_1 = require("../services/auditLog.service");
class AuditLogController {
    async getAll(req, res, next) {
        try {
            const records = await auditLog_service_1.auditLogService.getAll();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await auditLog_service_1.auditLogService.getById(id);
            if (!record) {
                return res.status(404).json({ message: 'AuditLog not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const record = await auditLog_service_1.auditLogService.create(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await auditLog_service_1.auditLogService.update(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await auditLog_service_1.auditLogService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuditLogController = AuditLogController;
exports.auditLogController = new AuditLogController();
