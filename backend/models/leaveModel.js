import { pool } from '../config/postgresdb.js';

// ─── Leaves ───────────────────────────────────────────────────────────────────

export const getLeavesByUser = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM leaves WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};

export const getAllLeaves = async (hrId, role) => {
    let query = `
        SELECT l.*, u.name, u.email, u.department
        FROM leaves l
        JOIN users u ON u.id = l.user_id
    `;
    const params = [];

    if (role === 'hr') {
        query += `
        JOIN hr_team_assignments hta ON hta.team_id = u.team_id
        WHERE hta.hr_user_id = $1
        `;
        params.push(hrId);
    }

    query += ` ORDER BY l.created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
};

export const createLeave = async ({ userId, leaveType, startDate, endDate, reason }) => {
    const result = await pool.query(
        `INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, leaveType, startDate, endDate, reason]
    );
    return result.rows[0];
};

export const updateLeaveStatus = async (id, status, approvedBy) => {
    const result = await pool.query(
        `UPDATE leaves
         SET status = $1, approved_by = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, approvedBy, id]
    );
    return result.rows[0] || null;
};
