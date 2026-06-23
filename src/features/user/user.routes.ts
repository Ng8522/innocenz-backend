import { Router } from 'express';
import { userController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';
import { uploadProfileImage } from '@/middlewares/upload-profile-image';

const router = Router();

router.use(authenticateJWT);

router.get('', userController.list.bind(userController));
router.post('/:id/profile-image', (req, res, next) => {
  uploadProfileImage.single('profileImage')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message, data: null });
    }
    next();
  });
}, userController.uploadProfileImage.bind(userController));
router.get('/:id', userController.getById.bind(userController));

export default router;
