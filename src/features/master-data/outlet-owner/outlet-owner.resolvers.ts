import { GraphQLError } from 'graphql';
import { db } from '@/db/index';
import { outletOwnerRepository, userRepository } from '@/composition-root';
import { withAudit } from '@/features/audit-log/audit.wrapper';
import type { GraphQLContext } from '@/graphql/context';
import { buildUserInsert } from '@/features/user/user.util';
import { getGqlActor, toPaginatedResponse } from '@/features/master-data/graphql.util';
import type { OutletOwnerRow } from './outlet-owner.repository';

function formatOutletOwner(row: OutletOwnerRow) {
  return {
    id: row.id,
    userId: row.userId,
    email: row.userEmail,
    name: row.userName,
    contactNo: row.userContactNo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export const resolvers = {
  Query: {
    outletOwners: async (
      _: unknown,
      args: { pageSize?: number; pageNumber?: number },
    ) => {
      const rows = await outletOwnerRepository.list();
      return toPaginatedResponse(
        rows.map(formatOutletOwner),
        args.pageSize ?? 10,
        args.pageNumber ?? 1,
      );
    },

    outletOwner: async (_: unknown, { id }: { id: string }) => {
      const row = await outletOwnerRepository.getById(id);
      if (!row) {
        throw new GraphQLError('Outlet owner not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return formatOutletOwner(row);
    },
  },

  Mutation: {
    createOutletOwner: withAudit(
      {
        entity: 'OutletOwner',
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
          };
        },
        context: GraphQLContext,
      ) => {
        const existingUser = await userRepository.getByEmail(input.user.email);
        if (existingUser) {
          const existingOwner = await outletOwnerRepository.getByUserId(existingUser.id);
          if (existingOwner) {
            throw new GraphQLError('User is already an outlet owner', {
              extensions: { code: 'CONFLICT', http: { status: 409 } },
            });
          }
          throw new GraphQLError('Email already registered', {
            extensions: { code: 'CONFLICT', http: { status: 409 } },
          });
        }

        const actor = getGqlActor(context);
        let ownerId: string;
        await db.transaction(async (tx) => {
          const user = await userRepository.create(buildUserInsert(input.user, actor), tx);
          const owner = await outletOwnerRepository.create(
            { userId: user.id, createdBy: actor, updatedBy: actor },
            tx,
          );
          ownerId = owner.id;
        });

        const row = await outletOwnerRepository.getById(ownerId!);
        if (!row) {
          throw new GraphQLError('Failed to create outlet owner', {
            extensions: { code: 'INTERNAL_SERVER_ERROR', http: { status: 500 } },
          });
        }

        return formatOutletOwner(row);
      },
    ),
  },
};
