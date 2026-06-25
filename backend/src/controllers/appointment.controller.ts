import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';

export class AppointmentController {
  async getAllAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getAllAppointments();
      const mapped = appointments.map((a: any) => ({
        id: a.id,
        code: a.appointmentCode,
        clientName: a.client?.user?.firstName ? `${a.client.user.firstName} ${a.client.user.lastName || ''}`.trim() : 'Unknown',
        petName: a.pet?.name || 'Unknown',
        petType: a.pet?.petType?.name || 'Unknown',
        vetName: a.vet?.user?.firstName ? `Dr. ${a.vet.user.firstName} ${a.vet.user.lastName || ''}`.trim() : 'Unassigned',
        service: a.service?.name || 'Consultation',
        date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(a.appointmentDate)),
        time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(a.appointmentTime)),
        status: a.status,
        type: a.type,
        reason: a.reason || 'Check-up'
      }));
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async getVetAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      // Hardcode vetId 1 for now since auth middleware might not be setting req.user properly yet
      // In production, this would be: const vetUserId = req.user.id;
      // Then find the Staff record for this user.
      const appointments = await appointmentService.getAllAppointments();
      
      const mapped = appointments.map((a: any) => ({
        id: a.id,
        code: a.appointmentCode,
        clientName: a.client?.user?.firstName ? `${a.client.user.firstName} ${a.client.user.lastName || ''}`.trim() : 'Unknown',
        petName: a.pet?.name || 'Unknown',
        petType: a.pet?.petType?.name || 'Unknown',
        vetName: a.vet?.user?.firstName ? `Dr. ${a.vet.user.firstName} ${a.vet.user.lastName || ''}`.trim() : 'Unassigned',
        service: a.service?.name || 'Consultation',
        date: new Date(a.appointmentDate).toISOString().split('T')[0], // Use ISO date for frontend matching
        time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(a.appointmentTime)),
        status: a.status,
        type: a.type,
        reason: a.reason || 'Check-up'
      }));
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const appointment = await appointmentService.getAppointmentById(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const appointment = await appointmentService.updateAppointment(id, req.body);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async deleteAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await appointmentService.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
