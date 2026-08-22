import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

const client = await pool.connect();

try {
    await client.query('BEGIN');

    // ── Attendance ────────────────────────────────────────────────────────────
    await client.query(`
        CREATE TABLE IF NOT EXISTS attendance (
            id              SERIAL PRIMARY KEY,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            date            DATE NOT NULL,
            check_in        TIMESTAMPTZ,
            check_out       TIMESTAMPTZ,
            status          VARCHAR(20) DEFAULT 'present',
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, date)
        );
    `);
    console.log('✓ attendance table ready');

    // ── Leave ─────────────────────────────────────────────────────────────────
    await client.query(`
        CREATE TABLE IF NOT EXISTS leaves (
            id              SERIAL PRIMARY KEY,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            leave_type      VARCHAR(50) NOT NULL DEFAULT 'casual',
            start_date      DATE NOT NULL,
            end_date        DATE NOT NULL,
            reason          TEXT,
            status          VARCHAR(20) DEFAULT 'pending',
            approved_by     INTEGER REFERENCES users(id),
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW()
        );
    `);
    console.log('✓ leaves table ready');

    // ── Employee profile extensions ───────────────────────────────────────────
    await client.query(`
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS department   VARCHAR(100),
            ADD COLUMN IF NOT EXISTS position     VARCHAR(100),
            ADD COLUMN IF NOT EXISTS phone        VARCHAR(30),
            ADD COLUMN IF NOT EXISTS date_joined  DATE DEFAULT CURRENT_DATE,
            ADD COLUMN IF NOT EXISTS salary       NUMERIC(12,2) DEFAULT 0;
    `);
    console.log('✓ users profile columns ready');

    // ── Payroll ───────────────────────────────────────────────────────────────
    await client.query(`
        CREATE TABLE IF NOT EXISTS payroll (
            id              SERIAL PRIMARY KEY,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            month           INTEGER NOT NULL,
            year            INTEGER NOT NULL,
            basic_salary    NUMERIC(12,2) DEFAULT 0,
            allowances      NUMERIC(12,2) DEFAULT 0,
            deductions      NUMERIC(12,2) DEFAULT 0,
            net_salary      NUMERIC(12,2) GENERATED ALWAYS AS (basic_salary + allowances - deductions) STORED,
            status          VARCHAR(20) DEFAULT 'pending',
            paid_on         DATE,
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, month, year)
        );
    `);
    console.log('✓ payroll table ready');

    await client.query('COMMIT');
    console.log('\n✅ Schema migration complete');
} catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
} finally {
    client.release();
    await pool.end();
}
