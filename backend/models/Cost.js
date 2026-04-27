import db from '../config/db.js';

class Cost {
    static async getRecipeCost(recipeId) {
        const result = await db.query(
            `SELECT SUM(quantity * price_per_unit) as total_cost 
             FROM recipe_ingredients 
             WHERE recipe_id = $1`,
            [recipeId]
        );
        return parseFloat(result.rows[0].total_cost || 0);
    }

    static async getWeeklyMealPlanCost(userId, startDate) {
        const result = await db.query(
            `SELECT SUM(ri.quantity * ri.price_per_unit) as total_cost
             FROM meal_plans mp
             JOIN recipe_ingredients ri ON mp.recipe_id = ri.recipe_id
             WHERE mp.user_id = $1 
               AND mp.meal_date >= $2::date 
               AND mp.meal_date < $2::date + INTERVAL '7 days'`,
            [userId, startDate]
        );
        return parseFloat(result.rows[0].total_cost || 0);
    }

    static async getUserBudget(userId) {
        const result = await db.query(
            'SELECT weekly_budget FROM user_preferences WHERE user_id = $1',
            [userId]
        );
        return result.rows[0] ? parseFloat(result.rows[0].weekly_budget || 0) : 0;
    }
}

export default Cost;
