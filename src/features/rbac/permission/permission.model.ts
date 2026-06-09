import { timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';
import { ModuleTable } from '../module/module.model';

export const PermissionTable = MainSchema.table('m_permission', {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    moduleId: uuid('module_id').references(() => ModuleTable.id).notNull(),
    permissionName: varchar('permission_name').notNull(),
    description: varchar('description').notNull(),
    status: varchar('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
});

export type PermissionType = typeof PermissionTable.$inferSelect;
export type PermissionInsertType = typeof PermissionTable.$inferInsert;