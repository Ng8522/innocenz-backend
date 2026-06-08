import { AuthRepositoryClass } from '@/features/auth/auth.repository.js';
import { AuthControllerClass } from '@/features/auth/auth.controller.js';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { HealthControllerClass } from '@/features/health/health.controller.js';

export const jwtController = new JwtControllerClass();
export const authRepository = new AuthRepositoryClass(jwtController);
export const authController = new AuthControllerClass(authRepository, jwtController);
export const healthController = new HealthControllerClass();
