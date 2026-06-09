import { and, asc, desc, eq, gte, lte, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { AuditLogTable } from '@/features/audit-log/audit-log.model';
import { AdminTable } from '@/features/admin/admin.model';
import { GraphQLContext } from '@/graphql/context';
import { DbTransaction } from '@/types/db-transaction';
import { paginateQuery, PaginationParams, PaginatedResponse, PgQueryType } from '@/util/pagination';
import { logger } from '@/util/logger';

export type AuditLogFilter = {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  role?: string;
  entity?: string;
  entityId?: string;
  action?: string;
};

export type AuditLogSort = {
  field?: 'CREATED_AT' | 'ACTION' | 'ENTITY' | 'USER_NAME';
  direction?: 'ASC' | 'DESC';
};

export type AuditLogRow = {
  auditLogId: number;
  userId: string | null;
  role: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  batchId: string | null;
  oldData: unknown;
  newData: unknown;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  userName: string | null;
};

export type CreateAuditLogInput = {
  userId?: string | null;
  role?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  batchId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress: string;
  userAgent: string;
};

export class AuditLogRepositoryClass {
  async getAuditLog(
    filter: AuditLogFilter,
    paginationParams: PaginationParams,
    _context?: GraphQLContext,
    sort?: AuditLogSort,
  ): Promise<PaginatedResponse<AuditLogRow>> {
    const whereCondition: SQL[] = [];

    if (filter.dateFrom) {
      whereCondition.push(gte(AuditLogTable.createdAt, new Date(filter.dateFrom)));
    }
    if (filter.dateTo) {
      whereCondition.push(lte(AuditLogTable.createdAt, new Date(filter.dateTo)));
    }
    if (filter.userId) {
      whereCondition.push(eq(AuditLogTable.userId, filter.userId));
    }
    if (filter.role) {
      whereCondition.push(eq(AuditLogTable.role, filter.role));
    }
    if (filter.entity) {
      whereCondition.push(eq(AuditLogTable.entity, filter.entity));
    }
    if (filter.entityId) {
      whereCondition.push(eq(AuditLogTable.entityId, filter.entityId));
    }
    if (filter.action) {
      whereCondition.push(eq(AuditLogTable.action, filter.action));
    }

    const sortField = sort?.field ?? 'CREATED_AT';
    const sortDirection = sort?.direction === 'ASC' ? asc : desc;

    let orderByClause: SQL;
    if (sortField === 'ACTION') {
      orderByClause = sortDirection(AuditLogTable.action);
    } else if (sortField === 'ENTITY') {
      orderByClause = sortDirection(AuditLogTable.entity);
    } else if (sortField === 'USER_NAME') {
      orderByClause = sortDirection(AdminTable.displayName);
    } else {
      orderByClause = sortDirection(AuditLogTable.createdAt);
    }

    const baseQuery = db
      .select({
        auditLogId: AuditLogTable.auditLogId,
        userId: AuditLogTable.userId,
        role: AuditLogTable.role,
        action: AuditLogTable.action,
        entity: AuditLogTable.entity,
        entityId: AuditLogTable.entityId,
        batchId: AuditLogTable.batchId,
        oldData: AuditLogTable.oldData,
        newData: AuditLogTable.newData,
        ipAddress: AuditLogTable.ipAddress,
        userAgent: AuditLogTable.userAgent,
        createdAt: AuditLogTable.createdAt,
        userName: AdminTable.displayName,
      })
      .from(AuditLogTable)
      .leftJoin(AdminTable, eq(AuditLogTable.userId, AdminTable.id))
      .where(whereCondition.length > 0 ? and(...whereCondition) : undefined)
      .orderBy(orderByClause);

    const pageSize = paginationParams.pageSize ?? 10;
    const pageNumber = paginationParams.pageNumber ?? paginationParams.page ?? 1;
    const totalCount = (await baseQuery).length;
    const paginatedQuery = paginateQuery(baseQuery as unknown as PgQueryType, pageSize, pageNumber, totalCount);
    const data = (await paginatedQuery.query) as AuditLogRow[];

    return { query: data, pagination: paginatedQuery.pagination };
  }

  async getDistinctActions(): Promise<string[]> {
    const results = await db
      .select({ action: AuditLogTable.action })
      .from(AuditLogTable)
      .groupBy(AuditLogTable.action)
      .orderBy(asc(AuditLogTable.action));

    return results.map((r) => r.action).filter((action): action is string => action !== null);
  }

  async getDistinctEntities(): Promise<string[]> {
    const results = await db
      .select({ entity: AuditLogTable.entity })
      .from(AuditLogTable)
      .groupBy(AuditLogTable.entity)
      .orderBy(asc(AuditLogTable.entity));

    return results.map((r) => r.entity).filter((entity): entity is string => entity !== null);
  }

  async getDistinctRoles(): Promise<string[]> {
    const results = await db
      .select({ role: AuditLogTable.role })
      .from(AuditLogTable)
      .groupBy(AuditLogTable.role)
      .orderBy(asc(AuditLogTable.role));

    return results.map((r) => r.role).filter((role): role is string => role !== null);
  }

  async getById(id: number) {
    const rows = await db
      .select({
        auditLogId: AuditLogTable.auditLogId,
        userId: AuditLogTable.userId,
        role: AuditLogTable.role,
        action: AuditLogTable.action,
        entity: AuditLogTable.entity,
        entityId: AuditLogTable.entityId,
        batchId: AuditLogTable.batchId,
        oldData: AuditLogTable.oldData,
        newData: AuditLogTable.newData,
        ipAddress: AuditLogTable.ipAddress,
        userAgent: AuditLogTable.userAgent,
        createdAt: AuditLogTable.createdAt,
        userName: AdminTable.displayName,
      })
      .from(AuditLogTable)
      .leftJoin(AdminTable, eq(AuditLogTable.userId, AdminTable.id))
      .where(eq(AuditLogTable.auditLogId, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async createAuditLog(
    input: CreateAuditLogInput,
    tx?: DbTransaction,
  ): Promise<typeof AuditLogTable.$inferSelect> {
    try {
      const [auditLog] = await (tx ?? db)
        .insert(AuditLogTable)
        .values({
          userId: input.userId ?? undefined,
          role: input.role ?? undefined,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? undefined,
          batchId: input.batchId ?? undefined,
          oldData: input.oldData,
          newData: input.newData,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        })
        .returning();

      return auditLog;
    } catch (error) {
      logger.error('[AuditLogRepository.createAuditLog] Error:', error);
      throw error;
    }
  }
}
