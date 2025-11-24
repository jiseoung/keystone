const pool = require('../db.service');

const logUsage = async (userId, usage = {}) => {
    if (!userId) {
        return;
    }

    const promptTokens = usage.prompt_tokens ?? 0;
    const completionTokens = usage.completion_tokens ?? 0;
    const totalTokens = usage.total_tokens ?? 0;

    const conn = await pool.getConnection(async (conn) => conn);

    try {
        await conn.execute(
            `INSERT INTO ai_usage (user_id, prompt_tokens, completion_tokens, total_tokens)
             VALUES (?, ?, ?, ?)`,
            [userId, promptTokens, completionTokens, totalTokens],
        );
    } catch (error) {
        console.error('Failed to log AI usage:', error);
    } finally {
        conn.release();
    }
};

const getUsageSummary = async (userId) => {
    if (!userId) {
        return null;
    }

    const conn = await pool.getConnection(async (conn) => conn);

    try {
        const [summaryRows] = await conn.execute(
            `SELECT
                COALESCE(SUM(prompt_tokens), 0) AS promptTokens,
                COALESCE(SUM(completion_tokens), 0) AS completionTokens,
                COALESCE(SUM(total_tokens), 0) AS totalTokens,
                MAX(created_at) AS lastUsedAt,
                MIN(created_at) AS firstUsedAt
             FROM ai_usage
             WHERE user_id = ?`,
            [userId],
        );

        const summaryRow = summaryRows?.[0] || {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            lastUsedAt: null,
        };

        const [historyRows] = await conn.execute(
            `SELECT
                prompt_tokens AS promptTokens,
                completion_tokens AS completionTokens,
                total_tokens AS totalTokens,
                created_at AS createdAt
             FROM ai_usage
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 10`,
            [userId],
        );

        const history = (historyRows || []).map((row) => ({
            promptTokens: Number(row.promptTokens) || 0,
            completionTokens: Number(row.completionTokens) || 0,
            totalTokens: Number(row.totalTokens) || 0,
            createdAt: row.createdAt ? new Date(row.createdAt) : null,
        }));

        const totalTokens = Number(summaryRow.totalTokens) || 0;
        const promptTokens = Number(summaryRow.promptTokens) || 0;
        const completionTokens = Number(summaryRow.completionTokens) || 0;

        const now = new Date();
        let averagePerDay = 0;
        if (summaryRow.firstUsedAt) {
            const firstUsedAt = new Date(summaryRow.firstUsedAt);
            const dayMs = 1000 * 60 * 60 * 24;
            const diffDays = Math.max(1, Math.ceil((now - firstUsedAt) / dayMs));
            averagePerDay = totalTokens ? totalTokens / diffDays : 0;
        }

        return {
            promptTokens,
            completionTokens,
            totalTokens,
            lastUsedAt: summaryRow.lastUsedAt ? new Date(summaryRow.lastUsedAt) : null,
            firstUsedAt: summaryRow.firstUsedAt ? new Date(summaryRow.firstUsedAt) : null,
            averagePerDay: Number(averagePerDay) || 0,
            history,
        };
    } catch (error) {
        console.error('Failed to fetch AI usage summary:', error);
        return null;
    } finally {
        conn.release();
    }
};

module.exports = {
    logUsage,
    getUsageSummary,
};
