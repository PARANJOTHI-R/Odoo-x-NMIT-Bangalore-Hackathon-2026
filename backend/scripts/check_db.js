import { pool } from '../config/postgresdb.js';

async function check() {
    try {
        const client = await pool.connect();
        const dbRes = await client.query('SELECT current_database();');
        console.log('Database:', dbRes.rows[0].current_database);
        
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
        
        const usersTable = await client.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users';");
        console.log('Users schema:', usersTable.rows);
        
        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
