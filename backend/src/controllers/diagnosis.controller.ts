import { Request, Response, NextFunction } from 'express';
import { diagnosisService } from '../services/diagnosis.service';

export class DiagnosisController {
  async getAllDiagnoses(req: Request, res: Response, next: NextFunction) {
    try {
      const diagnoses = await diagnosisService.getAllDiagnoses();
      res.json(diagnoses);
    } catch (error) {
      next(error);
    }
  }

  async getDiagnosisById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const diagnosis = await diagnosisService.getDiagnosisById(id);
      if (!diagnosis) {
        return res.status(404).json({ message: 'Diagnosis not found' });
      }
      res.json(diagnosis);
    } catch (error) {
      next(error);
    }
  }

  async createDiagnosis(req: Request, res: Response, next: NextFunction) {
    try {
      const diagnosis = await diagnosisService.createDiagnosis(req.body);
      res.status(201).json(diagnosis);
    } catch (error) {
      next(error);
    }
  }

  async updateDiagnosis(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const diagnosis = await diagnosisService.updateDiagnosis(id, req.body);
      res.json(diagnosis);
    } catch (error) {
      next(error);
    }
  }

  async deleteDiagnosis(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await diagnosisService.deleteDiagnosis(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const diagnosisController = new DiagnosisController();
