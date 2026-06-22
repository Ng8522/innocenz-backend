import { eq, and, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { UserTable, UserType, UserInsertType, UserFilter } from './user.model';
import { DbTransaction } from '@/types/db-transaction';
import { logger } from '@/util/logger';
import { PaginatedResponse } from '@/util/pagination';
import { buildPeriodDateWhere } from '@/util/filter-date-format';
export class UserRepositoryClass {
  constructor() {}

  async getUser(filter: UserFilter, tx?: DbTransaction): Promise<PaginatedResponse<UserType>> {
    try {
      logger.info('[UserRepository.getUser] Getting user:', filter);
      logger.debug('Filter:', filter);

      const whereConditions: SQL[] = [];
      if (filter.id) {
        whereConditions.push(eq(UserTable.id, filter.id));
      }
      if (filter.email) {
        whereConditions.push(eq(UserTable.email, filter.email));
      }
      if (filter.phoneNum) {
        whereConditions.push(eq(UserTable.phoneNum, filter.phoneNum));
      }
      if (filter.accName) {
        whereConditions.push(eq(UserTable.accName, filter.accName));
      }
      if (filter.status) {
        whereConditions.push(eq(UserTable.status, filter.status));
      }

      const createdAtFilter = buildPeriodDateWhere(
        UserTable.createdAt,
        filter.startDate,
        filter.endDate,
      );
      if (createdAtFilter) {
        whereConditions.push(createdAtFilter);
      }

      const dbClient = tx ?? db;
      const users = await dbClient
        .select()
        .from(UserTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      logger.info('[UserRepository.getUser] Users successfully retrieved:', users.length);

      return {
        query: users,
        pagination: {
          count: users.length,
          totalCount: users.length,
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      logger.error('[UserRepository.getUser] Error:', error);
      throw error;
    }
  }

  async createUser(user: Omit<UserInsertType, 'userId' | 'createdAt' | 'updatedAt'>, tx?: DbTransaction): Promise<UserType> {
    try{
      logger.info('[UserRepository.createUser] Creating user:', user);
      const dbClient = tx || db;
      const [newUser] = await dbClient.insert(UserTable).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      logger.info('[UserRepository.createUser] User successfully created:', newUser);
      return newUser;
    } catch (error) {
      logger.error('[UserRepository.createUser] Error:', error);
      throw error;
    }
  }

  async updateUser(user: Partial<UserInsertType>, id: string, tx?: DbTransaction): Promise<UserType> {
    try{
      logger.info('[UserRepository.updateUser] Updating user:', user);
      logger.debug(user);
      const whereConditions= [eq(UserTable.id, id)];
      const dbClient = tx || db;
      const [updatedUser] = await dbClient.update(UserTable).set({...user, updatedAt: new Date()}).where(and(...whereConditions)).returning();
      logger.info('[UserRepository.updateUser] User successfully updated:', updatedUser);
      logger.debug(updatedUser);
      return updatedUser ?? null;
    } catch (error) {
      logger.error('[UserRepository.updateUser] Error:', error);
      throw error;
    }
  }
}
