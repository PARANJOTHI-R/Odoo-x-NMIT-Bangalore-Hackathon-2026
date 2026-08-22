import { pool } from './config/postgresdb.js';

async function checkTimezone() {
    try {
        const tz = await pool.query('SHOW timezone;');
        console.log('Timezone:', tz.rows[0]);

        const time = await pool.query('SELECT CURRENT_DATE, CURRENT_TIMESTAMP;');
        console.log('Current Date/Time:', time.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkTimezone();
