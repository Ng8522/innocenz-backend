import { and, eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { logger } from '@/util/logger';
import { DbTransaction } from '@/types/db-transaction';
import { AgencyMemberTable, AgencyMemberInsertType, AgencyMemberType } from './agency.model';

export class AgencyMemberRepositoryClass {
  async add(
    data: Omit<AgencyMemberInsertType, 'id' | 'createdAt' | 'updatedAt'>,
    tx?: DbTransaction,
  ): Promise<AgencyMemberType> {
    try {
      const dbClient = tx ?? db;
      const [member] = await dbClient.insert(AgencyMemberTable).values(data).returning();
      logger.info('[AgencyMemberRepository.add] Member added:', member.id);
      return member;
    } catch (error) {
      logger.error('[AgencyMemberRepository.add] Error:', error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<AgencyMemberInsertType>,
    tx?: DbTransaction,
  ): Promise<AgencyMemberType | null> {
    try {
      const dbClient = tx ?? db;
      const [member] = await dbClient
        .update(AgencyMemberTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(AgencyMemberTable.id, id))
        .returning();
      return member ?? null;
    } catch (error) {
      logger.error('[AgencyMemberRepository.update] Error:', error);
      return null;
    }
  }

  async getById(id: string): Promise<AgencyMemberType | null> {
    try {
      const [member] = await db
        .select()
        .from(AgencyMemberTable)
        .where(eq(AgencyMemberTable.id, id))
        .limit(1);
      return member ?? null;
    } catch (error) {
      logger.error('[AgencyMemberRepository.getById] Error:', error);
      return null;
    }
  }

  async getByAgencyAndUser(agencyId: string, userId: string): Promise<AgencyMemberType | null> {
    try {
      const [member] = await db
        .select()
        .from(AgencyMemberTable)
        .where(and(eq(AgencyMemberTable.agencyId, agencyId), eq(AgencyMemberTable.userId, userId)))
        .limit(1);
      return member ?? null;
    } catch (error) {
      logger.error('[AgencyMemberRepository.getByAgencyAndUser] Error:', error);
      return null;
    }
  }

  async listByAgency(agencyId: string): Promise<AgencyMemberType[]> {
    try {
      return db
        .select()
        .from(AgencyMemberTable)
        .where(eq(AgencyMemberTable.agencyId, agencyId))
        .orderBy(AgencyMemberTable.createdAt);
    } catch (error) {
      logger.error('[AgencyMemberRepository.listByAgency] Error:', error);
      return [];
    }
  }

  async listByUser(userId: string): Promise<AgencyMemberType[]> {
    try {
      return db
        .select()
        .from(AgencyMemberTable)
        .where(eq(AgencyMemberTable.userId, userId));
    } catch (error) {
      logger.error('[AgencyMemberRepository.listByUser] Error:', error);
      return [];
    }
  }

  async remove(id: string, tx?: DbTransaction): Promise<boolean> {
    try {
      const dbClient = tx ?? db;
      await dbClient
        .update(AgencyMemberTable)
        .set({ status: 'inactive', updatedAt: new Date() })
        .where(eq(AgencyMemberTable.id, id));
      return true;
    } catch (error) {
      logger.error('[AgencyMemberRepository.remove] Error:', error);
      return false;
    }
  }
}
