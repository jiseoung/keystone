const bcrypt = require('bcrypt');
const pool = require('../db.service');

const register = async (id, pw, email, age) => {
    const conn = await pool.getConnection(async conn => conn);
    const rounds = 10;
    const hashedPw = await bcrypt.hashSync(pw, rounds);

    try {
        const [rows] = await conn.execute(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (rows.length > 0) {
            return { success: false, message: 'ID already exists' };
        }

        await conn.execute(
            'INSERT INTO users (id, pw, email, age) VALUES (?, ?, ?, ?)',
            [id, hashedPw, email, age]
        );

        return { success: true };
    } catch (err) {
        return { success: false, message: 'Internal error' };
    } finally {
        conn.release();
    }
}

module.exports = register;