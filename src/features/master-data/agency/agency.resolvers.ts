import { GraphQLError } from 'graphql';
import { agencyRepository } from '@/composition-root';
import { withAudit } from '@/features/audit-log/audit.wrapper';
import type { GraphQLContext } from '@/graphql/context';
import { AgencyFilter } from './agency.model';
import { formatTimestamps, getGqlActor, toPaginatedResponse } from '@/features/master-data/graphql.util';

export const resolvers = {
  Query: {
    agencies: async (
      _: unknown,
      args: { filter?: AgencyFilter; pageSize?: number; pageNumber?: number },
    ) => {
      const rows = await agencyRepository.list(args.filter ?? {});
      return toPaginatedResponse(
        rows.map(formatTimestamps),
        args.pageSize ?? 10,
        args.pageNumber ?? 1,
      );
    },

    agency: async (_: unknown, { id }: { id: string }) => {
      const row = await agencyRepository.getById(id);
      if (!row) {
        throw new GraphQLError('Agency not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return formatTimestamps(row);
    },
  },

  Mutation: {
    createAgency: withAudit(
      {
        entity: 'Agency',
        action: 'CREATE',
        getEntityId: (result) => result?.id ?? null,
      },
      async (
        _: unknown,
        {
          input,
        }: {
          input: {
            agencyName: string;
            agencyAddress: string;
            agencyContactNo: string;
            agencyEmail: string;
            agencyLogo: string;
            status?: string;
          };
        },
        context: GraphQLContext,
      ) => {
        const existing = await agencyRepository.getByEmail(input.agencyEmail);
        if (existing) {
          throw new GraphQLError('Agency email already exists', {
            extensions: { code: 'CONFLICT', http: { status: 409 } },
          });
        }

        const row = await agencyRepository.create({
          agencyName: input.agencyName,
          agencyAddress: input.agencyAddress,
          agencyContactNo: input.agencyContactNo,
          agencyEmail: input.agencyEmail,
          agencyLogo: input.agencyLogo,
          status: input.status ?? 'active',
          createdBy: getGqlActor(context),
          updatedBy: getGqlActor(context),
        });
        return formatTimestamps(row);
      },
    ),

    updateAgency: withAudit(
      {
        entity: 'Agency',
        action: 'UPDATE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => agencyRepository.getById(args.id),
      },
      async (
        _: unknown,
        {
          id,
          input,
        }: {
          id: string;
          input: Partial<{
            agencyName: string;
            agencyAddress: string;
            agencyContactNo: string;
            agencyEmail: string;
            agencyLogo: string;
            status: string;
          }>;
        },
        context: GraphQLContext,
      ) => {
        if (input.agencyEmail) {
          const existing = await agencyRepository.getByEmail(input.agencyEmail);
          if (existing && existing.id !== id) {
            throw new GraphQLError('Agency email already exists', {
              extensions: { code: 'CONFLICT', http: { status: 409 } },
            });
          }
        }

        const row = await agencyRepository.update(id, {
          ...input,
          updatedBy: getGqlActor(context),
        });
        if (!row) {
          throw new GraphQLError('Agency not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return formatTimestamps(row);
      },
    ),

    deleteAgency: withAudit(
      {
        entity: 'Agency',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => agencyRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const row = await agencyRepository.deactivate(id, getGqlActor(context));
        if (!row) {
          throw new GraphQLError('Agency not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return formatTimestamps(row);
      },
    ),
  },
};
