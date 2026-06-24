import { AuthRepositoryClass } from '@/features/auth/auth.repository.js';
import { AuthControllerClass } from '@/features/auth/auth.controller.js';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { HealthControllerClass } from '@/features/health/health.controller.js';
import { RoleRepositoryClass } from '@/features/rbac/role/role.repository.js';
import { RoleControllerClass } from '@/features/rbac/role/role.controller.js';
import { ModuleRepositoryClass } from '@/features/rbac/module/module.repository.js';
import { ModuleControllerClass } from '@/features/rbac/module/module.controller.js';
import { PermissionRepositoryClass } from '@/features/rbac/permission/permission.repository.js';
import { PermissionControllerClass } from '@/features/rbac/permission/permission.controller.js';
import { RolePermissionRepositoryClass } from '@/features/rbac/role-permission/role-permission.repository.js';
import { RolePermissionControllerClass } from '@/features/rbac/role-permission/role-permission.controller.js';
import { UserRepositoryClass } from '@/features/user/user.repository.js';
import { UserControllerClass } from '@/features/user/user.controller.js';
import { UserRoleRepositoryClass } from '@/features/rbac/user-role/user-role.repository.js';
import { UserRoleControllerClass } from '@/features/rbac/user-role/user-role.controller.js';
import { AuditLogRepositoryClass } from '@/features/audit-log/audit-log.repository.js';

export const jwtController = new JwtControllerClass();
export const userRoleRepository = new UserRoleRepositoryClass();
export const userRepository = new UserRepositoryClass(userRoleRepository);
export const authRepository = new AuthRepositoryClass(jwtController, userRepository, userRoleRepository);
export const authController = new AuthControllerClass(authRepository, jwtController, userRepository);
export const healthController = new HealthControllerClass();

export const roleRepository = new RoleRepositoryClass();
export const roleController = new RoleControllerClass(roleRepository);

export const moduleRepository = new ModuleRepositoryClass();
export const moduleController = new ModuleControllerClass(moduleRepository);

export const permissionRepository = new PermissionRepositoryClass();
export const permissionController = new PermissionControllerClass(permissionRepository);

export const rolePermissionRepository = new RolePermissionRepositoryClass();
export const rolePermissionController = new RolePermissionControllerClass(rolePermissionRepository);

export const userController = new UserControllerClass(userRepository);
export const userRoleController = new UserRoleControllerClass(userRoleRepository);
export const auditLogRepository = new AuditLogRepositoryClass();
