"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = exports.MessageService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class MessageService {
    async getAll() {
        return await prisma_1.default.message.findMany();
    }
    async getById(id) {
        return await prisma_1.default.message.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.message.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.message.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.message.delete({
            where: { id },
        });
    }
}
exports.MessageService = MessageService;
exports.messageService = new MessageService();
