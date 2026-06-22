import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { OutletOwnerTable } from './outlet-owner.model';
import { UserTable } from '@/features/user/user.model';
import { DbTransaction } from '@/types/db-transaction';

export type OutletOwnerRow = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  userEmail: string;
  userName: string;
  userContactNo: string;
};

export class OutletOwnerRepositoryClass {
  async list(): Promise<OutletOwnerRow[]> {
    return db
      .select({
        id: OutletOwnerTable.id,
        userId: OutletOwnerTable.userId,
        createdAt: OutletOwnerTable.createdAt,
        updatedAt: OutletOwnerTable.updatedAt,
        createdBy: OutletOwnerTable.createdBy,
        updatedBy: OutletOwnerTable.updatedBy,
        userEmail: UserTable.email,
        userName: UserTable.name,
        userContactNo: UserTable.contactNo,
      })
      .from(OutletOwnerTable)
      .innerJoin(UserTable, eq(OutletOwnerTable.userId, UserTable.id))
      .orderBy(OutletOwnerTable.createdAt);
  }

  async getById(id: string): Promise<OutletOwnerRow | null> {
    const rows = await db
      .select({
        id: OutletOwnerTable.id,
        userId: OutletOwnerTable.userId,
        createdAt: OutletOwnerTable.createdAt,
        updatedAt: OutletOwnerTable.updatedAt,
        createdBy: OutletOwnerTable.createdBy,
        updatedBy: OutletOwnerTable.updatedBy,
        userEmail: UserTable.email,
        userName: UserTable.name,
        userContactNo: UserTable.contactNo,
      })
      .from(OutletOwnerTable)
      .innerJoin(UserTable, eq(OutletOwnerTable.userId, UserTable.id))
      .where(eq(OutletOwnerTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async getByUserId(userId: string): Promise<OutletOwnerRow | null> {
    const rows = await db
      .select({
        id: OutletOwnerTable.id,
        userId: OutletOwnerTable.userId,
        createdAt: OutletOwnerTable.createdAt,
        updatedAt: OutletOwnerTable.updatedAt,
        createdBy: OutletOwnerTable.createdBy,
        updatedBy: OutletOwnerTable.updatedBy,
        userEmail: UserTable.email,
        userName: UserTable.name,
        userContactNo: UserTable.contactNo,
      })
      .from(OutletOwnerTable)
      .innerJoin(UserTable, eq(OutletOwnerTable.userId, UserTable.id))
      .where(eq(OutletOwnerTable.userId, userId))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(
    data: typeof OutletOwnerTable.$inferInsert,
    tx?: DbTransaction,
  ): Promise<typeof OutletOwnerTable.$inferSelect> {
    const [row] = await (tx ?? db).insert(OutletOwnerTable).values(data).returning();
    return row;
  }
}
