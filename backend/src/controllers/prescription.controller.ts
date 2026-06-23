import { Request, Response, NextFunction } from 'express';
import { prescriptionService } from '../services/prescription.service';

export class PrescriptionController {
  async getAllPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const prescriptions = await prescriptionService.getAllPrescriptions();
      res.json(prescriptions);
    } catch (error) {
      next(error);
    }
  }

  async getPrescriptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const prescription = await prescriptionService.getPrescriptionById(id);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }

  async createPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const prescription = await prescriptionService.createPrescription(req.body);
      res.status(201).json(prescription);
    } catch (error) {
      next(error);
    }
  }

  async updatePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const prescription = await prescriptionService.updatePrescription(id, req.body);
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }

  async deletePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await prescriptionService.deletePrescription(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const prescriptionController = new PrescriptionController();
