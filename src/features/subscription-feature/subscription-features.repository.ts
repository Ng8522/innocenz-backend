import { db } from "@/db/index";
import { SubscriptionFeatureTable, SubscriptionFeatureType, SubscriptionFeatureInsertType } from "@/features/subscription-feature/subscription-feature.model.";
import { DbTransaction } from "@/types/db-transaction";
import { logger } from "@/util/logger";
import { eq } from "drizzle-orm";

export class SubscriptionFeaturesRepositoryClass {
    constructor() { }

    async createSubscriptionFeature(
        subscriptionFeature: SubscriptionFeatureInsertType,
        tx?: DbTransaction,
    ): Promise<SubscriptionFeatureType | null> {
        try {
            const dbClient = tx || db;
            logger.info('[SubscriptionFeaturesRepository.createSubscriptionFeature] Creating subscription feature:', subscriptionFeature);
            const [newSubscriptionFeature] = await dbClient.insert(SubscriptionFeatureTable).values(subscriptionFeature).returning();
            logger.info('[SubscriptionFeaturesRepository.createSubscriptionFeature] Subscription feature successfully created:', newSubscriptionFeature);
            return newSubscriptionFeature ?? null;
        } catch (error) {
            logger.error('[SubscriptionFeaturesRepository.createSubscriptionFeature] Error:', error);
            return null;
        }
    }

    async updateSubscriptionFeature(
        subscriptionFeature: Partial<SubscriptionFeatureInsertType>,
        id: string,
        tx?: DbTransaction,
    ): Promise<SubscriptionFeatureType | null> {
        try {
            const dbClient = tx || db;
            logger.info('[SubscriptionFeaturesRepository.updateSubscriptionFeature] Updating subscription feature:', subscriptionFeature);
            const [updatedSubscriptionFeature] = 
                await dbClient.update(SubscriptionFeatureTable)
                .set(subscriptionFeature)
                .where(eq(SubscriptionFeatureTable.id, id))
                .returning();
            logger.info('[SubscriptionFeaturesRepository.updateSubscriptionFeature] Subscription feature successfully updated:', updatedSubscriptionFeature);
            return updatedSubscriptionFeature ?? null;
        } catch (error) {
            logger.error('[SubscriptionFeaturesRepository.updateSubscriptionFeature] Error:', error);
            return null;
        }
    }
}