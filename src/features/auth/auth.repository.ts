import { db } from '@/db/index';
import { eq } from 'drizzle-orm';
import { JwtControllerClass } from '@/features/jwt/jwt.controller.js';
import { logger } from '@/util/logger.js';
import { UserTable, UserType } from '@/features/user/user.model.js';

export class AuthRepositoryClass {
  constructor(private jwtController: JwtControllerClass) {}
  
  async getUserByLoginMethod(method: 'email' | 'phone', value: string): Promise<UserType | null> {
    try {
      logger.info('[AuthRepository.getUserByLoginMethod] Getting user by login method:', method);
      let users: UserType[] = [];

      if (method === 'email') {
        logger.debug('[AuthRepository.getUserByLoginMethod] Getting user by email:', value);
        users = await db.select().from(UserTable).where(eq(UserTable.email, value)).limit(1);
      } else if (method === 'phone') {
        logger.debug('[AuthRepository.getUserByLoginMethod] Getting user by phone:', value);
        users = await db.select().from(UserTable).where(eq(UserTable.phoneNum, value)).limit(1);
      }
      logger.info('[AuthRepository.getUserByLoginMethod] Users:', users);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      logger.error('[AuthRepository.getUserByLoginMethod] Error:', error);
      return null;
    }
  }

  
}
