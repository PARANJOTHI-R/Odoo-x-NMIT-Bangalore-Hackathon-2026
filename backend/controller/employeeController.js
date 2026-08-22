import { pool } from '../config/postgresdb.js';
import { findUserById } from '../models/userModel.js';

// GET /api/employee/profile
export const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) return res.json({ success: false, message: 'User not found' });

        return res.json({
            success: true,
            data: {
                id:            user.id,
                name:          user.name,
                email:         user.email,
                role:          user.role,
                department:    user.department,
                position:      user.position,
                phone:         user.phone,
                date_joined:   user.date_joined,
                salary:        user.salary,
                is_acc_verified: user.is_acc_verified,
            },
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// PUT /api/employee/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, department, position, phone } = req.body;
        const result = await pool.query(
            `UPDATE users
             SET name = COALESCE($1, name),
                 department = COALESCE($2, department),
                 position   = COALESCE($3, position),
                 phone      = COALESCE($4, phone),
                 updated_at = NOW()
             WHERE id = $5
             RETURNING id, name, email, role, department, position, phone, date_joined, salary, is_acc_verified`,
            [name, department, position, phone, req.user.id]
        );
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getAdminEmployees = async (req, res) => {
    try {
        let query = `
            SELECT id, name, email, role, department, position, phone, date_joined, salary, is_acc_verified, created_at, team_id
            FROM users
        `;
        const params = [];
        
        if (req.user.role === 'hr') {
            query += `
            WHERE team_id IN (
                SELECT team_id FROM hr_team_assignments WHERE hr_user_id = $1
            )
            `;
            params.push(req.user.id);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const result = await pool.query(query, params);
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/employees/:id
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, position, phone, salary, role, team_id } = req.body;
        
        // If HR, check if the employee belongs to their team first
        if (req.user.role === 'hr') {
            const check = await pool.query(`
                SELECT u.id FROM users u 
                JOIN hr_team_assignments hta ON hta.team_id = u.team_id
                WHERE u.id = $1 AND hta.hr_user_id = $2
            `, [id, req.user.id]);
            
            if (check.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Not authorized to edit this employee' });
            }
        }
        
        const result = await pool.query(
            `UPDATE users
             SET name       = COALESCE($1, name),
                 department = COALESCE($2, department),
                 position   = COALESCE($3, position),
                 phone      = COALESCE($4, phone),
                 salary     = COALESCE($5, salary),
                 role       = COALESCE($6, role),
                 team_id    = COALESCE($7, team_id),
                 updated_at = NOW()
             WHERE id = $8
             RETURNING id, name, email, role, department, position, phone, date_joined, salary, is_acc_verified, team_id`,
            [name, department, position, phone, salary, role, team_id, id]
        );
        if (!result.rows[0]) return res.json({ success: false, message: 'Employee not found' });
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
