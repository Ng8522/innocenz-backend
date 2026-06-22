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
import { AgencyRepositoryClass } from '@/features/master-data/agency/agency.repository.js';
import { AgencyControllerClass } from '@/features/master-data/agency/agency.controller.js';
import { UserRepositoryClass } from '@/features/user/user.repository.js';
import { PrRepositoryClass } from '@/features/master-data/pr/pr.repository.js';
import { PrControllerClass } from '@/features/master-data/pr/pr.controller.js';
import { OutletOwnerRepositoryClass } from '@/features/master-data/outlet-owner/outlet-owner.repository.js';
import { OutletOwnerControllerClass } from '@/features/master-data/outlet-owner/outlet-owner.controller.js';
import { OutletRepositoryClass } from '@/features/master-data/outlet-owner/outlet/outlet.repository.js';
import { OutletControllerClass } from '@/features/master-data/outlet-owner/outlet/outlet.controller.js';
import { AgencyUserRepositoryClass } from '@/features/master-data/agency/agency-user/agency-user.repository.js';
import { AgencyUserControllerClass } from '@/features/master-data/agency/agency-user/agency-user.controller.js';

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

export const agencyRepository = new AgencyRepositoryClass();
export const agencyController = new AgencyControllerClass(agencyRepository);

export const userRepository = new UserRepositoryClass();

export const prRepository = new PrRepositoryClass();
export const prController = new PrControllerClass(prRepository, userRepository);

export const outletOwnerRepository = new OutletOwnerRepositoryClass();
export const outletOwnerController = new OutletOwnerControllerClass(outletOwnerRepository, userRepository);

export const outletRepository = new OutletRepositoryClass();
export const outletController = new OutletControllerClass(outletRepository);

export const agencyUserRepository = new AgencyUserRepositoryClass();
export const agencyUserController = new AgencyUserControllerClass(agencyUserRepository);
