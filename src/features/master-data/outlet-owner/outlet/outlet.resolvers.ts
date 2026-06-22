import { GraphQLError } from 'graphql';
import { outletRepository } from '@/composition-root';
import { withAudit } from '@/features/audit-log/audit.wrapper';
import type { GraphQLContext } from '@/graphql/context';
import { OutletFilter } from './outlet.model';
import { formatTimestamps, getGqlActor, toPaginatedResponse } from '@/features/master-data/graphql.util';

export const resolvers = {
  Query: {
    outlets: async (
      _: unknown,
      args: { filter?: OutletFilter; pageSize?: number; pageNumber?: number },
    ) => {
      const rows = await outletRepository.list(args.filter ?? {});
      return toPaginatedResponse(
        rows.map(formatTimestamps),
        args.pageSize ?? 10,
        args.pageNumber ?? 1,
      );
    },

    outlet: async (_: unknown, { id }: { id: string }) => {
      const row = await outletRepository.getById(id);
      if (!row) {
        throw new GraphQLError('Outlet not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return formatTimestamps(row);
    },
  },

  Mutation: {
    createOutlet: withAudit(
      {
        entity: 'Outlet',
        action: 'CREATE',
        getEntityId: (result) => result?.id ?? null,
      },
      async (
        _: unknown,
        {
          input,
        }: {
          input: {
            outletOwnerId: string;
            outletName: string;
            outletAddress: string;
            outletContactNo: string;
            outletEmail: string;
            outletLogo: string;
            status?: string;
          };
        },
        context: GraphQLContext,
      ) => {
        const existing = await outletRepository.getByEmail(input.outletEmail);
        if (existing) {
          throw new GraphQLError('Outlet email already exists', {
            extensions: { code: 'CONFLICT', http: { status: 409 } },
          });
        }

        const row = await outletRepository.create({
          outletOwnerId: input.outletOwnerId,
          outletName: input.outletName,
          outletAddress: input.outletAddress,
          outletContactNo: input.outletContactNo,
          outletEmail: input.outletEmail,
          outletLogo: input.outletLogo,
          status: input.status ?? 'active',
          createdBy: getGqlActor(context),
          updatedBy: getGqlActor(context),
        });
        return formatTimestamps(row);
      },
    ),

    updateOutlet: withAudit(
      {
        entity: 'Outlet',
        action: 'UPDATE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => outletRepository.getById(args.id),
      },
      async (
        _: unknown,
        {
          id,
          input,
        }: {
          id: string;
          input: Partial<{
            outletOwnerId: string;
            outletName: string;
            outletAddress: string;
            outletContactNo: string;
            outletEmail: string;
            outletLogo: string;
            status: string;
          }>;
        },
        context: GraphQLContext,
      ) => {
        if (input.outletEmail) {
          const existing = await outletRepository.getByEmail(input.outletEmail, id);
          if (existing) {
            throw new GraphQLError('Outlet email already exists', {
              extensions: { code: 'CONFLICT', http: { status: 409 } },
            });
          }
        }

        const row = await outletRepository.update(id, {
          ...input,
          updatedBy: getGqlActor(context),
        });
        if (!row) {
          throw new GraphQLError('Outlet not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return formatTimestamps(row);
      },
    ),

    deleteOutlet: withAudit(
      {
        entity: 'Outlet',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => outletRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const row = await outletRepository.deactivate(id, getGqlActor(context));
        if (!row) {
          throw new GraphQLError('Outlet not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return formatTimestamps(row);
      },
    ),
  },
};
