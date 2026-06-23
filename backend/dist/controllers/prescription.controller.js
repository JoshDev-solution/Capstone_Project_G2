"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionController = exports.PrescriptionController = void 0;
const prescription_service_1 = require("../services/prescription.service");
class PrescriptionController {
    async getAllPrescriptions(req, res, next) {
        try {
            const prescriptions = await prescription_service_1.prescriptionService.getAllPrescriptions();
            res.json(prescriptions);
        }
        catch (error) {
            next(error);
        }
    }
    async getPrescriptionById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const prescription = await prescription_service_1.prescriptionService.getPrescriptionById(id);
            if (!prescription) {
                return res.status(404).json({ message: 'Prescription not found' });
            }
            res.json(prescription);
        }
        catch (error) {
            next(error);
        }
    }
    async createPrescription(req, res, next) {
        try {
            const prescription = await prescription_service_1.prescriptionService.createPrescription(req.body);
            res.status(201).json(prescription);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePrescription(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const prescription = await prescription_service_1.prescriptionService.updatePrescription(id, req.body);
            res.json(prescription);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePrescription(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await prescription_service_1.prescriptionService.deletePrescription(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PrescriptionController = PrescriptionController;
exports.prescriptionController = new PrescriptionController();
