import { timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';
import { UserTable } from '../../user/user.model';

export const OutletOwnerTable = MainSchema.table('outlet_owner', {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    userId: uuid('user_id').references(() => UserTable.id).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
});