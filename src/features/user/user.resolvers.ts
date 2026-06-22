import { GraphQLError } from 'graphql';
import { userRepository } from '@/composition-root';
import { UserFilter, UserSort } from './user.model';
import { formatUser } from './user.util';

export const resolvers = {
  Query: {
    users: async (
      _: unknown,
      args: {
        filter?: UserFilter;
        pageSize?: number;
        pageNumber?: number;
        sort?: UserSort;
      },
    ) => {
      const result = await userRepository.getUsers(
        args.filter ?? {},
        {
          pageSize: args.pageSize ?? 10,
          pageNumber: args.pageNumber ?? 1,
        },
        args.sort,
      );

      return {
        query: result.query.map(formatUser),
        pagination: result.pagination,
      };
    },

    user: async (_: unknown, { id }: { id: string }) => {
      const row = await userRepository.getById(id);
      if (!row) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return formatUser(row);
    },
  },
};
