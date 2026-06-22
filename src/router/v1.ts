import express from 'express';
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import adminRoutes from '@/features/admin/admin.routes.js';
import rbacRoutes from '@/features/rbac/rbac.routes.js';
import auditLogRoutes from '@/features/audit-log/audit-log.routes.js';
import agencyRoutes from '@/features/master-data/agency/agency.routes.js';
import prRoutes from '@/features/master-data/pr/pr.routes.js';
import outletOwnerRoutes from '@/features/master-data/outlet-owner/outlet-owner.routes.js';
import outletRoutes from '@/features/master-data/outlet-owner/outlet/outlet.routes.js';
import agencyUserRoutes from '@/features/master-data/agency/agency-user/agency-user.routes.js';
import { platformAuditMiddleware } from '@/middlewares/platform-audit.js';

const v1Router = express.Router();

v1Router.use(platformAuditMiddleware);

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/rbac', rbacRoutes);
v1Router.use('/audit-log', auditLogRoutes);
v1Router.use('/agency', agencyRoutes);
v1Router.use('/pr', prRoutes);
v1Router.use('/outlet-owner', outletOwnerRoutes);
v1Router.use('/outlet', outletRoutes);
v1Router.use('/agency-user', agencyUserRoutes);

export default v1Router;
