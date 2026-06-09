import { eq, ilike, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { ModuleTable, ModuleType, ModuleInsertType } from './module.model';
import { INACTIVE_STATUS } from '@/features/rbac/constants';

export class ModuleRepositoryClass {
  async list(filter: { moduleName?: string; status?: string } = {}): Promise<ModuleType[]> {
    const conditions: SQL[] = [];
    if (filter.moduleName) conditions.push(ilike(ModuleTable.moduleName, `%${filter.moduleName}%`));
    if (filter.status) conditions.push(eq(ModuleTable.status, filter.status));
    return db
      .select()
      .from(ModuleTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(ModuleTable.moduleName);
  }

  async getById(id: string): Promise<ModuleType | null> {
    const rows = await db.select().from(ModuleTable).where(eq(ModuleTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(data: ModuleInsertType): Promise<ModuleType> {
    const [row] = await db.insert(ModuleTable).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<ModuleInsertType>): Promise<ModuleType | null> {
    const [row] = await db
      .update(ModuleTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ModuleTable.id, id))
      .returning();
    return row ?? null;
  }

  async deactivate(id: string, updatedBy: string): Promise<ModuleType | null> {
    return this.update(id, { status: INACTIVE_STATUS, updatedBy });
  }
}
