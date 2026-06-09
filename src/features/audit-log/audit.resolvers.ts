import { auditLogRepository } from '@/composition-root';
import { AuditLogFilter, AuditLogRow, AuditLogSort } from './audit.repository';
import { PaginationParams } from '@/util/pagination';
import { GraphQLContext } from '@/graphql/context';

function transformAuditLog(auditLog: AuditLogRow) {
  return {
    auditLogId: String(auditLog.auditLogId),
    userId: auditLog.userId,
    userName: auditLog.userName,
    role: auditLog.role,
    action: auditLog.action,
    entity: auditLog.entity,
    entityId: auditLog.entityId,
    oldData: auditLog.oldData,
    newData: auditLog.newData,
    ipAddress: auditLog.ipAddress,
    userAgent: auditLog.userAgent,
    createdAt: auditLog.createdAt instanceof Date ? auditLog.createdAt.toISOString() : auditLog.createdAt,
  };
}

export const resolvers = {
  Query: {
    auditLogs: async (
      _: unknown,
      args: {
        filter?: AuditLogFilter;
        sort?: AuditLogSort;
        pageSize?: number;
        pageNumber?: number;
      },
      context: GraphQLContext,
    ) => {
      const filter: AuditLogFilter = args.filter ?? {};
      const paginationParams: PaginationParams = {
        pageSize: args.pageSize ?? 10,
        pageNumber: args.pageNumber ?? 1,
      };
      const result = await auditLogRepository.getAuditLog(filter, paginationParams, context, args.sort);

      return {
        query: result.query.map(transformAuditLog),
        pagination: result.pagination,
      };
    },
    auditLogActions: async () => auditLogRepository.getDistinctActions(),
    auditLogEntities: async () => auditLogRepository.getDistinctEntities(),
  },
};
