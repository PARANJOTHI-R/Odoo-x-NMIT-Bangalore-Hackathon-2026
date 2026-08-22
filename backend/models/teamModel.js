import { pool } from '../config/postgresdb.js';

export const getAllTeams = async () => {
    const result = await pool.query(`SELECT * FROM teams ORDER BY name`);
    return result.rows;
};

export const createTeam = async (name) => {
    const result = await pool.query(
        `INSERT INTO teams (name) VALUES ($1) RETURNING *`,
        [name]
    );
    return result.rows[0];
};

export const getTeamsByHr = async (hrUserId) => {
    const result = await pool.query(`
        SELECT t.* 
        FROM teams t
        JOIN hr_team_assignments hta ON hta.team_id = t.id
        WHERE hta.hr_user_id = $1
    `, [hrUserId]);
    return result.rows;
};

export const assignHrToTeam = async (hrUserId, teamId) => {
    const result = await pool.query(
        `INSERT INTO hr_team_assignments (hr_user_id, team_id) 
         VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
        [hrUserId, teamId]
    );
    return result.rows[0];
};

export const removeHrFromTeam = async (hrUserId, teamId) => {
    await pool.query(
        `DELETE FROM hr_team_assignments WHERE hr_user_id = $1 AND team_id = $2`,
        [hrUserId, teamId]
    );
};

export const getEmployeesByTeam = async (teamId) => {
    const result = await pool.query(`
        SELECT id, name, email, role, department, position, phone, date_joined, salary, is_acc_verified, team_id 
        FROM users 
        WHERE team_id = $1
    `, [teamId]);
    return result.rows;
};
