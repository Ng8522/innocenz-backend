import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index';
import { UserTable, UserType, UserInsertType } from './user.model';
import { DbTransaction } from '@/types/db-transaction';
import { logger } from '@/util/logger';

export class UserRepositoryClass {
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
