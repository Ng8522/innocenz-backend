import { eq, ilike, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { RoleTable, RoleType, RoleInsertType, RoleFilter } from './role.model';
import { INACTIVE_STATUS } from '@/features/rbac/constants';

export class RoleRepositoryClass {
  async list(filter: RoleFilter = {}): Promise<RoleType[]> {
    const conditions: SQL[] = [];
    if (filter.roleName) conditions.push(ilike(RoleTable.roleName, `%${filter.roleName}%`));
    if (filter.status) conditions.push(eq(RoleTable.status, filter.status));
    if (filter.isParentFrom) conditions.push(eq(RoleTable.isParentFrom, filter.isParentFrom));
    return db
      .select()
      .from(RoleTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(RoleTable.roleName);
  }

  async getById(id: string): Promise<RoleType | null> {
    const rows = await db.select().from(RoleTable).where(eq(RoleTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(data: RoleInsertType): Promise<RoleType> {
    const [row] = await db.insert(RoleTable).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<RoleInsertType>): Promise<RoleType | null> {
    const [row] = await db
      .update(RoleTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(RoleTable.id, id))
      .returning();
    return row ?? null;
  }

  async deactivate(id: string, updatedBy: string): Promise<RoleType | null> {
    return this.update(id, { status: INACTIVE_STATUS, updatedBy });
  }
}
