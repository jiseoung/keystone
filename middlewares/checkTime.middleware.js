const { getUseTime } = require('../services/ai/config.service');

const checkTime = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.redirect('/');
        }

        const useTime = await getUseTime(userId);

        if (!useTime || useTime.startTime === null || useTime.endTime === null) {
            return next();
        }

        const start = Number(useTime.startTime);
        const end = Number(useTime.endTime);

        if (
            Number.isNaN(start) ||
            Number.isNaN(end) ||
            start < 0 ||
            end < 0 ||
            start > 24 ||
            end > 24
        ) {
            console.warn(`Invalid AI use-time config for ${userId}:`, useTime);
            return res.redirect('/');
        }

        const currentHour = new Date().getHours();
        let isAllowed = false;

        if (start === end) {
            isAllowed = currentHour === start;
        } else if (start < end) {
            isAllowed = currentHour >= start && currentHour < end;
        } else {
            // 방어적 코드: start > end인 config가 저장되었을 경우 하루를 넘기는 구간으로 간주
            isAllowed = currentHour >= start || currentHour < end;
        }

        if (!isAllowed) {
            return res.redirect('/');
        }

        return next();
    } catch (error) {
        console.error('checkTime middleware error:', error);
        return res.redirect('/');
    }
};

module.exports = checkTime;
