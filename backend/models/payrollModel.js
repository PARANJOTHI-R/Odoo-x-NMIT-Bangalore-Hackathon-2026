import { pool } from '../config/postgresdb.js';

// ─── Payroll ──────────────────────────────────────────────────────────────────

export const getPayrollByUser = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM payroll WHERE user_id = $1 ORDER BY year DESC, month DESC`,
        [userId]
    );
    return result.rows;
};

export const getAllPayroll = async (hrId, role) => {
    let query = `
        SELECT p.*, u.name, u.email, u.department, u.position
        FROM payroll p
        JOIN users u ON u.id = p.user_id
    `;
    const params = [];

    if (role === 'hr') {
        query += `
        JOIN hr_team_assignments hta ON hta.team_id = u.team_id
        WHERE hta.hr_user_id = $1
        `;
        params.push(hrId);
    }

    query += ` ORDER BY p.year DESC, p.month DESC, u.name`;
    const result = await pool.query(query, params);
    return result.rows;
};

export const upsertPayroll = async (userId, { month, year, basicSalary, allowances, deductions, status, paidOn }) => {
    const result = await pool.query(
        `INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, status, paid_on)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, month, year)
         DO UPDATE SET
             basic_salary = EXCLUDED.basic_salary,
             allowances   = EXCLUDED.allowances,
             deductions   = EXCLUDED.deductions,
             status       = EXCLUDED.status,
             paid_on      = EXCLUDED.paid_on,
             updated_at   = NOW()
         RETURNING *`,
        [userId, month, year, basicSalary ?? 0, allowances ?? 0, deductions ?? 0, status ?? 'pending', paidOn ?? null]
    );
    return result.rows[0];
};
