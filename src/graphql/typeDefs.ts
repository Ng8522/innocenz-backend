import { typeDefs as authTypeDefs } from '@/features/auth/auth.typeDefs';
import { directiveTypeDefs } from './directives';

const baseTypeDefs = `#graphql
  scalar JSON

  type Query {
    _health: String
  }

  type Mutation {
    _health: String
  }
`;

export const typeDefs = [directiveTypeDefs, baseTypeDefs, authTypeDefs];
