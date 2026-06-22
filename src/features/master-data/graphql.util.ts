import { GraphQLContext } from '@/graphql/context';
import { paginate } from '@/util/pagination';

export function getGqlActor(context: GraphQLContext): string {
  return context.user?.email ?? 'system';
}

export function formatTimestamps<T extends { createdAt: Date; updatedAt: Date }>(row: T) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPaginatedResponse<T>(items: T[], pageSize = 10, pageNumber = 1) {
  const result = paginate(items, pageNumber, pageSize);
  return {
    query: result.data,
    pagination: {
      count: result.data.length,
      totalCount: result.pagination.totalCount,
      currentPage: result.pagination.page,
      totalPages: result.pagination.totalPages,
      hasNextPage: result.pagination.hasNextPage,
      hasPrevPage: result.pagination.hasPrevPage,
    },
  };
}
