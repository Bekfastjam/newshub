import express from 'express';
import { prisma } from '../db';
import { fetchAllFeeds } from '../fetchNews';
import { summarizeUnsummarized } from '../summarizeNews';

const router = express.Router();

// POST /api/news/fetch
router.post('/fetch', async (req, res) => {
    await fetchAllFeeds();
    res.json({ message: 'Fetch complete' });
});

// POST /api/news/summarize
router.post('/summarize', async (req, res) => {
    await summarizeUnsummarized();
    res.json({ message: 'Summarization complete' });
});

// GET /api/news?category=tech&search=query
router.get('/', async (req, res) => {
    const { category, search } = req.query;

    const articles = await prisma.article.findMany({
        where: {
            ...(category ? { category: String(category) } : {}),
            ...(search ? {
                OR: [
                    { title: { contains: String(search) } },
                    { summary: { contains: String(search) } },
                    { aiSummary: { contains: String(search) } },
                ],
            } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
    });
    res.json(articles);
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
});

export default router;
