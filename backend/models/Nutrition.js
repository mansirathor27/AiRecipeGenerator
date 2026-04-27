import db from '../config/db.js';

class Nutrition {
    static async getDailyTotals(userId, date) {
        const targetDate = date || 'CURRENT_DATE';
        const result = await db.query(
            `SELECT 
                COALESCE(SUM(rn.calories), 0) as calories,
                COALESCE(SUM(rn.protein), 0) as protein,
                COALESCE(SUM(rn.carbs), 0) as carbs,
                COALESCE(SUM(rn.fats), 0) as fats,
                COALESCE(SUM(rn.fiber), 0) as fiber
             FROM meal_plans mp
             JOIN recipe_nutrition rn ON mp.recipe_id = rn.recipe_id
             WHERE mp.user_id = $1 AND mp.meal_date = $2`,
            [userId, targetDate]
        );
        return result.rows[0];
    }

    static async getWeeklyTotals(userId, date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        // Get totals for the last 7 days including today
        const result = await db.query(
            `WITH RECURSIVE days AS (
                SELECT $2::date as day
                UNION ALL
                SELECT day - 1 FROM days WHERE day > $2::date - 6
            )
            SELECT 
                d.day::text as date,
                COALESCE(SUM(rn.calories), 0) as calories,
                COALESCE(SUM(rn.protein), 0) as protein,
                COALESCE(SUM(rn.carbs), 0) as carbs,
                COALESCE(SUM(rn.fats), 0) as fats
             FROM days d
             LEFT JOIN meal_plans mp ON d.day = mp.meal_date AND mp.user_id = $1
             LEFT JOIN recipe_nutrition rn ON mp.recipe_id = rn.recipe_id
             GROUP BY d.day
             ORDER BY d.day ASC`,
            [userId, targetDate]
        );
        return result.rows;
    }
}

export default Nutrition;
