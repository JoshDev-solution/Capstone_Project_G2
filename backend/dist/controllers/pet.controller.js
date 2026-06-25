"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.petController = exports.PetController = void 0;
const pet_service_1 = require("../services/pet.service");
class PetController {
    async getAllPets(req, res, next) {
        try {
            const pets = await pet_service_1.petService.getAllPets();
            const mapped = pets.map((p) => ({
                id: p.id,
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
        }
        catch (error) {
            next(error);
        }
    }
    async getPetById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const pet = await pet_service_1.petService.getPetById(id);
            if (!pet) {
                return res.status(404).json({ message: 'Pet not found' });
            }
            res.json(pet);
        }
        catch (error) {
            next(error);
        }
    }
    async getPetHistory(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const history = await pet_service_1.petService.getPetHistory(id);
            if (!history) {
                return res.status(404).json({ message: 'Pet not found' });
            }
            res.json(history);
        }
        catch (error) {
            next(error);
        }
    }
    async createPet(req, res, next) {
        try {
            const pet = await pet_service_1.petService.createPet(req.body);
            res.status(201).json(pet);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePet(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const pet = await pet_service_1.petService.updatePet(id, req.body);
            res.json(pet);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePet(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await pet_service_1.petService.deletePet(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PetController = PetController;
exports.petController = new PetController();
