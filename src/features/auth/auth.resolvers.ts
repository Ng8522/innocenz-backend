import type { AdminType } from '@/features/admin/admin.model';
import { authRepository, jwtController } from '@/composition-root';
import type { GraphQLContext } from '@/graphql/context';
import { comparePassword } from '@/util/password';
import { GraphQLError } from 'graphql';

function transformAdmin(admin: AdminType) {
  return {
    id: admin.id,
    email: admin.email,
    displayName: admin.displayName,
    status: admin.status,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }
      return transformAdmin(context.user);
    },
  },

  Mutation: {
    login: async (_: unknown, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;
      const admin = await authRepository.getAdminByEmail(email);

      if (!admin) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }

      if (admin.status !== 'active') {
        throw new GraphQLError('Account is deactivated', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } },
        });
      }

      const isPasswordValid = admin.password
        ? await comparePassword(password, admin.password)
        : false;
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }

      const tokenPayload = { username: email, loginType: 'EMAIL' as const };
      const accessToken = jwtController.generateAccessToken(tokenPayload);
      const refreshToken = jwtController.generateRefreshToken(tokenPayload);
      const decodedToken = jwtController.verifyToken(accessToken);

      return {
        accessToken,
        refreshToken,
        expiresAt: decodedToken.exp
          ? new Date(decodedToken.exp * 1000).toISOString()
          : new Date(Date.now() + 3600000).toISOString(),
        user: transformAdmin(admin),
      };
    },

    register: async (
      _: unknown,
      {
        input,
      }: {
        input: { email: string; displayName: string };
      },
    ) => {
      const existing = await authRepository.getAdminByEmail(input.email);
      if (existing) {
        throw new GraphQLError('Admin with this email already exists', {
          extensions: { code: 'BAD_USER_INPUT', http: { status: 409 } },
        });
      }

      const admin = await authRepository.createAdmin({
        email: input.email,
        displayName: input.displayName,
        password: null,
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
      });

      return transformAdmin(admin);
    },
  },
};
