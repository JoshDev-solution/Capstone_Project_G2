"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
class AppointmentController {
    async getAllAppointments(req, res, next) {
        try {
            const appointments = await appointment_service_1.appointmentService.getAllAppointments();
            res.json(appointments);
        }
        catch (error) {
            next(error);
        }
    }
    async getAppointmentById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const appointment = await appointment_service_1.appointmentService.getAppointmentById(id);
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            res.json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    async createAppointment(req, res, next) {
        try {
            const appointment = await appointment_service_1.appointmentService.createAppointment(req.body);
            res.status(201).json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    async updateAppointment(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const appointment = await appointment_service_1.appointmentService.updateAppointment(id, req.body);
            res.json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAppointment(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await appointment_service_1.appointmentService.deleteAppointment(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AppointmentController = AppointmentController;
exports.appointmentController = new AppointmentController();
