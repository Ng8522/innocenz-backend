import { timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

export const RoleTable = MainSchema.table('role', {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    roleName: varchar('role_name').notNull(),
    status: varchar('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
});

export type RoleType = typeof RoleTable.$inferSelect;
export type RoleInsertType = typeof RoleTable.$inferInsert;