import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/postgresdb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function inspect() {
  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('TABLES:', tables.rows.map(r => r.table_name));

    for (const row of tables.rows) {
      const cols = await pool.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${row.table_name}' AND table_schema = 'public'
      `);
      console.log(`\n--- ${row.table_name} ---`);
      cols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type} (nullable=${c.is_nullable})`));
    }
  } catch(e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
}
inspect();
