import { timestamp, uuid, varchar, jsonb, text } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';
import { UserTable } from '../../user/user.model';
import { AgencyTable } from '../agency/agency.model';

export const PrTable = MainSchema.table('m_pr', {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    userId: uuid('user_id').references(() => UserTable.id).notNull(),
    icNo: varchar('ic_no', { length: 20 }).notNull(),
    prNo: varchar('pr_no', { length: 20 }).notNull(),
    prAgency: uuid('pr_agency').references(() => AgencyTable.id).notNull(),
    profileImage: varchar('profile_image'),
    comcardImages: jsonb('comcard_images').notNull(),
    language: text('language').array().notNull().default([]),
    bwhMeasurements: jsonb('bwh_measurements').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
});