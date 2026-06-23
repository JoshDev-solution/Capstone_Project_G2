"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalRecordController = exports.MedicalRecordController = void 0;
const medicalRecord_service_1 = require("../services/medicalRecord.service");
class MedicalRecordController {
    async getAllMedicalRecords(req, res, next) {
        try {
            const records = await medicalRecord_service_1.medicalRecordService.getAllMedicalRecords();
            res.json(records);
        }
        catch (error) {
            next(error);
        }
    }
    async getMedicalRecordById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await medicalRecord_service_1.medicalRecordService.getMedicalRecordById(id);
            if (!record) {
                return res.status(404).json({ message: 'Medical Record not found' });
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async createMedicalRecord(req, res, next) {
        try {
            const record = await medicalRecord_service_1.medicalRecordService.createMedicalRecord(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async updateMedicalRecord(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const record = await medicalRecord_service_1.medicalRecordService.updateMedicalRecord(id, req.body);
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMedicalRecord(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await medicalRecord_service_1.medicalRecordService.deleteMedicalRecord(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MedicalRecordController = MedicalRecordController;
exports.medicalRecordController = new MedicalRecordController();
