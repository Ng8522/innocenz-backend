import { Router } from 'express';
import { agencyController } from '@/composition-root.js';

const router = Router();

router.get('/', agencyController.list.bind(agencyController));
router.get('/:id', agencyController.getById.bind(agencyController));
router.post('/', agencyController.create.bind(agencyController));
router.put('/:id', agencyController.update.bind(agencyController));
router.patch('/:id/approve', agencyController.approve.bind(agencyController));
router.patch('/:id/suspend', agencyController.suspend.bind(agencyController));

router.get('/:id/members', agencyController.listMembers.bind(agencyController));
router.post('/:id/members', agencyController.addMember.bind(agencyController));
router.put('/:id/members/:memberId', agencyController.updateMember.bind(agencyController));
router.delete('/:id/members/:memberId', agencyController.removeMember.bind(agencyController));

export default router;
