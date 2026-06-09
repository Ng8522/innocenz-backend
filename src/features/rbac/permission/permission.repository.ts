import { eq, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { PermissionTable, PermissionType, PermissionInsertType } from './permission.model';
import { INACTIVE_STATUS } from '@/features/rbac/constants';

export class PermissionRepositoryClass {
  async list(filter: { moduleId?: string; status?: string } = {}): Promise<PermissionType[]> {
    const conditions: SQL[] = [];
    if (filter.moduleId) conditions.push(eq(PermissionTable.moduleId, filter.moduleId));
    if (filter.status) conditions.push(eq(PermissionTable.status, filter.status));
    return db
      .select()
      .from(PermissionTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(PermissionTable.permissionName);
  }

  async getById(id: string): Promise<PermissionType | null> {
    const rows = await db.select().from(PermissionTable).where(eq(PermissionTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(data: PermissionInsertType): Promise<PermissionType> {
    const [row] = await db.insert(PermissionTable).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<PermissionInsertType>): Promise<PermissionType | null> {
    const [row] = await db
      .update(PermissionTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(PermissionTable.id, id))
      .returning();
    return row ?? null;
  }

  async deactivate(id: string, updatedBy: string): Promise<PermissionType | null> {
    return this.update(id, { status: INACTIVE_STATUS, updatedBy });
  }
}
