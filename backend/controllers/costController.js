import Cost from '../models/Cost.js';

export const getRecipeCost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const totalCost = await Cost.getRecipeCost(id);
        res.json({
            success: true,
            data: { totalCost }
        });
    } catch (error) {
        next(error);
    }
};

export const getWeeklyCost = async (req, res, next) => {
    try {
        const { date } = req.query; // Expecting YYYY-MM-DD
        const today = date || new Date().toISOString().split('T')[0];
        
        const totalCost = await Cost.getWeeklyMealPlanCost(req.user.id, today);
        const budget = await Cost.getUserBudget(req.user.id);

        res.json({
            success: true,
            data: { 
                totalCost,
                budget,
                isOverBudget: budget > 0 && totalCost > budget
            }
        });
    } catch (error) {
        next(error);
    }
};
