"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserController {
    async getAllUsers(req, res, next) {
        try {
            const users = await prisma_1.default.user.findMany({
                include: {
                    role: true,
                    staff: true,
                    client: true,
                }
            });
            const mappedUsers = users.map(u => {
                let name = "Unknown";
                let phone = "N/A";
                if (u.staff) {
                    name = `${u.staff.firstName || ''} ${u.staff.lastName || ''}`.trim() || 'Staff User';
                    phone = u.staff.phone || "N/A";
                }
                else if (u.client) {
                    name = u.client.emergencyContactName || 'Client User';
                    phone = u.client.emergencyContactPhone || "N/A";
                }
                return {
                    id: u.id,
                    name,
                    email: u.email,
                    role: u.role.name,
                    status: u.isActive ? "Active" : "Inactive",
                    joined: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(u.createdAt)),
                    phone,
                    profileImageUrl: null // Implement file uploads later if needed
                };
            });
            res.json(mappedUsers);
        }
        catch (error) {
            next(error);
        }
    }
    async getCounts(req, res, next) {
        try {
            // Stubbed since missing from Prisma schema
            res.json({ registrationsCount: 0, notificationsCount: 0 });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const user = await prisma_1.default.user.findUnique({
                where: { id: req.user.userId },
                include: { role: true, staff: true, client: true }
            });
            if (!user)
                return res.status(404).json({ message: 'User not found' });
            let firstName = "";
            let lastName = "";
            if (user.staff) {
                firstName = user.staff.firstName || "";
                lastName = user.staff.lastName || "";
            }
            else if (user.client) {
                firstName = user.client.emergencyContactName?.split(' ')[0] || "";
                lastName = user.client.emergencyContactName?.split(' ').slice(1).join(' ') || "";
            }
            res.json({
                firstName,
                lastName,
                role: user.role.name,
                profileImageUrl: null
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = await user_service_1.userService.getUserById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async createUser(req, res, next) {
        try {
            const user = await user_service_1.userService.createUser(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = await user_service_1.userService.updateUser(id, req.body);
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await user_service_1.userService.deleteUser(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
