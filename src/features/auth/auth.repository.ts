import { UsersTable, UserType, UserInsertType } from './auth.model.js';
import { db } from '@/db/index';
import { eq } from 'drizzle-orm';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { logger } from '@/util/logger.js';

export class AuthRepositoryClass {
  constructor(private jwtController: JwtControllerClass) {}

  async getUserDataByToken(token: string): Promise<UserType | null> {
    try {
      const decodedToken = this.jwtController.verifyToken(token);
      if (!decodedToken.username) {
        return null;
      }
      return this.getUserByEmail(decodedToken.username);
    } catch (error) {
      logger.error('[AuthRepository.getUserDataByToken] Error:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<UserType | null> {
    const users = await db.select().from(UsersTable).where(eq(UsersTable.email, email)).limit(1);
    return users.length > 0 ? users[0] : null;
  }

  async getUserById(id: string): Promise<UserType | null> {
    const users = await db.select().from(UsersTable).where(eq(UsersTable.id, id)).limit(1);
    return users.length > 0 ? users[0] : null;
  }

  async createUser(data: UserInsertType): Promise<UserType> {
    const [user] = await db.insert(UsersTable).values(data).returning();
    return user;
  }
}
