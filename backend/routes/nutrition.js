import express from 'express';
const router = express.Router();
import * as nutritionController from '../controllers/nutritionController.js';
import authMiddleware from '../middleware/auth.js';

router.use(authMiddleware);

router.get('/daily', nutritionController.getDailyNutrition);
router.get('/weekly', nutritionController.getWeeklyNutrition);

export default router;
