import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile',userController.updateProfile);
router.put('/preferences', userController.updatePreferences);
router.put('/change-password', userController.changePassword);
router.delete('/delete-account', userController.deleteAccount);

export default router;