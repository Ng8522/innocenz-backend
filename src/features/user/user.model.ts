import { timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

export const UserTable = MainSchema.table('user', {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    email: varchar('email').unique(),
    phoneNum: varchar('phone_num').unique(),
    profileImage: varchar('profile_image'),
    accName: varchar('acc_name', { length: 100 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    status: varchar('status', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
});

export type UserType = typeof UserTable.$inferSelect;
export type UserInsertType = typeof UserTable.$inferInsert;