const express = require('express');

const { setUseTime, getUseTime } = require('../../services/ai/config.service');
const { getUsageSummary } = require('../../services/ai/usage.service');

const router = express.Router();

router.get('/config', async (req, res) => {
    try {
        const userId = req.user?.id;
        const currentConfig = userId ? await getUseTime(userId) : null;
        const usageSummary = userId ? await getUsageSummary(userId) : null;
        const tokenLimit = Number.parseInt(process.env.AI_TOKEN_LIMIT || '', 10);

        let usagePercentage = null;
        if (usageSummary && Number.isFinite(usageSummary.totalTokens) && tokenLimit > 0) {
            usagePercentage = Math.min(
                100,
                Number(((usageSummary.totalTokens / tokenLimit) * 100).toFixed(1)),
            );
        }

        res.render('ai/config', {
            title: 'AI 사용 시간 설정',
            config: currentConfig,
            usageSummary,
            tokenLimit: Number.isFinite(tokenLimit) && tokenLimit > 0 ? tokenLimit : null,
            usagePercentage,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send("<script>alert('설정 정보를 불러오지 못했습니다.');location.href='/ai/chat'</script>");
    }
});

router.post('/config', async (req, res) => {
    const userId = req.user?.id;
    const startTime = Number.parseInt(req.body.startTime, 10);
    const endTime = Number.parseInt(req.body.endTime, 10);

    const isValidStart = Number.isInteger(startTime) && startTime >= 0 && startTime <= 23;
    const isValidEnd = Number.isInteger(endTime) && endTime > 0 && endTime <= 24;

    if (!isValidStart || !isValidEnd || startTime >= endTime) {
        return res
            .status(400)
            .send("<script>alert('잘못된 시간 설정입니다.');location.href='/ai/config'</script>");
    }

    const result = await setUseTime(userId, startTime, endTime);

    if (result?.success) {
        return res
            .status(200)
            .send("<script>alert('사용 시간 설정 완료');location.href='/ai/config'</script>");
    }

    return res
        .status(500)
        .send("<script>alert('설정 저장에 실패했습니다.');location.href='/ai/config'</script>");
});

module.exports = router;
