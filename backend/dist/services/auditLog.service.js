"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogService = exports.AuditLogService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class AuditLogService {
    async getAll() {
        return await prisma_1.default.auditLog.findMany();
    }
    async getById(id) {
        return await prisma_1.default.auditLog.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.auditLog.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.auditLog.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.auditLog.delete({
            where: { id },
        });
    }
}
exports.AuditLogService = AuditLogService;
exports.auditLogService = new AuditLogService();
