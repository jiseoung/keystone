const bcrypt = require('bcrypt');
const pool = require('../db.service');

const login = async (id, pw) => {
    const conn = await pool.getConnection(async conn => conn);

    try {
        const [rows] = await conn.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return { success: false, message: 'User not found' };
        }

        const user = rows[0];

        const match = await bcrypt.compare(pw, user.pw);

        if (!match) {
            return { success: false, message: 'Invalid password' };
        }

        return { success: true, id: user.id, age: user.age };
    } catch (err) {
        console.error(err);
        return { success: false, message: 'Internal error' };
    } finally {
        conn.release();
    }
};

module.exports = login;
