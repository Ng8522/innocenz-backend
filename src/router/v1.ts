import express from 'express';
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import userRoutes from '@/features/user/user.routes.js';
import { rbacRoutes } from '@/features/rbac/index.js';
import subscriptionRoutes from '@/features/subscription/subscription.routes.js';
import subscriptionFeatureRoutes from '@/features/subscription-feature/subscription-feature.routes.js';
import limitTypeRoutes from '@/features/limit-type/limit-type.routes.js';
import agencyRoutes from '@/features/agency/agency.routes.js';
import outletRoutes from '@/features/outlet/outlet.routes.js';
import commissionConfigRoutes from '@/features/commission/commission-config.routes.js';
import { platformAuditMiddleware } from '@/middlewares/platform-audit.js';
import authenticateJWT from '@/middlewares/authenticate-jwt.js';

const v1Router = express.Router();

v1Router.use(platformAuditMiddleware);

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use(authenticateJWT);
v1Router.use('/user', userRoutes);
v1Router.use('/rbac', rbacRoutes);
v1Router.use('/subscription', subscriptionRoutes);
v1Router.use('/subscription-feature', subscriptionFeatureRoutes);
v1Router.use('/limit-type', limitTypeRoutes);
v1Router.use('/agency', agencyRoutes);
v1Router.use('/outlet', outletRoutes);
v1Router.use('/commission-config', commissionConfigRoutes);

export default v1Router;
