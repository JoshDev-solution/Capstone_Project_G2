"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentService = exports.AppointmentService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class AppointmentService {
    async getAllAppointments() {
        return await prisma_1.default.appointment.findMany({
            include: {
                pet: { include: { petType: true, breed: true } },
                client: { include: { user: true } },
                vet: { include: { user: true } },
                service: true,
            },
        });
    }
    async getAppointmentById(id) {
        return await prisma_1.default.appointment.findUnique({
            where: { id },
            include: {
                pet: { include: { petType: true, breed: true } },
                client: { include: { user: true } },
                vet: { include: { user: true } },
                service: true,
            },
        });
    }
    async createAppointment(data) {
        return await prisma_1.default.appointment.create({
            data,
        });
    }
    async updateAppointment(id, data) {
        return await prisma_1.default.appointment.update({
            where: { id },
            data,
        });
    }
    async deleteAppointment(id) {
        return await prisma_1.default.appointment.delete({
            where: { id },
        });
    }
}
exports.AppointmentService = AppointmentService;
exports.appointmentService = new AppointmentService();
