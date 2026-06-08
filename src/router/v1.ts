import express from 'express';
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';

const v1Router = express.Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);

export default v1Router;
