import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

const res = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
`);
console.log('Existing tables:', res.rows.map(r => r.table_name));
await pool.end();
