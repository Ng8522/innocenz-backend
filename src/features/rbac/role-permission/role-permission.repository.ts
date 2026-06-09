import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index';
import { RoleTable } from '@/features/rbac/role/role.model';
import { ModuleTable } from '@/features/rbac/module/module.model';
import { PermissionTable } from '@/features/rbac/permission/permission.model';
import {
  RolePermissionTable,
  RolePermissionType,
  RolePermissionInsertType,
} from './role-permission.model';
import { ACTIVE_STATUS } from '@/features/rbac/constants';

export class RolePermissionRepositoryClass {
  async list(filter: { roleId?: string; permissionId?: string } = {}) {
    const conditions = [
      eq(RoleTable.status, ACTIVE_STATUS),
      eq(PermissionTable.status, ACTIVE_STATUS),
      eq(ModuleTable.status, ACTIVE_STATUS),
    ];
    if (filter.roleId) conditions.push(eq(RolePermissionTable.roleId, filter.roleId));
    if (filter.permissionId) conditions.push(eq(RolePermissionTable.permissionId, filter.permissionId));

    return db
      .select({
        id: RolePermissionTable.id,
        roleId: RolePermissionTable.roleId,
        roleName: RoleTable.roleName,
        permissionId: RolePermissionTable.permissionId,
        permissionName: PermissionTable.permissionName,
        moduleId: PermissionTable.moduleId,
        moduleName: ModuleTable.moduleName,
        createdAt: RolePermissionTable.createdAt,
        updatedAt: RolePermissionTable.updatedAt,
      })
      .from(RolePermissionTable)
      .innerJoin(RoleTable, eq(RolePermissionTable.roleId, RoleTable.id))
      .innerJoin(PermissionTable, eq(RolePermissionTable.permissionId, PermissionTable.id))
      .innerJoin(ModuleTable, eq(PermissionTable.moduleId, ModuleTable.id))
      .where(and(...conditions));
  }

  async getById(id: string) {
    const rows = await db
      .select({
        id: RolePermissionTable.id,
        roleId: RolePermissionTable.roleId,
        roleName: RoleTable.roleName,
        permissionId: RolePermissionTable.permissionId,
        permissionName: PermissionTable.permissionName,
        moduleId: PermissionTable.moduleId,
        moduleName: ModuleTable.moduleName,
        createdAt: RolePermissionTable.createdAt,
        updatedAt: RolePermissionTable.updatedAt,
      })
      .from(RolePermissionTable)
      .innerJoin(RoleTable, eq(RolePermissionTable.roleId, RoleTable.id))
      .innerJoin(PermissionTable, eq(RolePermissionTable.permissionId, PermissionTable.id))
      .innerJoin(ModuleTable, eq(PermissionTable.moduleId, ModuleTable.id))
      .where(eq(RolePermissionTable.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: RolePermissionInsertType): Promise<RolePermissionType> {
    const [row] = await db.insert(RolePermissionTable).values(data).returning();
    return row;
  }

  async sync(roleId: string, permissionIds: string[], actor: string): Promise<RolePermissionType[]> {
    await db.delete(RolePermissionTable).where(eq(RolePermissionTable.roleId, roleId));
    if (permissionIds.length === 0) return [];

    return db
      .insert(RolePermissionTable)
      .values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
          createdBy: actor,
          updatedBy: actor,
        })),
      )
      .returning();
  }

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(RolePermissionTable)
      .where(eq(RolePermissionTable.id, id))
      .returning({ id: RolePermissionTable.id });
    return rows.length > 0;
  }

  async getPermissionsByRoleName(roleName: string) {
    return db
      .select({
        roleId: RoleTable.id,
        roleName: RoleTable.roleName,
        permissionId: PermissionTable.id,
        permissionName: PermissionTable.permissionName,
        moduleId: ModuleTable.id,
        moduleName: ModuleTable.moduleName,
      })
      .from(RoleTable)
      .innerJoin(RolePermissionTable, eq(RoleTable.id, RolePermissionTable.roleId))
      .innerJoin(PermissionTable, eq(RolePermissionTable.permissionId, PermissionTable.id))
      .innerJoin(ModuleTable, eq(PermissionTable.moduleId, ModuleTable.id))
      .where(
        and(
          eq(RoleTable.roleName, roleName),
          eq(RoleTable.status, ACTIVE_STATUS),
          eq(PermissionTable.status, ACTIVE_STATUS),
          eq(ModuleTable.status, ACTIVE_STATUS),
        ),
      );
  }
}
