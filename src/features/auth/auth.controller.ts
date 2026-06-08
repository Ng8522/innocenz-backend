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
  contactNo: z.string().max(20).optional(),
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
      const user = await this.authRepository.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: Error.INVALID_CREDENTIALS,
          data: null,
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated',
          data: null,
        });
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
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
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            contactNo: user.contactNo,
            isActive: user.isActive,
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

      const { email, displayName, password, contactNo } = parseResult.data;
      const existing = await this.authRepository.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: Error.USER_ALREADY_EXISTS,
          data: null,
        });
      }

      const passwordHash = await hashPassword(password);
      const user = await this.authRepository.createUser({
        email,
        displayName,
        passwordHash,
        contactNo: contactNo ?? null,
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          contactNo: user.contactNo,
          isActive: user.isActive,
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

      const user = await this.authRepository.getUserDataByToken(token);
      if (!user) {
        return res.status(401).json({ success: false, message: Error.UNAUTHORIZED, data: null });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved',
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          contactNo: user.contactNo,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
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
