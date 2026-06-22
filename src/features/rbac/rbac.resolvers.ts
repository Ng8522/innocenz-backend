import { GraphQLError } from 'graphql';
import { db } from '@/db/index';
import {
  roleRepository,
  moduleRepository,
  permissionRepository,
  rolePermissionRepository,
} from '@/composition-root';
import { withAudit } from '@/features/audit-log/audit.wrapper';
import type { GraphQLContext } from '@/graphql/context';
import type { RoleType } from '@/features/rbac/role/role.model';
import { ModuleTable } from '@/features/rbac/module/module.model';
import type { ModuleType } from '@/features/rbac/module/module.model';
import { PermissionTable } from '@/features/rbac/permission/permission.model';
import type { PermissionType } from '@/features/rbac/permission/permission.model';
import { RolePermissionTable } from '@/features/rbac/role-permission/role-permission.model';
import { getGqlActor } from '@/features/master-data/graphql.util';

const DEFAULT_PERMISSIONS = [
  { permissionName: 'Read', description: 'Read access' },
  { permissionName: 'Create', description: 'Create access' },
  { permissionName: 'Update', description: 'Update access' },
  { permissionName: 'Delete', description: 'Delete access' },
  { permissionName: 'Approve', description: 'Approve access' },
] as const;

function transformPermission(permission: PermissionType) {
  const { id, createdAt, updatedAt, ...rest } = permission;
  return {
    permissionId: id,
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

function transformRolePermission(row: {
  id: string;
  roleId: string;
  permissionId: string;
  permissionName: string;
  moduleId: string;
  moduleName: string;
}) {
  return {
    id: row.id,
    roleId: row.roleId,
    permissionId: row.permissionId,
    permissionName: row.permissionName,
    moduleId: row.moduleId,
    moduleName: row.moduleName,
  };
}

async function getRolePermissions(roleId: string) {
  const rows = await rolePermissionRepository.list({ roleId });
  return rows.map(transformRolePermission);
}

function transformRole(role: RoleType, permissions: ReturnType<typeof transformRolePermission>[] = []) {
  const { id, createdAt, updatedAt, ...rest } = role;
  return {
    roleId: id,
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    permissions,
  };
}

function transformModule(module: ModuleType, permissions: ReturnType<typeof transformPermission>[] = []) {
  const { id, createdAt, updatedAt, ...rest } = module;
  return {
    moduleId: id,
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    permissions,
  };
}

async function buildModulesWithPermissions() {
  const modules = await moduleRepository.list();
  const permissions = await permissionRepository.list();

  return modules.map((module) =>
    transformModule(
      module,
      permissions.filter((p) => p.moduleId === module.id).map(transformPermission),
    ),
  );
}

export const resolvers = {
  Query: {
    roles: async () => {
      const roles = await roleRepository.list();
      return Promise.all(
        roles.map(async (role) => transformRole(role, await getRolePermissions(role.id))),
      );
    },

    role: async (_: unknown, { id }: { id: string }) => {
      const role = await roleRepository.getById(id);
      if (!role) return null;
      return transformRole(role, await getRolePermissions(id));
    },

    modules: async () => buildModulesWithPermissions(),

    module: async (_: unknown, { id }: { id: string }) => {
      const module = await moduleRepository.getById(id);
      if (!module) return null;
      const permissions = await permissionRepository.list({ moduleId: id });
      return transformModule(module, permissions.map(transformPermission));
    },

    permissions: async () => {
      const rows = await permissionRepository.list();
      return rows.map(transformPermission);
    },

    rolePermissions: async (_: unknown, { roleId }: { roleId: string }) => {
      return getRolePermissions(roleId);
    },

    myAccess: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }
      const rows = await rolePermissionRepository.getPermissionsByRoleName('admin');
      return rows.map((row) => ({
        roleId: row.roleId,
        roleName: row.roleName,
        permissionId: row.permissionId,
        permissionName: row.permissionName,
        moduleId: row.moduleId,
        moduleName: row.moduleName,
      }));
    },
  },

  Mutation: {
    createModule: withAudit(
      {
        entity: 'Module',
        action: 'CREATE',
        getEntityId: (result) => result?.moduleId ?? null,
      },
      async (_: unknown, { input }: { input: { moduleName: string; status?: string } }, context: GraphQLContext) => {
        const actor = getGqlActor(context);

        const { module, createdPermissions } = await db.transaction(async (tx) => {
          const [createdModule] = await tx
            .insert(ModuleTable)
            .values({
              moduleName: input.moduleName,
              status: input.status ?? 'active',
              createdBy: actor,
              updatedBy: actor,
            })
            .returning();

          const createdPermissions = await Promise.all(
            DEFAULT_PERMISSIONS.map((item) =>
              tx
                .insert(PermissionTable)
                .values({
                  moduleId: createdModule.id,
                  permissionName: item.permissionName,
                  description: item.description,
                  status: 'active',
                  createdBy: actor,
                  updatedBy: actor,
                })
                .returning()
                .then((rows) => rows[0]),
            ),
          );

          const adminRole = (await roleRepository.list()).find((role) => role.roleName === 'admin');
          if (adminRole) {
            await tx.insert(RolePermissionTable).values(
              createdPermissions.map((permission) => ({
                roleId: adminRole.id,
                permissionId: permission.id,
                createdBy: actor,
                updatedBy: actor,
              })),
            );
          }

          return { module: createdModule, createdPermissions };
        });

        return transformModule(module, createdPermissions.map(transformPermission));
      },
    ),

    updateModule: withAudit(
      {
        entity: 'Module',
        action: 'UPDATE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => moduleRepository.getById(args.id),
      },
      async (
        _: unknown,
        { id, input }: { id: string; input: { moduleName?: string; status?: string } },
        context: GraphQLContext,
      ) => {
        const module = await moduleRepository.update(id, {
          ...input,
          updatedBy: getGqlActor(context),
        });
        if (!module) return null;
        const permissions = await permissionRepository.list({ moduleId: id });
        return transformModule(module, permissions.map(transformPermission));
      },
    ),

    deleteModule: withAudit(
      {
        entity: 'Module',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => moduleRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const permissions = await permissionRepository.list({ moduleId: id });
        const module = await moduleRepository.deactivate(id, getGqlActor(context));
        if (!module) {
          throw new GraphQLError('Module not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return transformModule(module, permissions.map(transformPermission));
      },
    ),

    createRole: withAudit(
      {
        entity: 'Role',
        action: 'CREATE',
        getEntityId: (result) => result?.roleId ?? null,
      },
      async (
        _: unknown,
        { input }: { input: { roleName: string; status?: string; isParentFrom?: string } },
        context: GraphQLContext,
      ) => {
        const role = await roleRepository.create({
          roleName: input.roleName,
          status: input.status ?? 'active',
          isParentFrom: input.isParentFrom,
          createdBy: getGqlActor(context),
          updatedBy: getGqlActor(context),
        });
        return transformRole(role, []);
      },
    ),

    updateRole: withAudit(
      {
        entity: 'Role',
        action: 'UPDATE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => roleRepository.getById(args.id),
      },
      async (
        _: unknown,
        { id, input }: { id: string; input: { roleName?: string; status?: string; isParentFrom?: string } },
        context: GraphQLContext,
      ) => {
        const role = await roleRepository.update(id, {
          ...input,
          updatedBy: getGqlActor(context),
        });
        if (!role) return null;
        return transformRole(role, await getRolePermissions(role.id));
      },
    ),

    deleteRole: withAudit(
      {
        entity: 'Role',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => roleRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const permissions = await getRolePermissions(id);
        const role = await roleRepository.deactivate(id, getGqlActor(context));
        if (!role) {
          throw new GraphQLError('Role not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return transformRole(role, permissions);
      },
    ),

    createPermission: withAudit(
      {
        entity: 'Permission',
        action: 'CREATE',
        getEntityId: (result) => result?.permissionId ?? null,
      },
      async (
        _: unknown,
        {
          input,
        }: {
          input: { moduleId: string; permissionName: string; description: string; status?: string };
        },
        context: GraphQLContext,
      ) => {
        const permission = await permissionRepository.create({
          moduleId: input.moduleId,
          permissionName: input.permissionName,
          description: input.description,
          status: input.status ?? 'active',
          createdBy: getGqlActor(context),
          updatedBy: getGqlActor(context),
        });
        return transformPermission(permission);
      },
    ),

    updatePermission: withAudit(
      {
        entity: 'Permission',
        action: 'UPDATE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => permissionRepository.getById(args.id),
      },
      async (
        _: unknown,
        {
          id,
          input,
        }: {
          id: string;
          input: Partial<{
            moduleId: string;
            permissionName: string;
            description: string;
            status: string;
          }>;
        },
        context: GraphQLContext,
      ) => {
        const permission = await permissionRepository.update(id, {
          ...input,
          updatedBy: getGqlActor(context),
        });
        if (!permission) return null;
        return transformPermission(permission);
      },
    ),

    deletePermission: withAudit(
      {
        entity: 'Permission',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => permissionRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const permission = await permissionRepository.deactivate(id, getGqlActor(context));
        if (!permission) {
          throw new GraphQLError('Permission not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return transformPermission(permission);
      },
    ),

    createRolePermission: withAudit(
      {
        entity: 'RolePermission',
        action: 'CREATE',
        getEntityId: (result) => result?.id ?? null,
      },
      async (
        _: unknown,
        { input }: { input: { roleId: string; permissionId: string } },
        context: GraphQLContext,
      ) => {
        await rolePermissionRepository.create({
          roleId: input.roleId,
          permissionId: input.permissionId,
          createdBy: getGqlActor(context),
          updatedBy: getGqlActor(context),
        });
        const rows = await rolePermissionRepository.list({
          roleId: input.roleId,
          permissionId: input.permissionId,
        });
        const row = rows[0];
        if (!row) {
          throw new GraphQLError('Failed to create role permission', {
            extensions: { code: 'INTERNAL_SERVER_ERROR', http: { status: 500 } },
          });
        }
        return transformRolePermission(row);
      },
    ),

    syncRolePermissions: withAudit(
      {
        entity: 'RolePermission',
        action: 'BULK_UPDATE',
        getEntityId: (_, args) => args.roleId,
        getOldData: async (args) => rolePermissionRepository.list({ roleId: args.roleId }),
      },
      async (
        _: unknown,
        { roleId, permissionIds }: { roleId: string; permissionIds: string[] },
        context: GraphQLContext,
      ) => {
        await rolePermissionRepository.sync(roleId, permissionIds, getGqlActor(context));
        return getRolePermissions(roleId);
      },
    ),

    deleteRolePermission: withAudit(
      {
        entity: 'RolePermission',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => rolePermissionRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }) => {
        const deleted = await rolePermissionRepository.remove(id);
        return deleted;
      },
    ),
  },

  RbacRole: {
    permissions: async (parent: { roleId: string; permissions?: ReturnType<typeof transformRolePermission>[] }) => {
      if (parent.permissions) return parent.permissions;
      return getRolePermissions(parent.roleId);
    },
  },

  RbacModule: {
    permissions: async (parent: { moduleId: string; permissions?: ReturnType<typeof transformPermission>[] }) => {
      if (parent.permissions) return parent.permissions;
      const rows = await permissionRepository.list({ moduleId: parent.moduleId });
      return rows.map(transformPermission);
    },
  },
};
