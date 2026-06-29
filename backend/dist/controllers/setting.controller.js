"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingController = exports.SettingController = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class SettingController {
    // Public: Get all settings
    async getSettings(req, res, next) {
        try {
            const settings = await prisma_1.default.systemSetting.findMany();
            // Convert array of {key, value} to a single object { [key]: value }
            const settingsObj = {};
            // Set defaults in case DB is empty
            settingsObj['clinicName'] = 'LJ Veterinary Clinic';
            settingsObj['contactNumber'] = '+63-909-152-3519';
            settingsObj['emailAddress'] = 'eguialovely@gmail.com';
            settingsObj['websiteUrl'] = 'https://ljvetclinic.com';
            settingsObj['address'] = 'Surallah, South Cotabato';
            settingsObj['monFriOpen'] = '08:00';
            settingsObj['monFriClose'] = '18:00';
            settingsObj['weekendClose'] = '18:00';
            settingsObj['description'] = 'LJ Veterinary Clinic provides compassionate and professional veterinary care for all pets in Surallah, South Cotabato.';
            settingsObj['yearsExperience'] = '7';
            // Override with DB values
            for (const s of settings) {
                settingsObj[s.key] = s.value;
            }
            res.status(200).json(settingsObj);
        }
        catch (error) {
            next(error);
        }
    }
    // Admin only: Update settings
    async updateSettings(req, res, next) {
        try {
            const updates = req.body; // Expecting an object of key-value pairs
            if (typeof updates !== 'object' || updates === null) {
                return res.status(400).json({ message: 'Invalid payload format. Expected key-value object.' });
            }
            for (const [key, value] of Object.entries(updates)) {
                if (typeof value === 'string') {
                    await prisma_1.default.systemSetting.upsert({
                        where: { key },
                        update: { value },
                        create: { key, value }
                    });
                }
            }
            res.status(200).json({ message: 'Settings updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SettingController = SettingController;
exports.settingController = new SettingController();
