const { getUseTime } = require('../services/ai/config.service');

const checkTime = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res
                .status(401)
                .send("<script>alert('로그인이 필요합니다.');location.href='/'</script>");
        }

        const useTime = await getUseTime(userId);

        if (!useTime || useTime.startTime === null || useTime.endTime === null) {
            return res
                .status(302)
                .send("<script>alert('AI 사용 시간을 먼저 설정하세요.');location.href='/ai/config'</script>");
        }

        const start = Number(useTime.startTime);
        const end = Number(useTime.endTime);

        const invalidRange =
            Number.isNaN(start) ||
            Number.isNaN(end) ||
            start < 0 ||
            start > 23 ||
            end <= 0 ||
            end > 24 ||
            start >= end;

        if (invalidRange) {
            console.warn(`Invalid AI use-time config for ${userId}:`, useTime);
            return res
                .status(302)
                .send("<script>alert('AI 사용 시간 설정이 잘못되었습니다.');location.href='/ai/config'</script>");
        }

        const currentHour = new Date().getHours();
        const isAllowed = currentHour >= start && currentHour < end;

        if (!isAllowed) {
            return res
                .status(302)
                .send("<script>alert('지정된 사용 시간이 아닙니다.');location.href='/'</script>");
        }

        return next();
    } catch (error) {
        console.error('checkTime middleware error:', error);
        return res
            .status(302)
            .send("<script>alert('시간 확인 중 오류가 발생했습니다.');location.href='/'</script>");
    }
};

module.exports = checkTime;
