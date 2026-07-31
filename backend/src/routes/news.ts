import { Router } from 'express';
import { prisma } from '../db';
import { fetchAllFeeds } from '../fetchNews';
import { summarizeUnsummarized } from '../summarizeNews';

const router = Router();

// GET /api/news/meta/sources - distinct list of all sources in DB
router.get('/meta/sources', async (req, res) => {
  try {
    const rows = await prisma.article.findMany({
      distinct: ['source'],
      select: { source: true },
      orderBy: { source: 'asc' },
    });
    res.json(rows.map((r) => r.source));
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// GET /api/news/meta/categories - distinct list of all categories in DB
router.get('/meta/categories', async (req, res) => {
  try {
    const rows = await prisma.article.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    res.json(rows.map((r) => r.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/news?category=tech&search=query&source=BBC,TechCrunch
router.get('/', async (req, res) => {
  try {
    const { category, search, source } = req.query;

    const articles = await prisma.article.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(source ? { source: { in: String(source).split(',') } } : {}),
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
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Cron trigger endpoint - fetch news
router.get('/cron/fetch-news', async (req, res) => {
  try {
    console.log('Cron triggered: fetching latest news...');
    await fetchAllFeeds();
    res.json({ status: 'ok', message: 'News fetched successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Cron fetch error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch news' });
  }
});

// Cron trigger endpoint - summarize articles
router.get('/cron/summarize', async (req, res) => {
  try {
    console.log('Cron triggered: summarizing articles...');
    await summarizeUnsummarized();
    res.json({ status: 'ok', message: 'Summarization complete', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Cron summarize error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to summarize' });
  }
});

// Cron trigger endpoint - cleanup old articles
router.get('/cron/cleanup', async (req, res) => {
  try {
    console.log('Cron triggered: cleaning up old articles...');
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await prisma.article.deleteMany({
      where: { publishedAt: { lt: cutoff } }
    });

    res.json({ status: 'ok', deletedCount: result.count, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to clean up' });
  }
});

export default router;
