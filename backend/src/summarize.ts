import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export async function summarizeArticle(text: string): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a news summarizer. Summarize the given article in 2-3 clear, concise sentences. No fluff.',
            },
            {
                role: 'user',
                content: text,
            },
        ],
        max_tokens: 150,
    });

    return response.choices[0].message.content || '';
}
