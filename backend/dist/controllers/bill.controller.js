"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billController = exports.BillController = void 0;
const bill_service_1 = require("../services/bill.service");
class BillController {
    async getAllBills(req, res, next) {
        try {
            const bills = await bill_service_1.billService.getAllBills();
            res.json(bills);
        }
        catch (error) {
            next(error);
        }
    }
    async getBillById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const bill = await bill_service_1.billService.getBillById(id);
            if (!bill) {
                return res.status(404).json({ message: 'Bill not found' });
            }
            res.json(bill);
        }
        catch (error) {
            next(error);
        }
    }
    async createBill(req, res, next) {
        try {
            const bill = await bill_service_1.billService.createBill(req.body);
            res.status(201).json(bill);
        }
        catch (error) {
            next(error);
        }
    }
    async updateBill(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const bill = await bill_service_1.billService.updateBill(id, req.body);
            res.json(bill);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBill(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await bill_service_1.billService.deleteBill(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BillController = BillController;
exports.billController = new BillController();
