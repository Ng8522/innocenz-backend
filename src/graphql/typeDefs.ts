import { typeDefs as authTypeDefs } from '@/features/auth/auth.typeDefs';
import { typeDefs as auditLogTypeDefs } from '@/features/audit-log/audit.typeDefs';
import { directiveTypeDefs } from './directives';

const baseTypeDefs = `#graphql
  scalar JSON

  type Query {
    _health: String
  }

  type Mutation {
    _health: String
  }

  type Pagination {
    count: Int!
    totalCount: Int!
    currentPage: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }
`;

export const typeDefs = [directiveTypeDefs, baseTypeDefs, authTypeDefs, auditLogTypeDefs];
