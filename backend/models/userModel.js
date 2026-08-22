import { pool } from "../config/postgresdb.js";

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * 
         FROM users 
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
};

export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT * 
         FROM users 
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

export const createUser = async ({ name, email, passwordHash, role = 'hr' }) => {
    const result = await pool.query(
        `INSERT INTO users (
            name,
            email,
            password_hash,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [name, email, passwordHash, role]
    );

    return result.rows[0];
};

export const updateVerificationOtp = async (id, otp, expiresAt) => {
    const result = await pool.query(
        `UPDATE users
         SET
            verify_otp = $1,
            verify_otp_expire = $2,
            updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [otp, expiresAt, id]
    );

    return result.rows[0];
};

export const verifyUserAccount = async (id) => {
    const result = await pool.query(
        `UPDATE users
         SET
            is_acc_verified = TRUE,
            verify_otp = '',
            verify_otp_expire = NULL,
            updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
};

export const updateResetOtp = async (id, otp, expiresAt) => {
    const result = await pool.query(
        `UPDATE users
         SET
            reset_otp = $1,
            reset_otp_expire = $2,
            updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [otp, expiresAt, id]
    );

    return result.rows[0];
};

export const updatePassword = async (id, passwordHash) => {
    const result = await pool.query(
        `UPDATE users
         SET
            password_hash = $1,
            reset_otp = '',
            reset_otp_expire = NULL,
            updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [passwordHash, id]
    );

    return result.rows[0];
};
