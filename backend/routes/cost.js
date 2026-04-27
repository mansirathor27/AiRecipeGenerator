import express from 'express';
import { getRecipeCost, getWeeklyCost } from '../controllers/costController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/recipe/:id', getRecipeCost);
router.get('/weekly', getWeeklyCost);

export default router;
