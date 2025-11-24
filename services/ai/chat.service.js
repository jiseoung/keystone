const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

/**
 * OpenAI Chat Completions API를 래핑한 단일 함수
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {{ model?: string, temperature?: number, maxTokens?: number }} options
 * @returns {Promise<{role: string, content: string}>}
 */
const requestChatCompletion = async (messages, options = {}) => {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY 환경 변수가 설정되어 있지 않습니다.');
    }

    const completion = await client.chat.completions.create({
        model: options.model || DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 384,
    });

    const choice = completion.choices?.[0]?.message;

    if (!choice) {
        throw new Error('OpenAI 응답에서 메시지를 찾을 수 없습니다.');
    }

    const usage = completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
    };

    return {
        message: {
            role: choice.role,
            content: choice.content,
        },
        usage,
    };
};

module.exports = {
    requestChatCompletion,
};
