"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosisController = exports.DiagnosisController = void 0;
const diagnosis_service_1 = require("../services/diagnosis.service");
class DiagnosisController {
    async getAllDiagnoses(req, res, next) {
        try {
            const diagnoses = await diagnosis_service_1.diagnosisService.getAllDiagnoses();
            res.json(diagnoses);
        }
        catch (error) {
            next(error);
        }
    }
    async getDiagnosisById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const diagnosis = await diagnosis_service_1.diagnosisService.getDiagnosisById(id);
            if (!diagnosis) {
                return res.status(404).json({ message: 'Diagnosis not found' });
            }
            res.json(diagnosis);
        }
        catch (error) {
            next(error);
        }
    }
    async createDiagnosis(req, res, next) {
        try {
            const diagnosis = await diagnosis_service_1.diagnosisService.createDiagnosis(req.body);
            res.status(201).json(diagnosis);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDiagnosis(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const diagnosis = await diagnosis_service_1.diagnosisService.updateDiagnosis(id, req.body);
            res.json(diagnosis);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDiagnosis(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await diagnosis_service_1.diagnosisService.deleteDiagnosis(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DiagnosisController = DiagnosisController;
exports.diagnosisController = new DiagnosisController();
