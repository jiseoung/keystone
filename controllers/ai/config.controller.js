const express = require('express');

const { setUseTime, getUseTime } = require('../../services/ai/config.service');

const router = express.Router();

router.get('/config', async (req, res) => {
    try {
        const userId = req.user?.id;
        const currentConfig = userId ? await getUseTime(userId) : null;

        res.render('ai/config', {
            title: 'AI 사용 시간 설정',
            config: currentConfig,
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

    const isValidHour = (value) => Number.isInteger(value) && value >= 0 && value <= 24;

    if (!isValidHour(startTime) || !isValidHour(endTime) || startTime > endTime) {
        return res
            .status(400)
            .send("<script>alert('잘못된 시간 설정입니다.');location.href='/ai/config'</script>");
    }

    const result = await setUseTime(userId, startTime, endTime);

    if (result?.success) {
        return res
            .status(200)
            .send("<script>alert('사용 시간 설정 완료');location.href='/ai/chat'</script>");
    }

    return res
        .status(500)
        .send("<script>alert('설정 저장에 실패했습니다.');location.href='/ai/config'</script>");
});

module.exports = router;
