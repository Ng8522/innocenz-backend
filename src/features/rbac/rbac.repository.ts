import { eq, ilike, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { RoleTable, RoleType, RoleInsertType } from '@/features/master-data/role/role.model';
import { ModuleTable, ModuleType, ModuleInsertType } from '@/features/master-data/module/module.model';
import {
  PermissionTable,
  PermissionType,
  PermissionInsertType,
} from '@/features/master-data/permission/permission.model';
import {
  RolePermissionTable,
  RolePermissionType,
  RolePermissionInsertType,
} from '@/features/role-permission/role-permission.model';
import {
  AdminRoleTable,
  AdminRoleType,
  AdminRoleInsertType,
} from '@/features/admin-role/admin-role.model';
import { AdminTable } from '@/features/admin/admin.model';

export class RbacRepositoryClass {
  // ── Roles ──

  async listRoles(filter: { roleName?: string; status?: string } = {}): Promise<RoleType[]> {
    const conditions: SQL[] = [];
    if (filter.roleName) conditions.push(ilike(RoleTable.roleName, `%${filter.roleName}%`));
    if (filter.status) conditions.push(eq(RoleTable.status, filter.status));
    return db
      .select()
      .from(RoleTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(RoleTable.roleName);
  }

  async getRoleById(id: string): Promise<RoleType | null> {
    const rows = await db.select().from(RoleTable).where(eq(RoleTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async createRole(data: RoleInsertType): Promise<RoleType> {
    const [row] = await db.insert(RoleTable).values(data).returning();
    return row;
  }

  async updateRole(id: string, data: Partial<RoleInsertType>): Promise<RoleType | null> {
    const [row] = await db
      .update(RoleTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(RoleTable.id, id))
      .returning();
    return row ?? null;
  }

  async deleteRole(id: string): Promise<boolean> {
    const rows = await db.delete(RoleTable).where(eq(RoleTable.id, id)).returning({ id: RoleTable.id });
    return rows.length > 0;
  }

  // ── Modules ──

  async listModules(filter: { moduleName?: string; status?: string } = {}): Promise<ModuleType[]> {
    const conditions: SQL[] = [];
    if (filter.moduleName) conditions.push(ilike(ModuleTable.moduleName, `%${filter.moduleName}%`));
    if (filter.status) conditions.push(eq(ModuleTable.status, filter.status));
    return db
      .select()
      .from(ModuleTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(ModuleTable.moduleName);
  }

  async getModuleById(id: string): Promise<ModuleType | null> {
    const rows = await db.select().from(ModuleTable).where(eq(ModuleTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async createModule(data: ModuleInsertType): Promise<ModuleType> {
    const [row] = await db.insert(ModuleTable).values(data).returning();
    return row;
  }

  async updateModule(id: string, data: Partial<ModuleInsertType>): Promise<ModuleType | null> {
    const [row] = await db
      .update(ModuleTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ModuleTable.id, id))
      .returning();
    return row ?? null;
  }

  async deleteModule(id: string): Promise<boolean> {
    const rows = await db.delete(ModuleTable).where(eq(ModuleTable.id, id)).returning({ id: ModuleTable.id });
    return rows.length > 0;
  }

  // ── Permissions ──

  async listPermissions(filter: { moduleId?: string; status?: string } = {}): Promise<PermissionType[]> {
    const conditions: SQL[] = [];
    if (filter.moduleId) conditions.push(eq(PermissionTable.moduleId, filter.moduleId));
    if (filter.status) conditions.push(eq(PermissionTable.status, filter.status));
    return db
      .select()
      .from(PermissionTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(PermissionTable.permissionName);
  }

  async getPermissionById(id: string): Promise<PermissionType | null> {
    const rows = await db.select().from(PermissionTable).where(eq(PermissionTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async createPermission(data: PermissionInsertType): Promise<PermissionType> {
    const [row] = await db.insert(PermissionTable).values(data).returning();
    return row;
  }

  async updatePermission(id: string, data: Partial<PermissionInsertType>): Promise<PermissionType | null> {
    const [row] = await db
      .update(PermissionTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(PermissionTable.id, id))
      .returning();
    return row ?? null;
  }

  async deletePermission(id: string): Promise<boolean> {
    const rows = await db
      .delete(PermissionTable)
      .where(eq(PermissionTable.id, id))
      .returning({ id: PermissionTable.id });
    return rows.length > 0;
  }

  // ── Role permissions ──

  async listRolePermissions(filter: { roleId?: string; permissionId?: string } = {}) {
    const conditions: SQL[] = [];
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
      .where(conditions.length ? and(...conditions) : undefined);
  }

  async createRolePermission(data: RolePermissionInsertType): Promise<RolePermissionType> {
    const [row] = await db.insert(RolePermissionTable).values(data).returning();
    return row;
  }

  async syncRolePermissions(roleId: string, permissionIds: string[], actor: string): Promise<RolePermissionType[]> {
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

  async deleteRolePermission(id: string): Promise<boolean> {
    const rows = await db
      .delete(RolePermissionTable)
      .where(eq(RolePermissionTable.id, id))
      .returning({ id: RolePermissionTable.id });
    return rows.length > 0;
  }

  // ── Admin roles ──

  async listAdminRoles(filter: { adminId?: string; roleId?: string; status?: string } = {}) {
    const conditions: SQL[] = [];
    if (filter.adminId) conditions.push(eq(AdminRoleTable.adminId, filter.adminId));
    if (filter.roleId) conditions.push(eq(AdminRoleTable.roleId, filter.roleId));
    if (filter.status) conditions.push(eq(AdminRoleTable.status, filter.status));

    return db
      .select({
        id: AdminRoleTable.id,
        adminId: AdminRoleTable.adminId,
        adminEmail: AdminTable.email,
        adminDisplayName: AdminTable.displayName,
        roleId: AdminRoleTable.roleId,
        roleName: RoleTable.roleName,
        status: AdminRoleTable.status,
        createdAt: AdminRoleTable.createdAt,
        updatedAt: AdminRoleTable.updatedAt,
      })
      .from(AdminRoleTable)
      .innerJoin(AdminTable, eq(AdminRoleTable.adminId, AdminTable.id))
      .innerJoin(RoleTable, eq(AdminRoleTable.roleId, RoleTable.id))
      .where(conditions.length ? and(...conditions) : undefined);
  }

  async createAdminRole(data: AdminRoleInsertType): Promise<AdminRoleType> {
    const [row] = await db.insert(AdminRoleTable).values(data).returning();
    return row;
  }

  async updateAdminRole(id: string, data: Partial<AdminRoleInsertType>): Promise<AdminRoleType | null> {
    const [row] = await db
      .update(AdminRoleTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(AdminRoleTable.id, id))
      .returning();
    return row ?? null;
  }

  async deleteAdminRole(id: string): Promise<boolean> {
    const rows = await db
      .delete(AdminRoleTable)
      .where(eq(AdminRoleTable.id, id))
      .returning({ id: AdminRoleTable.id });
    return rows.length > 0;
  }

  async getAdminPermissions(adminId: string) {
    return db
      .select({
        roleId: RoleTable.id,
        roleName: RoleTable.roleName,
        permissionId: PermissionTable.id,
        permissionName: PermissionTable.permissionName,
        moduleId: ModuleTable.id,
        moduleName: ModuleTable.moduleName,
      })
      .from(AdminRoleTable)
      .innerJoin(RoleTable, eq(AdminRoleTable.roleId, RoleTable.id))
      .innerJoin(RolePermissionTable, eq(RoleTable.id, RolePermissionTable.roleId))
      .innerJoin(PermissionTable, eq(RolePermissionTable.permissionId, PermissionTable.id))
      .innerJoin(ModuleTable, eq(PermissionTable.moduleId, ModuleTable.id))
      .where(and(eq(AdminRoleTable.adminId, adminId), eq(AdminRoleTable.status, 'active')));
  }
}
