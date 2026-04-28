import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function checkColumns() {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'pantry_items'");
    console.log(res.rows.map(r => r.column_name));
    await pool.end();
}
checkColumns();
