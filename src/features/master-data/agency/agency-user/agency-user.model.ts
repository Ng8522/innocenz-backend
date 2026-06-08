import { primaryKey, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';
import { AgencyTable } from '../agency.model';
import { UserTable } from '../../../user/user.model';

export const AgencyUserTable = MainSchema.table(
  'agency_user',
  {
    agencyId: uuid('agency_id')
      .references(() => AgencyTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => UserTable.id, { onDelete: 'cascade' })
      .notNull(),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
      createdBy: varchar('created_by').notNull(),
      updatedBy: varchar('updated_by').notNull(),
  },
  (table) => [primaryKey({ columns: [table.agencyId, table.userId] })],
);

export type AgencyUserType = typeof AgencyUserTable.$inferSelect;
export type AgencyUserInsertType = typeof AgencyUserTable.$inferInsert;
