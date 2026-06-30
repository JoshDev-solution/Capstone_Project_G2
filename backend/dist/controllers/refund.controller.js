"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundController = exports.RefundController = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class RefundController {
    async getAllRefunds(req, res, next) {
        try {
            const refunds = await prisma_1.default.refund.findMany({
                include: {
                    payment: true,
                    bill: {
                        include: {
                            client: {
                                include: { user: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            const mapped = refunds.map((r) => {
                const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(r.createdAt));
                return {
                    id: r.id,
                    paymentId: r.payment?.paymentCode || 'UNKNOWN',
                    code: `REF-${r.id.toString().padStart(6, '0')}`,
                    clientName: `${r.bill?.client?.user?.firstName || ''} ${r.bill?.client?.user?.lastName || ''}`.trim() || r.bill?.client?.user?.email?.split('@')[0] || 'Unknown Client',
                    amount: Number(r.amount),
                    date: dateStr,
                    requestedAt: dateStr,
                    reason: r.reason || 'Requested by client',
                    status: r.status,
                    billCode: r.bill?.id ? `BILL-${r.bill.id.toString().padStart(6, '0')}` : 'N/A',
                    paymentMethod: r.payment?.paymentMethod || 'N/A',
                    processedAt: r.updatedAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(r.updatedAt)) : undefined
                };
            });
            res.json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    async getRefundById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const refund = await prisma_1.default.refund.findUnique({
                where: { id },
                include: {
                    payment: true,
                    bill: {
                        include: {
                            client: {
                                include: { user: true }
                            }
                        }
                    }
                }
            });
            if (!refund) {
                return res.status(404).json({ message: 'Refund not found' });
            }
            const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(refund.createdAt));
            const mapped = {
                id: refund.id,
                paymentId: refund.payment?.paymentCode || 'UNKNOWN',
                code: `REF-${refund.id.toString().padStart(6, '0')}`,
                clientName: `${refund.bill?.client?.user?.firstName || ''} ${refund.bill?.client?.user?.lastName || ''}`.trim() || refund.bill?.client?.user?.email?.split('@')[0] || 'Unknown Client',
                amount: Number(refund.amount),
                date: dateStr,
                requestedAt: dateStr,
                reason: refund.reason || 'Requested by client',
                status: refund.status,
                billCode: refund.bill?.id ? `BILL-${refund.bill.id.toString().padStart(6, '0')}` : 'N/A',
                paymentMethod: refund.payment?.paymentMethod || 'N/A',
                processedAt: refund.updatedAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(refund.updatedAt)) : undefined
            };
            res.json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    async processRefund(req, res, next) {
        try {
            const { paymentId, amount, reason } = req.body;
            // Look up payment by code to get billId
            const paymentRecord = await prisma_1.default.payment.findUnique({
                where: { paymentCode: paymentId }
            });
            if (!paymentRecord) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            const refund = await prisma_1.default.refund.create({
                data: {
                    paymentId: paymentRecord.id,
                    billId: paymentRecord.billId,
                    amount,
                    reason
                }
            });
            res.status(201).json(refund);
        }
        catch (error) {
            next(error);
        }
    }
    async updateRefundStatus(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            const refund = await prisma_1.default.refund.update({
                where: { id },
                data: { status }
            });
            res.json(refund);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RefundController = RefundController;
exports.refundController = new RefundController();
