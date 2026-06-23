import { Request, Response, NextFunction } from 'express';
import { consultationService } from '../services/consultation.service';

export class ConsultationController {
  async getAllConsultations(req: Request, res: Response, next: NextFunction) {
    try {
      const consultations = await consultationService.getAllConsultations();
      res.json(consultations);
    } catch (error) {
      next(error);
    }
  }

  async getConsultationById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const consultation = await consultationService.getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }
      res.json(consultation);
    } catch (error) {
      next(error);
    }
  }

  async createConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const consultation = await consultationService.createConsultation(req.body);
      res.status(201).json(consultation);
    } catch (error) {
      next(error);
    }
  }

  async updateConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const consultation = await consultationService.updateConsultation(id, req.body);
      res.json(consultation);
    } catch (error) {
      next(error);
    }
  }

  async deleteConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await consultationService.deleteConsultation(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const consultationController = new ConsultationController();
