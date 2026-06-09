import express from 'express';
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import adminRoutes from '@/features/admin/admin.routes.js';
import rbacRoutes from '@/features/rbac/rbac.routes.js';
import auditLogRoutes from '@/features/audit-log/audit-log.routes.js';
import { platformAuditMiddleware } from '@/middlewares/platform-audit.js';

const v1Router = express.Router();

v1Router.use(platformAuditMiddleware);

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/rbac', rbacRoutes);
v1Router.use('/audit-logs', auditLogRoutes);

export default v1Router;
