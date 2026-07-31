import Parser from 'rss-parser';
import { prisma } from './db';
import { feedSources } from './sources';

const parser = new Parser();

export async function fetchAllFeeds() {
    console.log('Starting feed fetch...');
    let totalNew = 0;

    for (const source of feedSources) {
        try {
            const feed = await parser.parseURL(source.url);

            for (const item of feed.items) {
                if (!item.link || !item.title) continue;

                const existing = await prisma.article.findUnique({
                    where: { link: item.link },
                });

                if (existing) continue;

                await prisma.article.create({
                    data: {
                        title: item.title,
                        link: item.link,
                        summary: item.contentSnippet || item.summary || null,
                        content: item.content || null,
                        source: source.name,
                        category: source.category,
                        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
                    },
                });

                totalNew++;
            }
        } catch (err) {
            console.error(`Failed to fetch ${source.name}:`, err);
        }
    }

    console.log(`Feed fetch complete. ${totalNew} new articles added.`);
}
