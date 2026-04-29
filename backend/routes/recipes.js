import express from 'express';
const router = express.Router();

import * as recipeController from '../controllers/recipeController.js';
import authMiddleware from '../middleware/auth.js';

// 🔥 PUT DEBUG HERE (TOP)
console.log("CONTROLLER CHECK:", {
  generateRecipe: typeof recipeController.generateRecipe,
  getRecipes: typeof recipeController.getRecipes,
  saveRecipe: typeof recipeController.saveRecipe,
  deleteRecipe: typeof recipeController.deleteRecipe
});

router.use(authMiddleware);

router.post('/generate', recipeController.generateRecipe);
router.get('/suggestions', recipeController.getPantrySuggestions);

router.get('/', recipeController.getRecipes);
router.get('/recent', recipeController.getRecentRecipes);
router.get('/stats', recipeController.getRecipeStats);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.saveRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export default router;