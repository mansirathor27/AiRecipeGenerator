import express from 'express';
const router = express.Router();

import * as recipeController from  '../controllers/recipeController.js';
import authMiddleware from '../middleware/auth.js';

router.use(authMiddleware);

router.post('/generate', recipeController.generateRecipe);
router.get('/suggestions', recipeController.getPantrySuggestions);

// Crud operations
router.get('/', recipeController.getRecipes);
router.get('/recent', recipeController.getRecentRecipes);
router.get('/stats', recipeController.getRecipeStats);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.saveRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);
console.log("generateRecipe:", recipeController.generateRecipe);
console.log("saveRecipe:", recipeController.saveRecipe);

export default router;