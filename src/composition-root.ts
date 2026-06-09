import { AuthRepositoryClass } from '@/features/auth/auth.repository.js';
import { AuthControllerClass } from '@/features/auth/auth.controller.js';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { HealthControllerClass } from '@/features/health/health.controller.js';
import { AdminRepositoryClass } from '@/features/admin/admin.repository.js';
import { AdminControllerClass } from '@/features/admin/admin.controller.js';
import { RoleRepositoryClass } from '@/features/rbac/role/role.repository.js';
import { RoleControllerClass } from '@/features/rbac/role/role.controller.js';
import { ModuleRepositoryClass } from '@/features/rbac/module/module.repository.js';
import { ModuleControllerClass } from '@/features/rbac/module/module.controller.js';
import { PermissionRepositoryClass } from '@/features/rbac/permission/permission.repository.js';
import { PermissionControllerClass } from '@/features/rbac/permission/permission.controller.js';
import { RolePermissionRepositoryClass } from '@/features/rbac/role-permission/role-permission.repository.js';
import { RolePermissionControllerClass } from '@/features/rbac/role-permission/role-permission.controller.js';
import { RbacControllerClass } from '@/features/rbac/rbac.controller.js';
import { AuditLogRepositoryClass } from '@/features/audit-log/audit.repository.js';
import { AuditLogControllerClass } from '@/features/audit-log/audit-log.controller.js';

export const jwtController = new JwtControllerClass();
export const authRepository = new AuthRepositoryClass(jwtController);
export const authController = new AuthControllerClass(authRepository, jwtController);
export const healthController = new HealthControllerClass();

export const adminRepository = new AdminRepositoryClass();
export const adminController = new AdminControllerClass(adminRepository);

export const roleRepository = new RoleRepositoryClass();
export const roleController = new RoleControllerClass(roleRepository);

export const moduleRepository = new ModuleRepositoryClass();
export const moduleController = new ModuleControllerClass(moduleRepository);

export const permissionRepository = new PermissionRepositoryClass();
export const permissionController = new PermissionControllerClass(permissionRepository);

export const rolePermissionRepository = new RolePermissionRepositoryClass();
export const rolePermissionController = new RolePermissionControllerClass(rolePermissionRepository);

export const rbacController = new RbacControllerClass(rolePermissionRepository);

export const auditLogRepository = new AuditLogRepositoryClass();
export const auditLogController = new AuditLogControllerClass(auditLogRepository);
