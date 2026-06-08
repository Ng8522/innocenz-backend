import { timestamp, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';
import { AdminTable } from '@/features/admin/admin.model';
import { RoleTable } from '@/features/master-data/role/role.model';

export const AdminRoleTable = MainSchema.table(
  'admin_role',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    adminId: uuid('admin_id')
      .references(() => AdminTable.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: uuid('role_id')
      .references(() => RoleTable.id, { onDelete: 'cascade' })
      .notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
  },
  (table) => [unique().on(table.adminId, table.roleId)],
);

export type AdminRoleType = typeof AdminRoleTable.$inferSelect;
export type AdminRoleInsertType = typeof AdminRoleTable.$inferInsert;
