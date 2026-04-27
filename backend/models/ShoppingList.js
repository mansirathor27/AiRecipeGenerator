import db from '../config/db.js';

class ShoppingList {
    static async generateFromMealPlan(userId, startDate, endDate) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                'DELETE FROM shopping_list_items WHERE user_id = $1 AND from_meal_plan = true',
                [userId]
            );

            const result = await client.query(
                `SELECT ri.ingredient_name, ri.unit, SUM(ri.quantity) as total_quantity FROM meal_plans mp
                 JOIN recipe_ingredients ri ON mp.recipe_id = ri.recipe_id
                 WHERE mp.user_id = $1 AND mp.meal_date >= $2 AND mp.meal_date <= $3
                 GROUP BY ri.ingredient_name, ri.unit`,
                [userId, startDate, endDate]
            );
            const ingredients = result.rows;
            const pantryResult = await client.query(
                'SELECT name, quantity, unit FROM pantry_items WHERE user_id = $1',
                [userId]
            );
            
            const normalize = (name) => name.trim().toLowerCase().replace(/s$/, ''); // Very simple singularization

            const pantryMap = new Map();
            pantryResult.rows.forEach(item=>{
                const key = `${normalize(item.name)}_${item.unit.toLowerCase()}`;
                pantryMap.set(key, (pantryMap.get(key) || 0) + parseFloat(item.quantity));  
            });

            // Aggregate items by normalized name
            const mergedNeeded = new Map();

            for(const ing of ingredients){
                const normName = normalize(ing.ingredient_name);
                const normUnit = ing.unit.toLowerCase();
                const key = `${normName}_${normUnit}`;
                
                const pantryQty = pantryMap.get(key) || 0;
                const neededQty = Math.max(0, ing.total_quantity - pantryQty);
                
                if(neededQty > 0){
                    if (mergedNeeded.has(key)) {
                        const existing = mergedNeeded.get(key);
                        existing.quantity += neededQty;
                    } else {
                        mergedNeeded.set(key, {
                            name: ing.ingredient_name.charAt(0).toUpperCase() + ing.ingredient_name.slice(1), // keep somewhat original casing for first letter
                            quantity: neededQty,
                            unit: normUnit,
                            category: 'Uncategorized'
                        });
                    }
                }
            }

            for(const item of mergedNeeded.values()){
                await client.query(
                    `INSERT INTO shopping_list_items (user_id, ingredient_name, quantity, unit, from_meal_plan, category) 
                     VALUES ($1, $2, $3, $4, true, $5)`,
                    [userId, item.name, item.quantity, item.unit, item.category]
                );
            }

            await client.query('COMMIT');
            return await this.findByUserId(userId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async create(userId, itemData){
        const {ingredient_name, quantity, unit, category = 'Uncategorized', estimated_price = 0} = itemData;
        const result = await db.query(
            `INSERT INTO shopping_list_items (user_id, ingredient_name, quantity, unit, from_meal_plan, category, estimated_price) 
             VALUES ($1, $2, $3, $4, false, $5, $6) RETURNING *`,
            [userId, ingredient_name.trim(), quantity, unit.toLowerCase(), category, estimated_price]
        );
        return result.rows[0];
    }

    static async findByUserId(userId){
        const result = await db.query(
            'SELECT * FROM shopping_list_items WHERE user_id = $1 ORDER BY category, ingredient_name',
            [userId]
        );
        return result.rows;
    }

    static async getGroupedByCategory(userId){
        const result = await db.query(
            `SELECT category, 
                json_agg(
                    json_build_object(
                        'id', id, 
                        'ingredient_name', ingredient_name, 
                        'quantity', quantity, 
                        'unit', unit, 
                        'is_checked', is_checked, 
                        'from_meal_plan', from_meal_plan,
                        'estimated_price', estimated_price
                    ) ORDER BY ingredient_name ASC
                ) as items,
                SUM(quantity * estimated_price) as category_total
             FROM shopping_list_items 
             WHERE user_id = $1
             GROUP BY category
             ORDER BY category`,
            [userId]
        );
        return result.rows;
    }

    static async update(id, userId, updates){
        const {ingredient_name, quantity, unit, category, is_checked, estimated_price} = updates;

        const result = await db.query(
            `UPDATE shopping_list_items SET
                ingredient_name = COALESCE($1, ingredient_name),
                quantity = COALESCE($2, quantity),
                unit = COALESCE($3, unit),
                category = COALESCE($4, category),
                is_checked = COALESCE($5, is_checked),
                estimated_price = COALESCE($6, estimated_price)
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [ingredient_name, quantity, unit, category, is_checked, estimated_price, id, userId]
        );
        return result.rows[0];
    }

    static async toggleChecked(id, userId){
        const result = await db.query(
            `UPDATE shopping_list_items SET is_checked = NOT is_checked
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }   

    static async delete(id, userId){
        const result = await db.query(
            'DELETE FROM shopping_list_items WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return result.rows[0];
    }

    static async clearChecked(userId){
        const result = await db.query(
            'DELETE FROM shopping_list_items WHERE user_id = $1 AND is_checked = true RETURNING *',
            [userId]
        );
        return result.rows;
    }

    static async clearAll(userId){
        const result = await db.query(
            'DELETE FROM shopping_list_items WHERE user_id = $1 RETURNING *',
            [userId]
        );
        return result.rows;
    }

    static async getCheckedToPantry(userId){
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const checkedItems = await client.query(
                'SELECT * FROM shopping_list_items WHERE user_id = $1 AND is_checked = true',
                [userId]
            );

            for(const item of checkedItems.rows){
                await client.query(
                    `INSERT INTO pantry_items (user_id, name, quantity, unit, category)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [userId, item.ingredient_name, item.quantity, item.unit, item.category]
                );
            }

            await client.query(
                'DELETE FROM shopping_list_items WHERE user_id = $1 AND is_checked = true',
                [userId]
            );

            await client.query('COMMIT');
            return checkedItems.rows;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default ShoppingList;