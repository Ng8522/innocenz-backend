import { eq, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { AgencyUserTable, AgencyUserInsertType, AgencyUserFilter, AgencyUserRow } from './agency-user.model';
import { AgencyTable } from '../agency.model';
import { UserTable } from '@/features/user/user.model';

export class AgencyUserRepositoryClass {
  private selectFields = {
    agencyId: AgencyUserTable.agencyId,
    userId: AgencyUserTable.userId,
    createdAt: AgencyUserTable.createdAt,
    updatedAt: AgencyUserTable.updatedAt,
    createdBy: AgencyUserTable.createdBy,
    updatedBy: AgencyUserTable.updatedBy,
    agencyName: AgencyTable.agencyName,
    userName: UserTable.name,
    userEmail: UserTable.email,
  };

  async list(filter: AgencyUserFilter = {}): Promise<AgencyUserRow[]> {
    const conditions: SQL[] = [];
    if (filter.agencyId) conditions.push(eq(AgencyUserTable.agencyId, filter.agencyId));
    if (filter.userId) conditions.push(eq(AgencyUserTable.userId, filter.userId));

    return db
      .select(this.selectFields)
      .from(AgencyUserTable)
      .innerJoin(AgencyTable, eq(AgencyUserTable.agencyId, AgencyTable.id))
      .innerJoin(UserTable, eq(AgencyUserTable.userId, UserTable.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(AgencyTable.agencyName, UserTable.name);
  }

  async getByKey(agencyId: string, userId: string): Promise<AgencyUserRow | null> {
    const rows = await db
      .select(this.selectFields)
      .from(AgencyUserTable)
      .innerJoin(AgencyTable, eq(AgencyUserTable.agencyId, AgencyTable.id))
      .innerJoin(UserTable, eq(AgencyUserTable.userId, UserTable.id))
      .where(and(eq(AgencyUserTable.agencyId, agencyId), eq(AgencyUserTable.userId, userId)))
      .limit(1);

    return rows[0] ?? null;
  }

  async exists(agencyId: string, userId: string): Promise<boolean> {
    const row = await this.getByKey(agencyId, userId);
    return row !== null;
  }

  async create(data: AgencyUserInsertType): Promise<AgencyUserRow> {
    await db.insert(AgencyUserTable).values(data);
    const row = await this.getByKey(data.agencyId, data.userId);
    if (!row) throw new Error('Failed to create agency user');
    return row;
  }

  async update(agencyId: string, userId: string, updatedBy: string): Promise<AgencyUserRow | null> {
    const rows = await db
      .update(AgencyUserTable)
      .set({ updatedBy, updatedAt: new Date() })
      .where(and(eq(AgencyUserTable.agencyId, agencyId), eq(AgencyUserTable.userId, userId)))
      .returning();

    if (rows.length === 0) return null;
    return this.getByKey(agencyId, userId);
  }

  async remove(agencyId: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(AgencyUserTable)
      .where(and(eq(AgencyUserTable.agencyId, agencyId), eq(AgencyUserTable.userId, userId)))
      .returning();

    return rows.length > 0;
  }
}
