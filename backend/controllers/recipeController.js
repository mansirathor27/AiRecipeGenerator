import Recipe from '../models/Recipe.js';
import PantryItem from '../models/PantryItem.js';
import {
    generateRecipe as generateRecipeAI,
    generatePantrySuggestions as generatePantrySuggestionsAI
} from '../utils/gemini.js';

// ------------------- GENERATE RECIPE -------------------
export const generateRecipe = async (req, res, next) => {
    try {
        const {
            ingredients = [],
            usePantryIngredients = false,
            dietaryRestrictions = [],
            cuisineType = 'any',
            servings = 4,
            cookingTime = 'medium'
        } = req.body;

        let finalIngredients = [...ingredients];

        if (usePantryIngredients) {
            const pantryItems = await PantryItem.findByUserId(req.user.id);
            const pantryNames = pantryItems.map(item => item.name);
            finalIngredients = [...new Set([...finalIngredients, ...pantryNames])];
        }

        if (!finalIngredients.length) {
            return res.status(400).json({
                success: false,
                message: 'At least one ingredient required'
            });
        }

        const recipe = await generateRecipeAI({
            ingredients: finalIngredients,
            dietaryRestrictions,
            cuisineType,
            servings,
            cookingTime
        });

        res.json({
            success: true,
            data: { recipe }
        });

    } catch (error) {
        console.error("Generate Recipe Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Recipe generation failed"
        });
    }
};

// ------------------- SAVE RECIPE -------------------
export const saveRecipe = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const recipe = await Recipe.create(req.user.id, req.body);

        res.status(201).json({
            success: true,
            message: 'Recipe saved',
            data: { recipe }
        });

    } catch (error) {
        console.error("Save Recipe Error:", error);
        next(error);
    }
};

// ------------------- PANTRY SUGGESTIONS -------------------
export const getPantrySuggestions = async (req, res, next) => {
    try {
        const pantryItems = await PantryItem.findByUserId(req.user.id);
        const expiringItems = await PantryItem.getExpiringSoon(req.user.id, 7);

        const suggestions = await generatePantrySuggestionsAI(
            pantryItems,
            expiringItems.map(i => i.name)
        );

        res.json({
            success: true,
            data: { suggestions }
        });

    } catch (error) {
        next(error);
    }
};

export const getRecipes = async (req, res, next) => {
    try {
        const recipes = await Recipe.findByUserId(req.user.id);
        res.json({ success: true, data: { recipes } });
    } catch (error) {
        next(error);
    }
};

export const deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.delete(id, req.user.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            });
        }

        res.json({
            success: true,
            message: "Deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};