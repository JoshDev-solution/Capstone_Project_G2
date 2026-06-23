"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalRecordService = exports.MedicalRecordService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class MedicalRecordService {
    async getAllMedicalRecords() {
        return await prisma_1.default.medicalRecord.findMany({
            include: {
                pet: true,
                consultation: true,
            },
        });
    }
    async getMedicalRecordById(id) {
        return await prisma_1.default.medicalRecord.findUnique({
            where: { id },
            include: {
                pet: true,
                consultation: true,
            },
        });
    }
    async createMedicalRecord(data) {
        return await prisma_1.default.medicalRecord.create({
            data,
        });
    }
    async updateMedicalRecord(id, data) {
        return await prisma_1.default.medicalRecord.update({
            where: { id },
            data,
        });
    }
    async deleteMedicalRecord(id) {
        return await prisma_1.default.medicalRecord.delete({
            where: { id },
        });
    }
}
exports.MedicalRecordService = MedicalRecordService;
exports.medicalRecordService = new MedicalRecordService();
