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
                bill: {
                    include: {
                        items: { include: { product: true, service: true } },
                        client: { include: { user: true } }
                    }
                },
                refunds: true,
            },
            orderBy: { paymentDate: 'desc' }
        });
    }
    async getPaymentById(id) {
        return await prisma_1.default.payment.findUnique({
            where: { id },
            include: {
                bill: {
                    include: {
                        items: { include: { product: true, service: true } },
                        client: { include: { user: true } }
                    }
                },
                refunds: true,
            },
        });
    }
    async createPayment(data) {
        return await prisma_1.default.$transaction(async (tx) => {
            // Ensure paymentCode exists
            const paymentData = { ...data };
            if (!paymentData.paymentCode) {
                paymentData.paymentCode = `PAY-${Date.now()}`;
            }
            // Create the payment record
            const payment = await tx.payment.create({ data: paymentData });
            // If a bill is associated, we update its status to 'Paid'
            // In a real system, you'd check if sum of payments >= bill.totalAmount
            if (data.billId) {
                await tx.bill.update({
                    where: { id: data.billId },
                    data: { status: 'Paid' }
                });
            }
            return payment;
        });
    }
    async getDailySales() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const payments = await prisma_1.default.payment.findMany({
            where: {
                paymentDate: {
                    gte: today,
                }
            }
        });
        const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return { date: today, totalSales: total, count: payments.length };
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
