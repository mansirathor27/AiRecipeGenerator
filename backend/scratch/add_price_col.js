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
        await client.query('ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS estimated_price DECIMAL(10,2) DEFAULT 0;');
        console.log('Migration successful: Added estimated_price to shopping_list_items');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
