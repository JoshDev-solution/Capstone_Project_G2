"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.petController = exports.PetController = void 0;
const pet_service_1 = require("../services/pet.service");
class PetController {
    async getAllPets(req, res, next) {
        try {
            const pets = await pet_service_1.petService.getAllPets();
            res.json(pets);
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
