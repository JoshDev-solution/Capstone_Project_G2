"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryTransactionService = exports.InventoryTransactionService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class InventoryTransactionService {
    async getAll() {
        return await prisma_1.default.inventoryTransaction.findMany({
            include: { product: true },
            orderBy: { transactionDate: 'desc' },
            take: 50
        });
    }
    async getById(id) {
        return await prisma_1.default.inventoryTransaction.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.inventoryTransaction.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.inventoryTransaction.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.inventoryTransaction.delete({
            where: { id },
        });
    }
}
exports.InventoryTransactionService = InventoryTransactionService;
exports.inventoryTransactionService = new InventoryTransactionService();
