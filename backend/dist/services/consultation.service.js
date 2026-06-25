"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultationService = exports.ConsultationService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ConsultationService {
    async getAllConsultations() {
        return await prisma_1.default.consultation.findMany({
            include: {
                appointment: true,
                pet: true,
                vet: true,
            },
        });
    }
    async getConsultationById(id) {
        return await prisma_1.default.consultation.findUnique({
            where: { id },
            include: {
                appointment: true,
                pet: true,
                vet: true,
                diagnoses: true,
                prescriptions: true,
                medicalRecords: true,
            },
        });
    }
    async createConsultation(data) {
        return await prisma_1.default.$transaction(async (tx) => {
            // 1. Create the consultation (which may include nested diagnoses and prescriptions)
            const consultation = await tx.consultation.create({
                data,
            });
            // 2. Update the appointment status to Completed
            if (data.appointmentId) {
                await tx.appointment.update({
                    where: { id: data.appointmentId },
                    data: {
                        status: 'Completed',
                        completedAt: new Date()
                    }
                });
            }
            return consultation;
        });
    }
    async updateConsultation(id, data) {
        return await prisma_1.default.consultation.update({
            where: { id },
            data,
        });
    }
    async deleteConsultation(id) {
        return await prisma_1.default.consultation.delete({
            where: { id },
        });
    }
}
exports.ConsultationService = ConsultationService;
exports.consultationService = new ConsultationService();
