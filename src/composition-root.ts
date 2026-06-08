import { AuthRepositoryClass } from '@/features/auth/auth.repository.js';
import { AuthControllerClass } from '@/features/auth/auth.controller.js';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { HealthControllerClass } from '@/features/health/health.controller.js';
import { AdminRepositoryClass } from '@/features/admin/admin.repository.js';
import { AdminControllerClass } from '@/features/admin/admin.controller.js';
import { RbacRepositoryClass } from '@/features/rbac/rbac.repository.js';
import { RbacControllerClass } from '@/features/rbac/rbac.controller.js';
import { AuditLogRepositoryClass } from '@/features/audit-log/audit-log.repository.js';
import { AuditLogControllerClass } from '@/features/audit-log/audit-log.controller.js';

export const jwtController = new JwtControllerClass();
export const authRepository = new AuthRepositoryClass(jwtController);
export const authController = new AuthControllerClass(authRepository, jwtController);
export const healthController = new HealthControllerClass();

export const adminRepository = new AdminRepositoryClass();
export const adminController = new AdminControllerClass(adminRepository);

export const rbacRepository = new RbacRepositoryClass();
export const rbacController = new RbacControllerClass(rbacRepository);

export const auditLogRepository = new AuditLogRepositoryClass();
export const auditLogController = new AuditLogControllerClass(auditLogRepository);
