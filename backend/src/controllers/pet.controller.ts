import { Request, Response, NextFunction } from 'express';
import { petService } from '../services/pet.service';

export class PetController {
  async getAllPets(req: Request, res: Response, next: NextFunction) {
    try {
      const pets = await petService.getAllPets();
      const mapped = pets.map((p: any) => ({
        id: p.id,
        clientId: p.clientId,
        name: p.name,
        species: p.petType?.name || 'Unknown',
        breed: p.breed?.name || 'Unknown',
        sex: p.sex,
        color: p.color || 'Unknown',
        dob: p.birthDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(p.birthDate)) : 'Unknown',
        weight: Number(p.weightKg) || 0,
        ownerName: p.client?.user?.firstName ? `${p.client.user.firstName} ${p.client.user.lastName || ''}`.trim() : 'Unknown',
        ownerEmail: p.client?.user?.email || 'Unknown',
        status: p.isActive ? "Active" : "Inactive",
        vaccinationStatus: p.isNeutered ? "Vaccinated" : "Not Vaccinated", // Rough mapping
        lastVisit: "Recent", // Stub
        microchip: p.microchipNumber || "None"
      }));
      res.json(mapped);
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

  async getPetHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const history = await petService.getPetHistory(id);
      if (!history) {
        return res.status(404).json({ message: 'Pet not found' });
      }
      res.json(history);
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
