import type { UserType } from './user.model';

export function omitPasswordHash<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export function formatUser(user: UserType) {
  const { passwordHash: _, createdAt, updatedAt, ...rest } = user;
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
