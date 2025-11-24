const express = require('express');

const checkTime = require('../../middlewares/checkTime.middleware');
const { requestChatCompletion } = require('../../services/ai/chat.service');

const router = express.Router();

router.get('/chat', checkTime, (req, res) => {
    res.render('ai/chat', {
        title: 'AI와 대화하기',
    });
});

router.post('/chat', checkTime, async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'message 필드에 전송할 내용을 포함해 주세요.',
            });
        }

        const sanitizedHistory = Array.isArray(history)
            ? history.filter(
                (entry) =>
                    entry &&
                    typeof entry.role === 'string' &&
                    typeof entry.content === 'string' &&
                    entry.content.trim().length > 0,
            )
            : [];

        const messages = sanitizedHistory.length
            ? sanitizedHistory
            : [
                {
                    role: 'system',
                    content: '당신은 사용자의 질문에 친절하고 간결하게 답변하는 도우미입니다.',
                },
            ];

        messages.push({
            role: 'user',
            content: message.trim(),
        });

        const assistantMessage = await requestChatCompletion(messages);

        return res.json({
            success: true,
            message: assistantMessage,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: 'AI 응답을 생성하는 중 오류가 발생했습니다.',
        });
    }
});

module.exports = router;
