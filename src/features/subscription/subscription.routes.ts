import { Router } from 'express';
import { subscriptionController } from '@/composition-root.js';

const router = Router();

router.get('', subscriptionController.getSubscriptions.bind(subscriptionController));
router.get('/:id', subscriptionController.getSubscriptionById.bind(subscriptionController));
router.post('', subscriptionController.createSubscription.bind(subscriptionController));
router.put('/:id', subscriptionController.updateSubscription.bind(subscriptionController));
router.delete('/:id', subscriptionController.inactiveSubscription.bind(subscriptionController));

export default router;
