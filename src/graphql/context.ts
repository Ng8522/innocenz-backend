import { Request } from 'express';
import { authRepository } from '@/composition-root';
import type { UserType } from '@/features/auth/auth.model';

export interface GraphQLContext {
  user: UserType | null;
  req: Request;
}

export async function createContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const context: GraphQLContext = { user: null, req };

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return context;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return context;
  }

  try {
    const user = await authRepository.getUserDataByToken(token);
    if (user) {
      context.user = user;
    }
  } catch {
    // Return unauthenticated context
  }

  return context;
}

export function isAuthenticated(context: GraphQLContext): boolean {
  return context.user !== null;
}
