"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
class PaymentController {
    async getAllPayments(req, res, next) {
        try {
            const payments = await payment_service_1.paymentService.getAllPayments();
            res.json(payments);
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
