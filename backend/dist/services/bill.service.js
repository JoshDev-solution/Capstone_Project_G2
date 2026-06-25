"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billService = exports.BillService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class BillService {
    async getAllBills() {
        return await prisma_1.default.bill.findMany({
            include: {
                client: true,
                pet: true,
                appointment: true,
                discount: true,
                items: true,
                payments: true,
                refunds: true,
            },
        });
    }
    async getBillById(id) {
        return await prisma_1.default.bill.findUnique({
            where: { id },
            include: {
                client: true,
                pet: true,
                appointment: true,
                discount: true,
                items: true,
                payments: true,
                refunds: true,
            },
        });
    }
    async createBill(data) {
        return await prisma_1.default.$transaction(async (tx) => {
            const bill = await tx.bill.create({
                data,
                include: { items: true } // Include items to get what was just created
            });
            // Deduct inventory for items that have a productId
            if (data.items && data.items.create) {
                for (const item of data.items.create) {
                    if (item.productId && item.quantity) {
                        await tx.inventory.updateMany({
                            where: { productId: item.productId },
                            data: {
                                quantity: {
                                    decrement: item.quantity
                                }
                            }
                        });
                    }
                }
            }
            return bill;
        });
    }
    async updateBill(id, data) {
        return await prisma_1.default.bill.update({
            where: { id },
            data,
        });
    }
    async deleteBill(id) {
        return await prisma_1.default.bill.delete({
            where: { id },
        });
    }
}
exports.BillService = BillService;
exports.billService = new BillService();
