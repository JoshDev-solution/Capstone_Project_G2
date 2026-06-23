"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultationController = exports.ConsultationController = void 0;
const consultation_service_1 = require("../services/consultation.service");
class ConsultationController {
    async getAllConsultations(req, res, next) {
        try {
            const consultations = await consultation_service_1.consultationService.getAllConsultations();
            res.json(consultations);
        }
        catch (error) {
            next(error);
        }
    }
    async getConsultationById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const consultation = await consultation_service_1.consultationService.getConsultationById(id);
            if (!consultation) {
                return res.status(404).json({ message: 'Consultation not found' });
            }
            res.json(consultation);
        }
        catch (error) {
            next(error);
        }
    }
    async createConsultation(req, res, next) {
        try {
            const consultation = await consultation_service_1.consultationService.createConsultation(req.body);
            res.status(201).json(consultation);
        }
        catch (error) {
            next(error);
        }
    }
    async updateConsultation(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const consultation = await consultation_service_1.consultationService.updateConsultation(id, req.body);
            res.json(consultation);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteConsultation(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await consultation_service_1.consultationService.deleteConsultation(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ConsultationController = ConsultationController;
exports.consultationController = new ConsultationController();
