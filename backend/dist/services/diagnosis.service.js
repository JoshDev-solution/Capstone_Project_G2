"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosisService = exports.DiagnosisService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class DiagnosisService {
    async getAllDiagnoses() {
        return await prisma_1.default.diagnosis.findMany({
            include: {
                consultation: true,
                pet: true,
                vet: true,
            },
        });
    }
    async getDiagnosisById(id) {
        return await prisma_1.default.diagnosis.findUnique({
            where: { id },
            include: {
                consultation: true,
                pet: true,
                vet: true,
            },
        });
    }
    async createDiagnosis(data) {
        return await prisma_1.default.diagnosis.create({
            data,
        });
    }
    async updateDiagnosis(id, data) {
        return await prisma_1.default.diagnosis.update({
            where: { id },
            data,
        });
    }
    async deleteDiagnosis(id) {
        return await prisma_1.default.diagnosis.delete({
            where: { id },
        });
    }
}
exports.DiagnosisService = DiagnosisService;
exports.diagnosisService = new DiagnosisService();
