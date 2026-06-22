import express from 'express';
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import { platformAuditMiddleware } from '@/middlewares/platform-audit.js';

const v1Router = express.Router();

v1Router.use(platformAuditMiddleware);



export default v1Router;
