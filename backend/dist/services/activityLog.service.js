"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogService = exports.ActivityLogService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ActivityLogService {
    async getAll() {
        return await prisma_1.default.activityLog.findMany();
    }
    async getById(id) {
        return await prisma_1.default.activityLog.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.activityLog.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.activityLog.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.activityLog.delete({
            where: { id },
        });
    }
}
exports.ActivityLogService = ActivityLogService;
exports.activityLogService = new ActivityLogService();
