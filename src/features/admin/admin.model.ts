import { timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

/**
 * Admin Table
 * Stores users who can access the Innocenz Admin Panel (web).
 */
export const AdminTable = MainSchema.table('admin', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  email: varchar('email').unique().notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  password: varchar('password_hash'),
  status: varchar('status', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: varchar('created_by').notNull(),
  updatedBy: varchar('updated_by').notNull(),
});

export type AdminType = typeof AdminTable.$inferSelect;
export type AdminInsertType = typeof AdminTable.$inferInsert;
