import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as authResolvers } from '@/features/auth/auth.resolvers';

const baseResolvers = {
  Query: {
    _health: () => 'GraphQL server is running!',
  },
  Mutation: {
    _health: () => 'GraphQL mutations are available!',
  },
};

export const resolvers = mergeResolvers([baseResolvers, authResolvers]);
