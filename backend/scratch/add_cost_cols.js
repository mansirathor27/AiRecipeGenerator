import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10,2) DEFAULT 0;');
        await client.query('ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS weekly_budget DECIMAL(10,2) DEFAULT 0;');
        console.log('Migration successful: Added price_per_unit to recipe_ingredients and weekly_budget to user_preferences');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
