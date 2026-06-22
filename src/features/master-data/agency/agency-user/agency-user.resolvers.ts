import { GraphQLError } from 'graphql';
import { agencyUserRepository } from '@/composition-root';
import { withAudit } from '@/features/audit-log/audit.wrapper';
import type { GraphQLContext } from '@/graphql/context';
import { AgencyUserFilter, AgencyUserRow } from './agency-user.model';
import { formatTimestamps, getGqlActor, toPaginatedResponse } from '@/features/master-data/graphql.util';

function toAgencyUser(row: AgencyUserRow) {
  return {
    id: `${row.agencyId}:${row.userId}`,
    ...formatTimestamps(row),
  };
}

export const resolvers = {
  Query: {
    agencyUsers: async (
      _: unknown,
      args: { filter?: AgencyUserFilter; pageSize?: number; pageNumber?: number },
    ) => {
      const rows = await agencyUserRepository.list(args.filter ?? {});
      return toPaginatedResponse(
        rows.map(toAgencyUser),
        args.pageSize ?? 10,
        args.pageNumber ?? 1,
      );
    },

    agencyUser: async (_: unknown, { agencyId, userId }: { agencyId: string; userId: string }) => {
      const row = await agencyUserRepository.getByKey(agencyId, userId);
      if (!row) {
        throw new GraphQLError('Agency user not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return toAgencyUser(row);
    },
  },

  Mutation: {
    createAgencyUser: withAudit(
      {
        entity: 'AgencyUser',
        action: 'CREATE',
        getEntityId: (result) => result?.id ?? null,
      },
      async (
        _: unknown,
        { input }: { input: { agencyId: string; userId: string } },
        context: GraphQLContext,
      ) => {
        const exists = await agencyUserRepository.exists(input.agencyId, input.userId);
        if (exists) {
          throw new GraphQLError('Agency user link already exists', {
            extensions: { code: 'CONFLICT', http: { status: 409 } },
          });
        }

        const row = await agencyUserRepository.create({
          ...input,
          createdBy: getGqlActor(context),
          updatedBy: getGqlActor(context),
        });
        return toAgencyUser(row);
      },
    ),

    updateAgencyUser: withAudit(
      {
        entity: 'AgencyUser',
        action: 'UPDATE',
        getEntityId: (_, args) => `${args.agencyId}:${args.userId}`,
        getOldData: async (args) => agencyUserRepository.getByKey(args.agencyId, args.userId),
      },
      async (
        _: unknown,
        { agencyId, userId }: { agencyId: string; userId: string },
        context: GraphQLContext,
      ) => {
        const row = await agencyUserRepository.update(agencyId, userId, getGqlActor(context));
        if (!row) {
          throw new GraphQLError('Agency user not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return toAgencyUser(row);
      },
    ),

    deleteAgencyUser: withAudit(
      {
        entity: 'AgencyUser',
        action: 'DELETE',
        getEntityId: (_, args) => `${args.agencyId}:${args.userId}`,
        getOldData: async (args) => agencyUserRepository.getByKey(args.agencyId, args.userId),
      },
      async (_: unknown, { agencyId, userId }: { agencyId: string; userId: string }) => {
        const row = await agencyUserRepository.getByKey(agencyId, userId);
        if (!row) {
          throw new GraphQLError('Agency user not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }

        const deleted = await agencyUserRepository.remove(agencyId, userId);
        if (!deleted) {
          throw new GraphQLError('Agency user not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return toAgencyUser(row);
      },
    ),
  },
};
