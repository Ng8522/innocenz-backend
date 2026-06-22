import { CreateUserInput } from './user.schema';
import type { UserType } from './user.model';

export function omitPasswordHash<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export function buildUserInsert(
  input: CreateUserInput,
  actor: string,
): {
  email: string;
  name: string;
  contactNo: string;
  profileImage?: string;
  passwordHash: null;
  createdBy: string;
  updatedBy: string;
} {
  return {
    email: input.email,
    name: input.name,
    contactNo: input.contactNo,
    profileImage: input.profileImage,
    passwordHash: null,
    createdBy: actor,
    updatedBy: actor,
  };
}

export function formatUser(user: UserType) {
  const { passwordHash: _, createdAt, updatedAt, ...rest } = user;
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
