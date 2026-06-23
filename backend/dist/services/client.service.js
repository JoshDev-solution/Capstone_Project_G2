"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientService = exports.ClientService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ClientService {
    async getAllClients() {
        return await prisma_1.default.client.findMany({
            include: {
                user: true,
                pets: true,
            },
        });
    }
    async getClientById(id) {
        return await prisma_1.default.client.findUnique({
            where: { id },
            include: {
                user: true,
                pets: true,
                appointments: true,
            },
        });
    }
    async createClient(data) {
        return await prisma_1.default.client.create({
            data,
        });
    }
    async updateClient(id, data) {
        return await prisma_1.default.client.update({
            where: { id },
            data,
        });
    }
    async deleteClient(id) {
        return await prisma_1.default.client.delete({
            where: { id },
        });
    }
}
exports.ClientService = ClientService;
exports.clientService = new ClientService();
