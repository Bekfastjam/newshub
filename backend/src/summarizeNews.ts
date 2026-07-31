import { prisma } from './db';
import { summarizeArticle } from './summarize';
import pLimit from 'p-limit';

async function withRetry(fn: () => Promise<string>, retries = 3, delayMs = 8000): Promise<string> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('rate limit');
            if (isRateLimit && i < retries - 1) {
                console.log(`⏳ Rate limited. Waiting ${delayMs / 1000}s before retry ${i + 1}/${retries}...`);
                await new Promise(res => setTimeout(res, delayMs));
            } else {
                throw err;
            }
        }
    }
    throw new Error('Max retries reached');
}

export async function summarizeUnsummarized() {
    const articles = await prisma.article.findMany({
        where: { aiSummary: null },
    });

    if (articles.length === 0) {
        console.log('No articles to summarize.');
        return;
    }

    console.log(`Summarizing ${articles.length} articles...`);
    const limit = pLimit(1); // 1 at a time to avoid rate limits

    await Promise.all(
        articles.map((article) =>
            limit(async () => {
                const text = article.content || article.summary || article.title;
                if (!text) return;

                try {
                    const aiSummary = await withRetry(() => summarizeArticle(text));
                    await prisma.article.update({
                        where: { id: article.id },
                        data: { aiSummary },
                    });
                    console.log(`✓ Summarized: ${article.title}`);
                } catch (err) {
                    console.error(`✗ Failed: ${article.title}`, err);
                }
            })
        )
    );

    console.log('✅ Summarization complete.');
}
