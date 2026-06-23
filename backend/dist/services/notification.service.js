"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class NotificationService {
    async getAll() {
        return await prisma_1.default.notification.findMany();
    }
    async getById(id) {
        return await prisma_1.default.notification.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.notification.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.notification.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.notification.delete({
            where: { id },
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
