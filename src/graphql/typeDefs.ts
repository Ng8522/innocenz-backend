import { typeDefs as userTypeDefs } from '@/features/user/user.typeDefs';
import { typeDefs as authTypeDefs } from '@/features/auth/auth.typeDefs';
import { typeDefs as auditLogTypeDefs } from '@/features/audit-log/audit.typeDefs';
import { typeDefs as agencyTypeDefs } from '@/features/master-data/agency/agency.typeDefs';
import { typeDefs as agencyUserTypeDefs } from '@/features/master-data/agency/agency-user/agency-user.typeDefs';
import { typeDefs as prTypeDefs } from '@/features/master-data/pr/pr.typeDefs';
import { typeDefs as outletOwnerTypeDefs } from '@/features/master-data/outlet-owner/outlet-owner.typeDefs';
import { typeDefs as outletTypeDefs } from '@/features/master-data/outlet-owner/outlet/outlet.typeDefs';
import { typeDefs as rbacTypeDefs } from '@/features/rbac/rbac.typeDefs';
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

export const typeDefs = [
  directiveTypeDefs,
  baseTypeDefs,
  userTypeDefs,
  authTypeDefs,
  auditLogTypeDefs,
  agencyTypeDefs,
  agencyUserTypeDefs,
  prTypeDefs,
  outletOwnerTypeDefs,
  outletTypeDefs,
  rbacTypeDefs,
];
