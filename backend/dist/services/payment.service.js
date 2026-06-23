"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class PaymentService {
    async getAllPayments() {
        return await prisma_1.default.payment.findMany({
            include: {
                bill: true,
                refunds: true,
            },
        });
    }
    async getPaymentById(id) {
        return await prisma_1.default.payment.findUnique({
            where: { id },
            include: {
                bill: true,
                refunds: true,
            },
        });
    }
    async createPayment(data) {
        return await prisma_1.default.payment.create({
            data,
        });
    }
    async updatePayment(id, data) {
        return await prisma_1.default.payment.update({
            where: { id },
            data,
        });
    }
    async deletePayment(id) {
        return await prisma_1.default.payment.delete({
            where: { id },
        });
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
