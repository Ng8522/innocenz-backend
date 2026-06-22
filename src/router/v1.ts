import express from 'express';
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import userRoutes from '@/features/user/user.routes.js';
import { platformAuditMiddleware } from '@/middlewares/platform-audit.js';

const v1Router = express.Router();

v1Router.use(platformAuditMiddleware);

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/user', userRoutes);

export default v1Router;
