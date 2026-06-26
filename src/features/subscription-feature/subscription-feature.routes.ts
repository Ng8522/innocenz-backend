import { Router } from 'express';
import { subscriptionFeatureController } from '@/composition-root.js';

const router = Router();

router.get('', subscriptionFeatureController.getSubscriptionFeatures.bind(subscriptionFeatureController));
router.get('/:id', subscriptionFeatureController.getSubscriptionFeatureById.bind(subscriptionFeatureController));
router.post('', subscriptionFeatureController.createSubscriptionFeature.bind(subscriptionFeatureController));
router.put('/:id', subscriptionFeatureController.updateSubscriptionFeature.bind(subscriptionFeatureController));
router.delete('/:id', subscriptionFeatureController.deleteSubscriptionFeature.bind(subscriptionFeatureController));

export default router;
