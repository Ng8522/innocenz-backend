import { GraphQLError } from 'graphql';
import { db } from '@/db/index';
import { prRepository, userRepository } from '@/composition-root';
import { withAudit } from '@/features/audit-log/audit.wrapper';
import type { GraphQLContext } from '@/graphql/context';
import { PrFilter } from './pr.model';
import { buildUserInsert } from '@/features/user/user.util';
import { formatTimestamps, getGqlActor, toPaginatedResponse } from '@/features/master-data/graphql.util';

export const resolvers = {
  Query: {
    prs: async (
      _: unknown,
      args: { filter?: PrFilter; pageSize?: number; pageNumber?: number },
    ) => {
      const rows = await prRepository.list(args.filter ?? {});
      return toPaginatedResponse(
        rows.map(formatTimestamps),
        args.pageSize ?? 10,
        args.pageNumber ?? 1,
      );
    },

    pr: async (_: unknown, { id }: { id: string }) => {
      const row = await prRepository.getById(id);
      if (!row) {
        throw new GraphQLError('PR not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return formatTimestamps(row);
    },
  },

  Mutation: {
    createPr: withAudit(
      {
        entity: 'PR',
        action: 'CREATE',
        getEntityId: (result) => result?.id ?? null,
      },
      async (
        _: unknown,
        {
          input,
        }: {
          input: {
            user: {
              email: string;
              name: string;
              contactNo: string;
              profileImage?: string;
            };
            icNo: string;
            prNo: string;
            prAgency: string;
            profileImage?: string;
            comcardImages: unknown;
            language?: string[];
            bwhMeasurements: unknown;
            status?: string;
          };
        },
        context: GraphQLContext,
      ) => {
        const existingUser = await userRepository.getByEmail(input.user.email);
        if (existingUser) {
          throw new GraphQLError('Email already registered', {
            extensions: { code: 'CONFLICT', http: { status: 409 } },
          });
        }

        const existing = await prRepository.getByIcNo(input.icNo);
        if (existing) {
          throw new GraphQLError('IC number already registered', {
            extensions: { code: 'CONFLICT', http: { status: 409 } },
          });
        }

        const actor = getGqlActor(context);
        const row = await db.transaction(async (tx) => {
          const user = await userRepository.create(buildUserInsert(input.user, actor), tx);
          return prRepository.create(
            {
              userId: user.id,
              icNo: input.icNo,
              prNo: input.prNo,
              prAgency: input.prAgency,
              profileImage: input.profileImage,
              comcardImages: input.comcardImages,
              language: input.language ?? [],
              bwhMeasurements: input.bwhMeasurements,
              status: input.status ?? 'pending_review',
              createdBy: actor,
              updatedBy: actor,
            },
            tx,
          );
        });
        return formatTimestamps(row);
      },
    ),

    updatePr: withAudit(
      {
        entity: 'PR',
        action: 'UPDATE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => prRepository.getById(args.id),
      },
      async (
        _: unknown,
        {
          id,
          input,
        }: {
          id: string;
          input: Partial<{
            userId: string;
            icNo: string;
            prNo: string;
            prAgency: string;
            profileImage: string;
            comcardImages: unknown;
            language: string[];
            bwhMeasurements: unknown;
            status: string;
          }>;
        },
        context: GraphQLContext,
      ) => {
        if (input.icNo) {
          const existing = await prRepository.getByIcNo(input.icNo, id);
          if (existing) {
            throw new GraphQLError('IC number already registered', {
              extensions: { code: 'CONFLICT', http: { status: 409 } },
            });
          }
        }

        const row = await prRepository.update(id, {
          ...input,
          updatedBy: getGqlActor(context),
        });
        if (!row) {
          throw new GraphQLError('PR not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return formatTimestamps(row);
      },
    ),

    deletePr: withAudit(
      {
        entity: 'PR',
        action: 'DELETE',
        getEntityId: (_, args) => args.id,
        getOldData: async (args) => prRepository.getById(args.id),
      },
      async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const row = await prRepository.deactivate(id, getGqlActor(context));
        if (!row) {
          throw new GraphQLError('PR not found', {
            extensions: { code: 'NOT_FOUND', http: { status: 404 } },
          });
        }
        return formatTimestamps(row);
      },
    ),
  },
};
