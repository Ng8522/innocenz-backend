import { eq, ilike, and, SQL, ne } from 'drizzle-orm';
import { db } from '@/db/index';
import { PrTable, PrType, PrInsertType, PrFilter } from './pr.model';
import { INACTIVE_STATUS } from '@/features/rbac/constants';
import { DbTransaction } from '@/types/db-transaction';

export class PrRepositoryClass {
  async list(filter: PrFilter = {}): Promise<PrType[]> {
    const conditions: SQL[] = [];
    if (filter.icNo) conditions.push(ilike(PrTable.icNo, `%${filter.icNo}%`));
    if (filter.prNo) conditions.push(ilike(PrTable.prNo, `%${filter.prNo}%`));
    if (filter.status) conditions.push(eq(PrTable.status, filter.status));
    if (filter.userId) conditions.push(eq(PrTable.userId, filter.userId));
    if (filter.prAgency) conditions.push(eq(PrTable.prAgency, filter.prAgency));

    return db
      .select()
      .from(PrTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(PrTable.createdAt);
  }

  async getById(id: string): Promise<PrType | null> {
    const rows = await db.select().from(PrTable).where(eq(PrTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async getByIcNo(icNo: string, excludeId?: string): Promise<PrType | null> {
    const conditions: SQL[] = [eq(PrTable.icNo, icNo)];
    if (excludeId) conditions.push(ne(PrTable.id, excludeId));

    const rows = await db
      .select()
      .from(PrTable)
      .where(and(...conditions))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: PrInsertType, tx?: DbTransaction): Promise<PrType> {
    const [row] = await (tx ?? db).insert(PrTable).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<PrInsertType>): Promise<PrType | null> {
    const [row] = await db
      .update(PrTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(PrTable.id, id))
      .returning();
    return row ?? null;
  }

  async deactivate(id: string, updatedBy: string): Promise<PrType | null> {
    return this.update(id, { status: INACTIVE_STATUS, updatedBy });
  }
}
