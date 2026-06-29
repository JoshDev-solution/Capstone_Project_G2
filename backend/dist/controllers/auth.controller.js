"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const user_service_1 = require("../services/user.service");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../utils/prisma"));
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password, roleName } = req.body;
            // Check if user already exists
            const existingUser = await user_service_1.userService.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email.' });
            }
            // Hash password
            const passwordHash = await (0, hash_1.hashPassword)(password);
            // Default to "Client" role if none provided
            const roleToFind = roleName || 'Client';
            let role = await prisma_1.default.role.findUnique({
                where: { name: roleToFind }
            });
            if (!role) {
                // Create the role if it doesn't exist (useful for testing)
                role = await prisma_1.default.role.create({
                    data: { name: roleToFind, description: `${roleToFind} role` }
                });
            }
            // Create User
            const user = await prisma_1.default.user.create({
                data: {
                    email,
                    passwordHash,
                    roleId: role.id,
                    firstName: req.body.firstName || null,
                    lastName: req.body.lastName || null,
                    phone: req.body.phone || null,
                    isApproved: true, // Automatically approve new registrations per updated requirement
                    ...(role.name === 'Client' && {
                        client: {
                            create: {
                                clientCode: `CLT-${Date.now().toString().slice(-6)}`,
                                notes: req.body.address || null
                            }
                        }
                    })
                },
                include: { role: true, client: true }
            });
            // Generate token
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: role.name
            });
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName || null,
                    lastName: user.lastName || null,
                    role: role.name
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // Find user
            const user = await user_service_1.userService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            // Check if account is inactive
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
            }
            // Check if account is currently locked
            if (user.lockoutEnd && user.lockoutEnd > new Date()) {
                const remainingMinutes = Math.ceil((user.lockoutEnd.getTime() - new Date().getTime()) / 60000);
                return res.status(403).json({ message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.` });
            }
            // Verify password
            const isPasswordValid = await (0, hash_1.comparePassword)(password, user.passwordHash);
            if (!isPasswordValid) {
                // Only track failed attempts for non-clients (staff)
                if (user.role.name !== 'Client') {
                    const newFailedCount = user.failedLoginCount + 1;
                    let lockoutEnd = null;
                    if (newFailedCount >= 5) {
                        // Lock out for 15 minutes
                        lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
                    }
                    await prisma_1.default.user.update({
                        where: { id: user.id },
                        data: {
                            failedLoginCount: newFailedCount,
                            lockoutEnd: lockoutEnd
                        }
                    });
                    if (lockoutEnd) {
                        return res.status(403).json({ message: 'Account locked due to 5 failed login attempts. Try again in 15 minutes.' });
                    }
                }
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            // Reset failed attempts on successful login
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: {
                    failedLoginCount: 0,
                    lockoutEnd: null,
                    lastLoginAt: new Date()
                }
            });
            // Generate token
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role.name
            });
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role.name
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
