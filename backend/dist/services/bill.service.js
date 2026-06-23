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
        return await prisma_1.default.bill.create({
            data,
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
