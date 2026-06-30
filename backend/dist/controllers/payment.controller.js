"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
class PaymentController {
    async getAllPayments(req, res, next) {
        try {
            const payments = await payment_service_1.paymentService.getAllPayments();
            const mapped = payments.map((p) => ({
                ...p,
                clientName: p.bill?.client?.user ? `${p.bill.client.user.firstName} ${p.bill.client.user.lastName || ''}`.trim() : 'Walk-in Customer',
                items: p.bill?.items?.map((item) => ({
                    id: item.id,
                    name: item.description || item.product?.name || item.service?.name,
                    qty: item.quantity,
                    price: Number(item.unitPrice),
                    total: Number(item.totalPrice)
                })) || []
            }));
            res.json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    async getDailySales(req, res, next) {
        try {
            const sales = await payment_service_1.paymentService.getDailySales();
            res.json(sales);
        }
        catch (error) {
            next(error);
        }
    }
    async getPaymentById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const payment = await payment_service_1.paymentService.getPaymentById(id);
            if (!payment) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            res.json(payment);
        }
        catch (error) {
            next(error);
        }
    }
    async createPayment(req, res, next) {
        try {
            const payment = await payment_service_1.paymentService.createPayment(req.body);
            res.status(201).json(payment);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePayment(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const payment = await payment_service_1.paymentService.updatePayment(id, req.body);
            res.json(payment);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePayment(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await payment_service_1.paymentService.deletePayment(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
