import { db } from "@/db/index";
import { Subscription, SubscriptionTable, subscriptionFilter, SubscriptionInsertType } from "./subscription.model";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { logger } from "@/util/logger";
import { DbTransaction } from "@/types/db-transaction";

export class SubscriptionRepositoryClass {
    constructor() { }

    async createSubscription(
        subscription: Omit<SubscriptionInsertType, 'id' | 'createdAt' | 'updatedAt'>,
        tx?: DbTransaction,
    ): Promise<Subscription | null> {
        try {
            const dbClient = tx || db;
            logger.info('[SubscriptionRepository.createSubscription] Creating subscription:', subscription);
            const [newSubscription] = await dbClient.insert(SubscriptionTable).values(subscription).returning();
            logger.info('[SubscriptionRepository.createSubscription] Subscription successfully created:', newSubscription);
            return newSubscription ?? null;
        } catch (error) {
            logger.error('[SubscriptionRepository.createSubscription] Error:', error);
            return null;
        }
    }

    async updateSubscription(
        subscription: Partial<SubscriptionInsertType>,
        id: string,
        tx?: DbTransaction,
    ): Promise<Subscription | null> {
        try {
            const dbClient = tx || db;
            logger.info('[SubscriptionRepository.updateSubscription] Updating subscription:', subscription);
            const [updatedSubscription] = await dbClient.update(SubscriptionTable).set(subscription).where(eq(SubscriptionTable.id, id)).returning();
            logger.info('[SubscriptionRepository.updateSubscription] Subscription successfully updated:', updatedSubscription);
            return updatedSubscription ?? null;
        } catch (error) {
            logger.error('[SubscriptionRepository.updateSubscription] Error:', error);
            return null;
        }
    }


}