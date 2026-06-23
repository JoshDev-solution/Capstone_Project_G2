import { Request, Response, NextFunction } from 'express';
import { petService } from '../services/pet.service';

export class PetController {
  async getAllPets(req: Request, res: Response, next: NextFunction) {
    try {
      const pets = await petService.getAllPets();
      res.json(pets);
    } catch (error) {
      next(error);
    }
  }

  async getPetById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const pet = await petService.getPetById(id);
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }
      res.json(pet);
    } catch (error) {
      next(error);
    }
  }

  async createPet(req: Request, res: Response, next: NextFunction) {
    try {
      const pet = await petService.createPet(req.body);
      res.status(201).json(pet);
    } catch (error) {
      next(error);
    }
  }

  async updatePet(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const pet = await petService.updatePet(id, req.body);
      res.json(pet);
    } catch (error) {
      next(error);
    }
  }

  async deletePet(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await petService.deletePet(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const petController = new PetController();
