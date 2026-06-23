import { Request, Response, NextFunction } from 'express';
import { medicalRecordService } from '../services/medicalRecord.service';

export class MedicalRecordController {
  async getAllMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await medicalRecordService.getAllMedicalRecords();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getMedicalRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await medicalRecordService.getMedicalRecordById(id);
      if (!record) {
        return res.status(404).json({ message: 'Medical Record not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async createMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await medicalRecordService.createMedicalRecord(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async updateMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const record = await medicalRecordService.updateMedicalRecord(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async deleteMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await medicalRecordService.deleteMedicalRecord(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const medicalRecordController = new MedicalRecordController();
