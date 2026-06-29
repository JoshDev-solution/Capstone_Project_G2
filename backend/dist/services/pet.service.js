"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.petService = exports.PetService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class PetService {
    async getAllPets() {
        return await prisma_1.default.pet.findMany({
            include: {
                client: { include: { user: true } },
                petType: true,
                breed: true,
            },
        });
    }
    async getPetById(id) {
        return await prisma_1.default.pet.findUnique({
            where: { id },
            include: {
                client: { include: { user: true } },
                petType: true,
                breed: true,
                appointments: true,
            },
        });
    }
    async getPetHistory(id) {
        return await prisma_1.default.pet.findUnique({
            where: { id },
            include: {
                client: { include: { user: true } },
                petType: true,
                breed: true,
                consultations: {
                    include: {
                        vet: { include: { user: true } },
                        diagnoses: true,
                        prescriptions: {
                            include: { items: true }
                        },
                        medicalRecords: true
                    },
                    orderBy: { consultationDate: 'desc' }
                },
                medicalRecords: {
                    where: { consultationId: null }, // Only records not attached to a consultation
                    orderBy: { recordDate: 'desc' }
                }
            },
        });
    }
    async createPet(data) {
        return await prisma_1.default.pet.create({
            data,
        });
    }
    async updatePet(id, data) {
        return await prisma_1.default.pet.update({
            where: { id },
            data,
        });
    }
    async deletePet(id) {
        return await prisma_1.default.pet.delete({
            where: { id },
        });
    }
}
exports.PetService = PetService;
exports.petService = new PetService();
