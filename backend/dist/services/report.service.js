"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ReportService {
    async getAll() {
        return await prisma_1.default.report.findMany();
    }
    async getById(id) {
        return await prisma_1.default.report.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await prisma_1.default.report.create({
            data,
        });
    }
    async update(id, data) {
        return await prisma_1.default.report.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prisma_1.default.report.delete({
            where: { id },
        });
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
