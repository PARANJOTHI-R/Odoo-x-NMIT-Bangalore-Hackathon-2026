import { pool } from '../config/postgresdb.js';

// ─── Attendance ───────────────────────────────────────────────────────────────

export const getTodayAttendance = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM attendance WHERE user_id = $1 AND date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
        [userId]
    );
    return result.rows[0] || null;
};

export const getAllAttendanceForUser = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM attendance WHERE user_id = $1 ORDER BY date DESC`,
        [userId]
    );
    return result.rows;
};

export const getAllAttendanceAdmin = async (hrId, role) => {
    let query = `
        SELECT a.*, u.name, u.email, u.department, u.position
        FROM attendance a
        JOIN users u ON u.id = a.user_id
    `;
    const params = [];

    if (role === 'hr') {
        query += `
        JOIN hr_team_assignments hta ON hta.team_id = u.team_id
        WHERE hta.hr_user_id = $1
        `;
        params.push(hrId);
    }

    query += ` ORDER BY a.date DESC, u.name`;
    const result = await pool.query(query, params);
    return result.rows;
};

export const createCheckIn = async (userId) => {
    const result = await pool.query(
        `INSERT INTO attendance (user_id, date, check_in, status)
         VALUES ($1, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date, NOW(), 'present')
         ON CONFLICT (user_id, date) DO NOTHING
         RETURNING *`,
        [userId]
    );
    return result.rows[0] || null;
};

export const createCheckOut = async (userId) => {
    const result = await pool.query(
        `UPDATE attendance
         SET check_out = NOW(), updated_at = NOW()
         WHERE user_id = $1 AND date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AND check_out IS NULL
         RETURNING *`,
        [userId]
    );
    return result.rows[0] || null;
};
