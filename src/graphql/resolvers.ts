import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as authResolvers } from '@/features/auth/auth.resolvers';
import { resolvers as auditLogResolvers } from '@/features/audit-log/audit.resolvers';

const baseResolvers = {
  Query: {
    _health: () => 'GraphQL server is running!',
  },
  Mutation: {
    _health: () => 'GraphQL mutations are available!',
  },
};

export const resolvers = mergeResolvers([baseResolvers, authResolvers, auditLogResolvers]);
