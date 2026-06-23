"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserService {
    async getAllUsers() {
        return await prisma_1.default.user.findMany({
            include: {
                role: true,
            },
        });
    }
    async getUserById(id) {
        return await prisma_1.default.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
    }
    async getUserByEmail(email) {
        return await prisma_1.default.user.findUnique({
            where: { email },
            include: {
                role: true,
            },
        });
    }
    async createUser(data) {
        return await prisma_1.default.user.create({
            data,
        });
    }
    async updateUser(id, data) {
        return await prisma_1.default.user.update({
            where: { id },
            data,
        });
    }
    async deleteUser(id) {
        return await prisma_1.default.user.delete({
            where: { id },
        });
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
