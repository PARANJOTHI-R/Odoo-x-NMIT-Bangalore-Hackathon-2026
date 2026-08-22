import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URI });
const client = await pool.connect();

try {
    await client.query('BEGIN');

    // 1. Create teams table
    await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
            id         SERIAL PRIMARY KEY,
            name       VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);
    console.log('✓ teams table ready');

    // 2. Create hr_team_assignments (many-to-many: HR user ↔ team)
    await client.query(`
        CREATE TABLE IF NOT EXISTS hr_team_assignments (
            hr_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            team_id    INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (hr_user_id, team_id)
        );
    `);
    console.log('✓ hr_team_assignments table ready');

    // 3. Add team_id to users (employees belong to a team)
    await client.query(`
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL;
    `);
    console.log('✓ users.team_id column ready');

    await client.query('COMMIT');
    console.log('\n✅ Team migration complete');
} catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Team migration failed:', err.message);
} finally {
    client.release();
    await pool.end();
}
