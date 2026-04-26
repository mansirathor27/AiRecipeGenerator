import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js';
import recipeRoutes from './routes/recipes.js';
import mealPlanRoutes from './routes/mealPlans.js';
import shoppingListRoutes from './routes/shoppingList.js';
import nutritionRoutes from './routes/nutrition.js';
import costRoutes from './routes/cost.js';


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.json({message: 'AI Recipe Generator API'});
});

app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/pantry',pantryRoutes);
app.use('/api/recipes',recipeRoutes);
app.use('/api/meal-plans',mealPlanRoutes);
app.use('/api/shopping-list',shoppingListRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/cost', costRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});