import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import prisma from '../utils/prisma';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, roleName } = req.body;

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Default to "Client" role if none provided
      const roleToFind = roleName || 'Client';
      
      let role = await prisma.role.findUnique({
        where: { name: roleToFind }
      });
      
      if (!role) {
         // Create the role if it doesn't exist (useful for testing)
         role = await prisma.role.create({
            data: { name: roleToFind, description: `${roleToFind} role` }
         });
      }

      // Create User
      const user = await userService.createUser({
        email,
        passwordHash,
        roleId: role.id
      });

      // Generate token
      const token = generateToken({
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
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Generate token
      const token = generateToken({
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
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
