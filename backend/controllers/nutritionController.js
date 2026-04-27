import Nutrition from '../models/Nutrition.js';

export const getDailyNutrition = async (req, res, next) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        const totals = await Nutrition.getDailyTotals(req.user.id, targetDate);
        
        res.json({
            success: true,
            data: { totals }
        });
    } catch (error) {
        next(error);
    }
};

export const getWeeklyNutrition = async (req, res, next) => {
    try {
        const { date } = req.query;
        const weeklyData = await Nutrition.getWeeklyTotals(req.user.id, date);
        
        res.json({
            success: true,
            data: { weeklyData }
        });
    } catch (error) {
        next(error);
    }
};
