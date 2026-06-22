import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRepositoryClass } from './auth.repository.js';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { Error } from '@/error/index.js';
import { comparePassword } from '@/util/password.js';
import { logger } from '@/util/logger.js';

const LoginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const RegisterSchema = z.object({
  email: z.email('Invalid email format'),
  displayName: z.string().min(1, 'Display name is required').max(100),
});

class AuthControllerClass {
  constructor(
    private authRepository: AuthRepositoryClass,
    private jwtController: JwtControllerClass,
  ) {}

}

export { AuthControllerClass };
