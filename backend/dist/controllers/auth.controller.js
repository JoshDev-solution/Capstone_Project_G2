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
            const user = await user_service_1.userService.createUser({
                email,
                passwordHash,
                roleId: role.id
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
            // Verify password
            const isPasswordValid = await (0, hash_1.comparePassword)(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
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
