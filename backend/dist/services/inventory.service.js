"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryService = exports.InventoryService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class InventoryService {
    async getAllInventory() {
        return await prisma_1.default.inventory.findMany({
            include: {
                product: true,
            },
        });
    }
    async getLowStockAlerts() {
        // Fetch all inventory items with product relation and filter where quantity <= reorderLevel
        // This is safe for a small-medium clinic scale.
        const allInventory = await prisma_1.default.inventory.findMany({
            include: { product: true },
        });
        return allInventory.filter(item => item.quantity <= item.reorderLevel);
    }
    async getInventoryById(id) {
        return await prisma_1.default.inventory.findUnique({
            where: { id },
            include: {
                product: true,
            },
        });
    }
    async createInventory(data) {
        return await prisma_1.default.inventory.create({
            data,
        });
    }
    async updateInventory(id, data) {
        return await prisma_1.default.inventory.update({
            where: { id },
            data,
        });
    }
    async deleteInventory(id) {
        return await prisma_1.default.inventory.delete({
            where: { id },
        });
    }
}
exports.InventoryService = InventoryService;
exports.inventoryService = new InventoryService();
