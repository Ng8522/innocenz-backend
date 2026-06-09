import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRepositoryClass } from './auth.repository.js';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { Error } from '@/error/index.js';
import { hashPassword, comparePassword } from '@/util/password.js';
import { logger } from '@/util/logger.js';

const LoginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const RegisterSchema = z.object({
  email: z.email('Invalid email format'),
  displayName: z.string().min(1, 'Display name is required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

class AuthControllerClass {
  constructor(
    private authRepository: AuthRepositoryClass,
    private jwtController: JwtControllerClass,
  ) {}

  async login(req: Request, res: Response) {
    try {
      const parseResult = LoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          data: null,
        });
      }

      const { email, password } = parseResult.data;
      const admin = await this.authRepository.getAdminByEmail(email);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: Error.INVALID_CREDENTIALS,
          data: null,
        });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated',
          data: null,
        });
      }

      const isPasswordValid = await comparePassword(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: Error.INVALID_CREDENTIALS,
          data: null,
        });
      }

      const tokenPayload = {
        username: email,
        loginType: 'EMAIL' as const,
      };
      const accessToken = this.jwtController.generateAccessToken(tokenPayload);
      const refreshToken = this.jwtController.generateRefreshToken(tokenPayload);
      const decodedToken = this.jwtController.verifyToken(accessToken);
      req.admin = admin;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          expiresAt: decodedToken.exp
            ? new Date(decodedToken.exp * 1000).toISOString()
            : new Date(Date.now() + 3600000).toISOString(),
          user: {
            id: admin.id,
            email: admin.email,
            displayName: admin.displayName,
            status: admin.status,
          },
        },
      });
    } catch (error) {
      logger.error('[AuthController.login] Error:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const parseResult = RegisterSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: parseResult.error.issues[0]?.message ?? 'Invalid input',
          data: null,
        });
      }

      const { email, displayName, password } = parseResult.data;
      const existing = await this.authRepository.getAdminByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: Error.USER_ALREADY_EXISTS,
          data: null,
        });
      }

      const passwordHash = await hashPassword(password);
      const admin = await this.authRepository.createAdmin({
        email,
        displayName,
        password: passwordHash,
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
      });

      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          id: admin.id,
          email: admin.email,
          displayName: admin.displayName,
          status: admin.status,
        },
      });
    } catch (error) {
      logger.error('[AuthController.register] Error:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: Error.UNAUTHORIZED, data: null });
      }

      const admin = await this.authRepository.getUserDataByToken(token);
      if (!admin) {
        return res.status(401).json({ success: false, message: Error.UNAUTHORIZED, data: null });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved',
        data: {
          id: admin.id,
          email: admin.email,
          displayName: admin.displayName,
          status: admin.status,
          createdAt: admin.createdAt.toISOString(),
          updatedAt: admin.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error('[AuthController.getProfile] Error:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }
}

export { AuthControllerClass };
