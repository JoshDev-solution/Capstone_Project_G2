import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';

export class AppointmentController {
  async getAllAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getAllAppointments();
      res.json(appointments);
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
