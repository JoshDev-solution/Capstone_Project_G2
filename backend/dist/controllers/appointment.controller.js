"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
class AppointmentController {
    async getAllAppointments(req, res, next) {
        try {
            const appointments = await appointment_service_1.appointmentService.getAllAppointments();
            const mapped = appointments.map((a) => ({
                id: a.id,
                code: a.appointmentCode,
                clientId: a.clientId,
                petId: a.petId,
                serviceId: a.serviceId,
                vetId: a.vetId,
                clientName: a.client?.user?.firstName ? `${a.client.user.firstName} ${a.client.user.lastName || ''}`.trim() : 'Unknown',
                petName: a.pet?.name || 'Unknown',
                petType: a.pet?.petType?.name || 'Unknown',
                vetName: a.vet?.user?.firstName ? `Dr. ${a.vet.user.firstName} ${a.vet.user.lastName || ''}`.trim() : 'Unassigned',
                service: a.service?.name || 'Consultation',
                serviceCategory: a.service?.category || 'Consultation',
                rawDate: a.appointmentDate,
                rawTime: a.appointmentTime,
                date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(a.appointmentDate)),
                time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(a.appointmentTime)),
                status: a.status,
                type: a.type,
                reason: a.reason || 'Check-up'
            }));
            res.json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    async getVetAppointments(req, res, next) {
        try {
            // Hardcode vetId 1 for now since auth middleware might not be setting req.user properly yet
            // In production, this would be: const vetUserId = req.user.id;
            // Then find the Staff record for this user.
            const appointments = await appointment_service_1.appointmentService.getAllAppointments();
            const mapped = appointments.map((a) => ({
                id: a.id,
                code: a.appointmentCode,
                clientId: a.clientId,
                petId: a.petId,
                serviceId: a.serviceId,
                vetId: a.vetId,
                clientName: a.client?.user?.firstName ? `${a.client.user.firstName} ${a.client.user.lastName || ''}`.trim() : 'Unknown',
                petName: a.pet?.name || 'Unknown',
                petType: a.pet?.petType?.name || 'Unknown',
                vetName: a.vet?.user?.firstName ? `Dr. ${a.vet.user.firstName} ${a.vet.user.lastName || ''}`.trim() : 'Unassigned',
                service: a.service?.name || 'Consultation',
                serviceCategory: a.service?.category || 'Consultation',
                rawDate: a.appointmentDate,
                rawTime: a.appointmentTime,
                date: new Date(a.appointmentDate).toISOString().split('T')[0], // Use ISO date for frontend matching
                time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(a.appointmentTime)),
                status: a.status,
                type: a.type,
                reason: a.reason || 'Check-up'
            }));
            res.json(mapped);
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
