"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionService = exports.PrescriptionService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class PrescriptionService {
    async getAllPrescriptions() {
        return await prisma_1.default.prescription.findMany({
            include: {
                consultation: true,
                pet: true,
                vet: true,
                items: true,
            },
        });
    }
    async getPrescriptionById(id) {
        return await prisma_1.default.prescription.findUnique({
            where: { id },
            include: {
                consultation: true,
                pet: true,
                vet: true,
                items: true,
            },
        });
    }
    async createPrescription(data) {
        return await prisma_1.default.prescription.create({
            data,
        });
    }
    async updatePrescription(id, data) {
        return await prisma_1.default.prescription.update({
            where: { id },
            data,
        });
    }
    async deletePrescription(id) {
        return await prisma_1.default.prescription.delete({
            where: { id },
        });
    }
}
exports.PrescriptionService = PrescriptionService;
exports.prescriptionService = new PrescriptionService();
