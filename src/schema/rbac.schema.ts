import { z } from 'zod';
import { permissionTypeValues } from '@/types/rbac-constant';

export const createModuleSchema = z.object({
    moduleName: z.string(),
});

export const createPermissionSchema = z.object({
    moduleId: z.string(),
    permissionType: z.enum(permissionTypeValues),
    description: z.string(),
});

export const createRoleSchema = z.object({
    roleName: z.string(),
});

export const createRolePermissionSchema = z.object({
    roleId: z.string(),
    permissionId: z.string(),
});

export const createUserRoleSchema = z.object({
    userId: z.string(),
    roleId: z.string(),
});
