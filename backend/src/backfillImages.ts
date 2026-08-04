import Parser from 'rss-parser';
import { prisma } from './db';
import { feedSources } from './sources';

type CustomItem = {
    'media:content'?: any;
    'media:thumbnail'?: any;
    enclosure?: { url?: string; type?: string };
};

const parser: Parser<{}, CustomItem> = new Parser({
    customFields: {
        item: [
            ['media:content', 'media:content'],
            ['media:thumbnail', 'media:thumbnail'],
        ],
    },
});

function normalizeUrl(url: string): string {
    try {
        const decoded = decodeURIComponent(url);
        new URL(decoded);
        return decoded;
    } catch {
        return url;
    }
}

function extractImageUrl(item: any): string | null {
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
        return normalizeUrl(item.enclosure.url);
    }
    const mediaContent = item['media:content'];
    if (mediaContent) {
        const node = Array.isArray(mediaContent) ? mediaContent[0] : mediaContent;
        const url = node?.$?.url || node?.url;
        if (url) return normalizeUrl(url);
    }
    const mediaThumb = item['media:thumbnail'];
    if (mediaThumb) {
        const node = Array.isArray(mediaThumb) ? mediaThumb[0] : mediaThumb;
        const url = node?.$?.url || node?.url;
        if (url) return normalizeUrl(url);
    }
    const html = item.content || item['content:encoded'] || item.summary || '';
    const match = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (match) return normalizeUrl(match[1]);
    return null;
}

async function backfill() {
    console.log('Starting image backfill...');
    let updated = 0;

    for (const source of feedSources) {
        try {
            const feed = await parser.parseURL(source.url);

            for (const item of feed.items) {
                if (!item.link) continue;

                const newImageUrl = extractImageUrl(item);
                if (!newImageUrl) continue;

                const existing = await prisma.article.findUnique({
                    where: { link: item.link },
                    select: { id: true, imageUrl: true },
                });

                if (!existing) continue;

                // Update if missing, or if currently broken (contains double-encoded chars)
                const isBroken = existing.imageUrl?.includes('%2F') || existing.imageUrl?.includes('%3D');
                if (!existing.imageUrl || isBroken) {
                    await prisma.article.update({
                        where: { id: existing.id },
                        data: { imageUrl: newImageUrl },
                    });
                    updated++;
                }
            }
        } catch (err) {
            console.error(`Failed to backfill ${source.name}:`, err);
        }
    }

    console.log(`Backfill complete. ${updated} articles updated.`);
}

backfill().then(() => process.exit(0));
