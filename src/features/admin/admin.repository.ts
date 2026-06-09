import { eq, ilike, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { AdminTable, AdminType, AdminInsertType } from './admin.model';

export class AdminRepositoryClass {
  async list(filter: { email?: string; status?: string } = {}): Promise<AdminType[]> {
    const conditions: SQL[] = [];
    if (filter.email) conditions.push(ilike(AdminTable.email, `%${filter.email}%`));
    if (filter.status) conditions.push(eq(AdminTable.status, filter.status));

    return db
      .select()
      .from(AdminTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(AdminTable.createdAt);
  }

  async getById(id: string): Promise<AdminType | null> {
    const rows = await db.select().from(AdminTable).where(eq(AdminTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async getByEmail(email: string): Promise<AdminType | null> {
    const rows = await db.select().from(AdminTable).where(eq(AdminTable.email, email)).limit(1);
    return rows[0] ?? null;
  }

  async create(data: AdminInsertType): Promise<AdminType> {
    const [row] = await db.insert(AdminTable).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<AdminInsertType>): Promise<AdminType | null> {
    const [row] = await db
      .update(AdminTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(AdminTable.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string, updatedBy: string): Promise<AdminType | null> {
    return this.update(id, { status: 'inactive', updatedBy });
  }
}
