"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.petController = exports.PetController = void 0;
const pet_service_1 = require("../services/pet.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
class PetController {
    async getAllPets(req, res, next) {
        try {
            const pets = await pet_service_1.petService.getAllPets();
            const mapped = pets.map((p) => ({
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
    async preparePetData(req) {
        const { name, species, breed, sex, dob, weight, color, ownerEmail, status, microchip } = req.body;
        // Find Client
        if (!ownerEmail)
            throw new Error('ownerEmail is required');
        const user = await prisma_1.default.user.findUnique({
            where: { email: ownerEmail },
            include: { client: true }
        });
        if (!user || !user.client)
            throw new Error(`Client not found with email: ${ownerEmail}`);
        const data = {
            name: name,
            clientId: user.client.id,
            sex: sex || 'Unknown',
            isActive: status === 'Active'
        };
        if (dob)
            data.birthDate = new Date(dob);
        if (weight !== undefined && weight !== '')
            data.weightKg = parseFloat(weight);
        if (color)
            data.color = color;
        if (microchip)
            data.microchipNumber = microchip;
        if (species) {
            const petType = await prisma_1.default.petType.upsert({
                where: { name: species },
                update: {},
                create: { name: species }
            });
            data.petTypeId = petType.id;
        }
        if (breed) {
            const breedRecord = await prisma_1.default.breed.upsert({
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
    async createPet(req, res, next) {
        try {
            const data = await exports.petController.preparePetData(req);
            const pet = await pet_service_1.petService.createPet(data);
            res.status(201).json(pet);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async updatePet(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const data = await exports.petController.preparePetData(req);
            const pet = await pet_service_1.petService.updatePet(id, data);
            res.json(pet);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
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
