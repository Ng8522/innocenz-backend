import type { UserType } from './auth.model';
import { authRepository, jwtController } from '@/composition-root';
import type { GraphQLContext } from '@/graphql/context';
import { comparePassword, hashPassword } from '@/util/password';
import { GraphQLError } from 'graphql';

function transformUser(user: UserType) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    contactNo: user.contactNo,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
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
      return transformUser(context.user);
    },
  },

  Mutation: {
    login: async (_: unknown, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;
      const user = await authRepository.getUserByEmail(email);

      if (!user) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }

      if (!user.isActive) {
        throw new GraphQLError('Account is deactivated', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } },
        });
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
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
        user: transformUser(user),
      };
    },

    register: async (
      _: unknown,
      {
        input,
      }: {
        input: { email: string; displayName: string; password: string; contactNo?: string | null };
      },
    ) => {
      const existing = await authRepository.getUserByEmail(input.email);
      if (existing) {
        throw new GraphQLError('User with this email already exists', {
          extensions: { code: 'BAD_USER_INPUT', http: { status: 409 } },
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await authRepository.createUser({
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        contactNo: input.contactNo ?? null,
        isActive: true,
      });

      return transformUser(user);
    },
  },
};
