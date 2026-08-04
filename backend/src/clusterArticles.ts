import { prisma } from './db';
import { embedText } from './embed';
import pLimit from 'p-limit';

const SIMILARITY_THRESHOLD = 0.83;
const CLUSTER_WINDOW_HOURS = 72;

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 8000): Promise<T> {
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

function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function averageVectors(vectors: number[][]): number[] {
    const length = vectors[0].length;
    const avg = new Array(length).fill(0);
    for (const v of vectors) {
        for (let i = 0; i < length; i++) avg[i] += v[i];
    }
    return avg.map((x) => x / vectors.length);
}

async function embedUnembedded() {
    const articles = await prisma.article.findMany({
        where: { embedding: { isEmpty: true } },
    });

    if (articles.length === 0) {
        console.log('No articles need embedding.');
        return;
    }

    console.log(`Embedding ${articles.length} articles...`);
    const limit = pLimit(1);

    await Promise.all(
        articles.map((article) =>
            limit(async () => {
                const text = article.aiSummary || article.title;
                if (!text) return;

                try {
                    const embedding = await withRetry(() => embedText(text));
                    await prisma.article.update({
                        where: { id: article.id },
                        data: { embedding },
                    });
                    console.log(`✓ Embedded: ${article.title}`);
                } catch (err) {
                    console.error(`✗ Failed to embed: ${article.title}`, err);
                }
            })
        )
    );
}

async function assignClusters() {
    const cutoff = new Date(Date.now() - CLUSTER_WINDOW_HOURS * 60 * 60 * 1000);

    const unclustered = await prisma.article.findMany({
        where: {
            clusterId: null,
            publishedAt: { gte: cutoff },
            embedding: { isEmpty: false },
        },
        orderBy: { publishedAt: 'asc' },
    });

    if (unclustered.length === 0) {
        console.log('No unclustered articles to process.');
        return;
    }

    const clusteredArticles = await prisma.article.findMany({
        where: {
            publishedAt: { gte: cutoff },
            clusterId: { not: null },
            embedding: { isEmpty: false },
        },
    });

    const clusterMembers = new Map<number, number[][]>();
    for (const a of clusteredArticles) {
        if (!a.clusterId) continue;
        const list = clusterMembers.get(a.clusterId) || [];
        list.push(a.embedding as number[]);
        clusterMembers.set(a.clusterId, list);
    }

    console.log(`Processing ${unclustered.length} unclustered articles against ${clusterMembers.size} existing clusters...`);

    for (const article of unclustered) {
        const embedding = article.embedding as number[];
        let bestClusterId: number | null = null;
        let bestScore = -1;

        for (const [clusterId, members] of clusterMembers.entries()) {
            const centroid = averageVectors(members);
            const score = cosineSimilarity(embedding, centroid);
            if (score > bestScore) {
                bestScore = score;
                bestClusterId = clusterId;
            }
        }

        if (bestClusterId !== null && bestScore >= SIMILARITY_THRESHOLD) {
            await prisma.article.update({
                where: { id: article.id },
                data: { clusterId: bestClusterId },
            });
            clusterMembers.get(bestClusterId)!.push(embedding);
            console.log(`🔗 Matched "${article.title}" to cluster ${bestClusterId} (score: ${bestScore.toFixed(3)})`);
        } else {
            const newCluster = await prisma.storyCluster.create({
                data: { title: article.title },
            });
            await prisma.article.update({
                where: { id: article.id },
                data: { clusterId: newCluster.id },
            });
            clusterMembers.set(newCluster.id, [embedding]);
            console.log(`🆕 New cluster ${newCluster.id} for "${article.title}"`);
        }
    }

    console.log('✅ Clustering complete.');
}

export async function clusterArticles() {
    await embedUnembedded();
    await assignClusters();
}
