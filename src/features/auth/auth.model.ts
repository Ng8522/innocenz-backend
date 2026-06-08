import { timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

export const UsersTable = MainSchema.table('users', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  contactNo: varchar('contact_no', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type UserType = typeof UsersTable.$inferSelect;
export type UserInsertType = typeof UsersTable.$inferInsert;

export type UserLoginDto = {
  email: string;
  password: string;
};
