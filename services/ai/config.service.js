const pool = require('../db.service');

const setUseTime = async (userId, startTime, endTime) => {
    const conn = await pool.getConnection(async (conn) => conn);

    try {
        const [result] = await conn.execute(
            'UPDATE users SET startTime = ?, endTime = ? WHERE id = ?',
            [startTime, endTime, userId],
        );

        return { success: result.affectedRows > 0 };
    } catch (err) {
        console.error(err);
        return { success: false, message: 'Internal error' };
    } finally {
        conn.release();
    }
};

const getUseTime = async (userId) => {
    const conn = await pool.getConnection(async (conn) => conn);

    try {
        const [rows] = await conn.execute(
            'SELECT startTime, endTime FROM users WHERE id = ?',
            [userId],
        );

        return rows[0] || null;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = {
    setUseTime,
    getUseTime,
};
