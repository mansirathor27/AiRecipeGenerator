import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

if (!process.env.GEMINI_API_KEY) {
    console.error('WARNING: Gemini API key is not set.');
}

// ------------------- RETRY HELPER -------------------
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const callGeminiWithRetry = async (fn, retries = 3) => {
    try {
        return await fn();
    } catch (err) {
        if (retries > 0 && (err?.status === 503 || err?.status === 429)) {
            console.log(`Gemini busy. Retrying... (${retries})`);
            await sleep(2000);
            return callGeminiWithRetry(fn, retries - 1);
        }
        throw err;
    }
};

// ------------------- PARSE SAFE TEXT -------------------
const extractText = (response) => {
    return (
        response?.text ||
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        ''
    ).trim();
};

// ------------------- GENERATE RECIPE -------------------
export const generateRecipe = async ({
    ingredients,
    dietaryRestrictions = [],
    cuisineType = 'any',
    servings = 4,
    cookingTime = 'medium'
}) => {

    const dietaryInfo =
        dietaryRestrictions.length > 0
            ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}.`
            : 'No dietary restrictions.';

    const timeGuide = {
        quick: 'under 30 minutes',
        medium: '30-60 minutes',
        long: 'over 60 minutes'
    };

    const prompt = `
Generate a detailed recipe using:

Ingredients: ${ingredients.join(', ')}
${dietaryInfo}
Cuisine: ${cuisineType}
Servings: ${servings}
Cooking time: ${timeGuide[cookingTime] || 'any'}

Return ONLY valid JSON:

{
  "name": "Recipe Name",
  "description": "Brief description",
  "cuisineType": "${cuisineType}",
  "difficulty": "easy|medium|hard",
  "prepTime": number,
  "cookTime": number,
  "servings": ${servings},
  "ingredients": [
    {
      "name": "Ingredient",
      "quantity": number,
      "unit": "string",
      "pricePerUnit": number
    }
  ],
  "instructions": [
    "Step 1",
    "Step 2"
  ],
  "dietaryTags": [],
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number
  },
  "cookingTips": [
    "Tip 1",
    "Tip 2"
  ]
}
`;

    try {
        const response = await callGeminiWithRetry(() =>
            ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            })
        );

        let text = extractText(response);

        if (!text) {
            throw new Error("Empty response from Gemini");
        }

        // remove markdown
        text = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let recipe;
        try {
            recipe = JSON.parse(text);
        } catch (err) {
            console.error("Invalid JSON from Gemini:", text);
            throw new Error("AI returned invalid JSON format");
        }

        return recipe;

    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate recipe. Please try again later.');
    }
};

// ------------------- PANTRY SUGGESTIONS -------------------
export const generatePantrySuggestions = async (pantryItems, expiringItems = []) => {

    const ingredients = pantryItems.map(item => item.name).join(', ');

    const expiringText = expiringItems.length > 0
        ? `Priority ingredients: ${expiringItems.join(', ')}`
        : '';

    const prompt = `
Suggest 3 recipes using:
${ingredients}
${expiringText}

Return ONLY JSON array:
["idea1", "idea2", "idea3"]
`;

    try {
        const response = await callGeminiWithRetry(() =>
            ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            })
        );

        let text = extractText(response)
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        return JSON.parse(text);

    } catch (error) {
        console.error('Gemini API error:', error);
        return ["Try a simple stir fry", "Make a mixed salad", "Cook a quick soup"];
    }
};

// ------------------- COOKING TIPS -------------------
export const generateCookingTips = async (recipe) => {

    const prompt = `
Recipe: ${recipe.name}
Ingredients: ${recipe.ingredients?.map(i => i.name).join(', ') || 'N/A'}

Return JSON array:
["Tip 1", "Tip 2", "Tip 3"]
`;

    try {
        const response = await callGeminiWithRetry(() =>
            ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            })
        );

        let text = extractText(response)
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        return JSON.parse(text);

    } catch (error) {
        console.error('Gemini API error:', error);
        return ['Cook slowly for better flavor', 'Taste while cooking', 'Use fresh ingredients'];
    }
};

export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips
};