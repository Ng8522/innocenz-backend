import { eq, and, asc, desc, count, ilike, inArray, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { UserTable, UserType, UserInsertType, UserFilter, UserSort } from './user.model';
import { UserRoleTable } from '@/features/rbac/user-role/user-role.model';
import { DbTransaction } from '@/types/db-transaction';
import { logger } from '@/util/logger';
import {
  paginateQuery,
  PaginationParams,
  PaginatedResponse,
  PgQueryType,
} from '@/util/pagination';
import { buildPeriodDateWhere } from '@/util/filter-date-format';

function buildUserWhere(filter: UserFilter): SQL | undefined {
  const whereConditions: SQL[] = [];

  if (filter.id) {
    whereConditions.push(eq(UserTable.id, filter.id));
  }
  if (filter.email) {
    whereConditions.push(ilike(UserTable.email, `%${filter.email}%`));
  }
  if (filter.phoneNum) {
    whereConditions.push(ilike(UserTable.phoneNum, `%${filter.phoneNum}%`));
  }
  if (filter.accName) {
    whereConditions.push(ilike(UserTable.accName, `%${filter.accName}%`));
  }
  if (filter.status) {
    whereConditions.push(eq(UserTable.status, filter.status));
  }
  if (filter.roleId) {
    whereConditions.push(
      inArray(
        UserTable.id,
        db
          .select({ userId: UserRoleTable.userId })
          .from(UserRoleTable)
          .where(eq(UserRoleTable.roleId, filter.roleId)),
      ),
    );
  }

  const createdAtFilter = buildPeriodDateWhere(
    UserTable.createdAt,
    filter.startDate ?? undefined,
    filter.endDate ?? undefined,
  );
  if (createdAtFilter) {
    whereConditions.push(createdAtFilter);
  }

  return whereConditions.length > 0 ? and(...whereConditions) : undefined;
}

function buildUserOrderBy(sort?: UserSort) {
  const direction = sort?.direction === 'ASC' ? asc : desc;

  switch (sort?.field ?? 'CREATED_AT') {
    case 'ACC_NAME':
      return direction(UserTable.accName);
    case 'EMAIL':
      return direction(UserTable.email);
    case 'STATUS':
      return direction(UserTable.status);
    case 'UPDATED_AT':
      return direction(UserTable.updatedAt);
    default:
      return direction(UserTable.createdAt);
  }
}

export class UserRepositoryClass {
  constructor() {}

  /**
   * Get users with filter, sort, and pagination (REST-style: filter/sort/pagination in repository).
   * Used by GraphQL users query and any client that needs paginated user list.
   */
  async getUsers(
    filter: UserFilter = {},
    pagination: PaginationParams = {},
    sort?: UserSort,
    tx?: DbTransaction,
  ): Promise<PaginatedResponse<UserType>> {
    try {
      logger.info('[UserRepository.getUsers] Getting users:', { filter, pagination, sort });

      const where = buildUserWhere(filter);
      const dbClient = tx ?? db;
      const pageSize = pagination.pageSize ?? 10;
      const pageNumber = pagination.pageNumber ?? pagination.page ?? 1;

      const [{ totalCount }] = await dbClient
        .select({ totalCount: count() })
        .from(UserTable)
        .where(where);

      const baseQuery = dbClient
        .select()
        .from(UserTable)
        .where(where)
        .orderBy(buildUserOrderBy(sort));

      const { query, pagination: paginationMeta } = paginateQuery(
        baseQuery as unknown as PgQueryType,
        pageSize,
        pageNumber,
        Number(totalCount),
      );

      const users = (await query) as UserType[];

      logger.info('[UserRepository.getUsers] Users successfully retrieved:', users.length);

      return {
        query: users,
        pagination: paginationMeta,
      };
    } catch (error) {
      logger.error('[UserRepository.getUsers] Error:', error);
      throw error;
    }
  }

  async getById(id: string, tx?: DbTransaction): Promise<UserType | null> {
    const dbClient = tx ?? db;
    const rows = await dbClient.select().from(UserTable).where(eq(UserTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async createUser(
    user: Omit<UserInsertType, 'createdAt' | 'updatedAt'>,
    tx?: DbTransaction,
  ): Promise<UserType> {
    try {
      logger.info('[UserRepository.createUser] Creating user:', user);
      const dbClient = tx ?? db;
      const [newUser] = await dbClient
        .insert(UserTable)
        .values({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      logger.info('[UserRepository.createUser] User successfully created:', newUser);
      return newUser;
    } catch (error) {
      logger.error('[UserRepository.createUser] Error:', error);
      throw error;
    }
  }

  async updateUser(
    user: Partial<UserInsertType>,
    id: string,
    tx?: DbTransaction,
  ): Promise<UserType | null> {
    try {
      logger.info('[UserRepository.updateUser] Updating user:', user);
      const dbClient = tx ?? db;
      const [updatedUser] = await dbClient
        .update(UserTable)
        .set({ ...user, updatedAt: new Date() })
        .where(eq(UserTable.id, id))
        .returning();
      logger.info('[UserRepository.updateUser] User successfully updated:', updatedUser);
      return updatedUser ?? null;
    } catch (error) {
      logger.error('[UserRepository.updateUser] Error:', error);
      throw error;
    }
  }
}
