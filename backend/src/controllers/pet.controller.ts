import { Request, Response, NextFunction } from 'express';
import { petService } from '../services/pet.service';
import prisma from '../utils/prisma';

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
        rawDob: p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : '',
        weight: Number(p.weightKg) || 0,
        ownerName: p.client?.user?.firstName ? `${p.client.user.firstName} ${p.client.user.lastName || ''}`.trim() : 'Unknown',
        ownerEmail: p.client?.user?.email || 'Unknown',
        status: p.isActive ? "Active" : "Inactive",
        isNeutered: p.isNeutered,
        petTypeId: p.petTypeId,
        vaccinationStatus: p.isNeutered ? "Vaccinated" : "Not Vaccinated", // Rough mapping
        lastVisit: "Recent", // Stub
        microchip: p.microchipNumber || "None",
        profileImageUrl: p.profileImageUrl || null
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

  private async preparePetData(req: Request) {
    const { name, species, breed, sex, dob, weight, color, ownerEmail, status, microchip } = req.body;
    
    // Find Client
    if (!ownerEmail) throw new Error('ownerEmail is required');
    const user = await prisma.user.findUnique({
      where: { email: ownerEmail },
      include: { client: true }
    });
    if (!user || !user.client) throw new Error(`Client not found with email: ${ownerEmail}`);

    const data: any = {
      name: name,
      clientId: user.client.id,
      sex: sex || 'Unknown',
      isActive: status === 'Active'
    };

    if (dob) data.birthDate = new Date(dob);
    if (weight !== undefined && weight !== '') data.weightKg = parseFloat(weight);
    if (color) data.color = color;
    if (microchip) data.microchipNumber = microchip;

    if (species) {
      const petType = await prisma.petType.upsert({
        where: { name: species },
        update: {},
        create: { name: species }
      });
      data.petTypeId = petType.id;
    }

    if (breed) {
      const breedRecord = await prisma.breed.upsert({
        where: { name: breed },
        update: {},
        create: { name: breed }
      });
      data.breedId = breedRecord.id;
    }

    if (req.file) {
      // Create url using the file path. E.g., /uploads/pet-123.jpg
      data.profileImageUrl = `/uploads/${req.file.filename}`;
    }

    return data;
  }

  async createPet(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await petController.preparePetData(req);
      const pet = await petService.createPet(data);
      res.status(201).json(pet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updatePet(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const data = await petController.preparePetData(req);
      const pet = await petService.updatePet(id, data);
      res.json(pet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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
