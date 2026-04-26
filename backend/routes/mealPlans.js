import express from 'express';
const router = express.Router();

import * as mealPlanController from '../controllers/mealPlanController.js';
import authMiddleware from '../middleware/auth.js';

router.use(authMiddleware);

// ✅ CREATE
router.post('/', mealPlanController.addToMealPlan);

// ✅ READ
router.get('/weekly', mealPlanController.getWeeklyMealPlan);
router.get('/upcoming', mealPlanController.getUpcomingMeals);
router.get('/stats', mealPlanController.getMealPlanStats);

router.delete('/:id', mealPlanController.deleteMealPlan);

export default router;