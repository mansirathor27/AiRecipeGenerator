import db from '../config/db.js';

class Recipe {

    static async create(userId, recipeData) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            let {
                name,
                description,
                cuisine_type,
                difficulty,
                prep_time,
                cook_time,
                servings,
                instructions,
                dietary_tags = [],
                user_notes,
                image_url,
                ingredients = [],
                nutrition = {}
            } = recipeData;

            // ✅ FIX 1: Normalize instructions
            const safeInstructions = Array.isArray(instructions)
                ? instructions
                : (instructions ? [instructions] : []);

            // ✅ FIX 2: Normalize dietary tags
            const safeDietaryTags = Array.isArray(dietary_tags)
                ? dietary_tags
                : (dietary_tags ? [dietary_tags] : []);

            // ✅ FIX 3: Normalize ingredients
            const safeIngredients = (ingredients || []).map(ing => {
                if (typeof ing === 'string') {
                    return {
                        name: ing,
                        quantity: null,
                        unit: null
                    };
                }

                return {
                    name: ing.name || "Unknown",
                    quantity: ing.quantity || null,
                    unit: ing.unit || null,
                    price_per_unit: ing.price_per_unit || ing.pricePerUnit || 0
                };
            });

            // ✅ Insert recipe
            const recipeResult = await client.query(
                `INSERT INTO recipes 
                (user_id, name, description, cuisine_type, difficulty, prep_time, cook_time, servings, instructions, dietary_tags, user_notes, image_url)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                RETURNING *`,
                [
                    userId,
                    name,
                    description,
                    cuisine_type,
                    difficulty,
                    prep_time,
                    cook_time,
                    servings,
                    JSON.stringify(safeInstructions),
                    safeDietaryTags,
                    user_notes,
                    image_url
                ]
            );

            const recipe = recipeResult.rows[0];

            // ✅ Insert ingredients safely
            if (safeIngredients.length > 0) {

                const values = [];
                const params = [];

                safeIngredients.forEach((ing, idx) => {
                    const base = idx * 5;
                    values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);

                    params.push(
                        recipe.id,
                        ing.name,
                        ing.quantity,
                        ing.unit,
                        ing.price_per_unit
                    );
                });

                await client.query(
                    `INSERT INTO recipe_ingredients 
                    (recipe_id, ingredient_name, quantity, unit, price_per_unit)
                    VALUES ${values.join(', ')}`,
                    params
                );
            }

            // ✅ Insert nutrition safely
            if (nutrition && Object.keys(nutrition).length > 0) {
                await client.query(
                    `INSERT INTO recipe_nutrition 
                    (recipe_id, calories, protein, carbs, fats, fiber)
                    VALUES ($1,$2,$3,$4,$5,$6)`,
                    [
                        recipe.id,
                        nutrition.calories || null,
                        nutrition.protein || null,
                        nutrition.carbs || null,
                        nutrition.fats || null,
                        nutrition.fiber || null
                    ]
                );
            }

            await client.query('COMMIT');

            return await this.findById(recipe.id, userId);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("DB ERROR:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async findById(id, userId) {
        const recipeResult = await db.query(
            `SELECT * FROM recipes WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (recipeResult.rows.length === 0) return null;

        const recipe = recipeResult.rows[0];

        const ingredientsResult = await db.query(
            `SELECT ingredient_name as name, quantity, unit, price_per_unit 
             FROM recipe_ingredients WHERE recipe_id = $1`,
            [id]
        );

        const nutritionResult = await db.query(
            `SELECT calories, protein, carbs, fats, fiber 
             FROM recipe_nutrition WHERE recipe_id = $1`,
            [id]
        );

        return {
            ...recipe,
            ingredients: ingredientsResult.rows,
            nutrition: nutritionResult.rows[0] || {}
        };
    }

    static async findByUserId(userId, filters = {}) {
        let query = `SELECT r.*, rn.calories FROM recipes r LEFT JOIN recipe_nutrition rn ON r.id = rn.recipe_id WHERE r.user_id = $1`;
        const values = [userId];
        let paramCount = 1;

        if(filters.search) {
            paramCount++;
            query += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
        }
        if(filters.cuisine_type) {
            paramCount++;
            query += ` AND r.cuisine_type = $${paramCount}`;
            values.push(filters.cuisine_type);
        }
        if(filters.difficulty) {
            paramCount++;
            query += ` AND r.difficulty = $${paramCount}`;
            values.push(filters.difficulty);
        }
        if(filters.dietary_tag){
            paramCount++;
            query += ` AND $${paramCount} = ANY (r.dietary_tags)`;
            values.push(filters.dietary_tag);
        }
        if(filters.max_cook_time) {
            paramCount++;   
            query += ` AND r.cook_time <= $${paramCount}`;
            values.push(filters.max_cook_time);
        }
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY r.${sortBy} ${sortOrder}`;
        
        const limit = filters.limit || 20;
        const offset = filters.offset || 0;
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        values.push(limit);
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await db.query(query, values);
        return result.rows;
    }


    static async getRecent(userId, limit = 5) {
        const result = await db.query(
            `SELECT r.*, rn.calories FROM recipes r LEFT JOIN recipe_nutrition rn ON r.id = rn.recipe_id WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    static async update(id, userId, updates){
        const {name, description, cuisine_type, difficulty, prep_time, cook_time, servings, instructions, dietary_tags, user_notes, image_url} = updates;
        const result = await db.query(
            `UPDATE recipes SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            cuisine_type = COALESCE($3, cuisine_type),
            difficulty = COALESCE($4, difficulty),
            prep_time = COALESCE($5, prep_time),
            cook_time = COALESCE($6, cook_time),
            servings = COALESCE($7, servings),
            instructions = COALESCE($8, instructions),
            dietary_tags = COALESCE($9, dietary_tags),
            user_notes = COALESCE($10, user_notes),
            image_url = COALESCE($11, image_url)
            WHERE id = $12 AND user_id = $13 RETURNING *
        `,
            [name, description, cuisine_type, difficulty, prep_time, cook_time, servings, instructions, dietary_tags, user_notes, image_url, id, userId]
        );
        return result.rows[0];

    }


    static async delete(id, userId){
        const result = await db.query(
            'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return result.rows[0];
    }

    static async getStats(userId) {
        const result = await db.query(
            `SELECT 
                COUNT(*) AS total_recipes,
                COUNT(DISTINCT cuisine_type) AS cuisine_types_count,
                AVG(cook_time) AS avg_cook_time
            FROM recipes
            WHERE user_id = $1
        `,
            [userId]
        );
        return result.rows[0];
    }

};

export default Recipe;