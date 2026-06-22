import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as authResolvers } from '@/features/auth/auth.resolvers';
import { resolvers as auditLogResolvers } from '@/features/audit-log/audit.resolvers';
import { resolvers as agencyResolvers } from '@/features/master-data/agency/agency.resolvers';
import { resolvers as agencyUserResolvers } from '@/features/master-data/agency/agency-user/agency-user.resolvers';
import { resolvers as prResolvers } from '@/features/master-data/pr/pr.resolvers';
import { resolvers as outletOwnerResolvers } from '@/features/master-data/outlet-owner/outlet-owner.resolvers';
import { resolvers as outletResolvers } from '@/features/master-data/outlet-owner/outlet/outlet.resolvers';
import { resolvers as rbacResolvers } from '@/features/rbac/rbac.resolvers';

const baseResolvers = {
  Query: {
    _health: () => 'GraphQL server is running!',
  },
  Mutation: {
    _health: () => 'GraphQL mutations are available!',
  },
};

export const resolvers = mergeResolvers([
  baseResolvers,
  authResolvers,
  auditLogResolvers,
  agencyResolvers,
  agencyUserResolvers,
  prResolvers,
  outletOwnerResolvers,
  outletResolvers,
  rbacResolvers,
]);
