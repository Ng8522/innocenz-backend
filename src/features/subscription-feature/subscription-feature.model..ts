import { MainSchema } from "@/db/db.schema";
import { timestamp, uuid, varchar, unique } from "drizzle-orm/pg-core";
import { SubscriptionTable } from "../subscription/subscription.model";
import { LimitTypeTable } from "../limit-type/limit-type.model";
import { RoleTable } from "../rbac/role/role.model";

export const SubscriptionFeatureTable = MainSchema.table('subscription_feature', {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    subscriptionId: uuid('subscription_id').references(() => SubscriptionTable.id),
    roleId: uuid('role_id').references(() => RoleTable.id),
    limitTypeId: uuid('limit_type_id').references(() => LimitTypeTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar('created_by').notNull(),
    updatedBy: varchar('updated_by').notNull(),
}, (table) => [
    unique('subscription_feature_unique').on(table.subscriptionId, table.roleId, table.limitTypeId),
]);

export type SubscriptionFeatureType = typeof SubscriptionFeatureTable.$inferSelect;
export type SubscriptionFeatureInsertType = typeof SubscriptionFeatureTable.$inferInsert;

export type subscriptionFeatureFilter = {
    id?: string;
    subscriptionId?: string;
    roleId?: string;
    limitTypeId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
};