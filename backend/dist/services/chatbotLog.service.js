"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotLogService = exports.ChatbotLogService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ChatbotLogService {
    async getAll() {
        return await prisma_1.default.chatbotLog.findMany();
    }
    async getById(id) {
        return await prisma_1.default.chatbotLog.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.chatbotLog.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.chatbotLog.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.chatbotLog.delete({
            where: { id },
        });
    }
}
exports.ChatbotLogService = ChatbotLogService;
exports.chatbotLogService = new ChatbotLogService();
