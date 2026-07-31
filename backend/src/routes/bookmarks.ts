import express from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/bookmarks
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    const bookmarks = await prisma.bookmark.findMany({
        where: { userId: req.userId! },
        include: { article: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json(bookmarks);
});

// POST /api/bookmarks
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ error: 'articleId required' });

    const existing = await prisma.bookmark.findFirst({
        where: { userId: req.userId!, articleId },
    });
    if (existing) return res.status(409).json({ error: 'Already bookmarked' });

    const bookmark = await prisma.bookmark.create({
        data: { userId: req.userId!, articleId },
    });
    res.status(201).json(bookmark);
});

// DELETE /api/bookmarks/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    const id = parseInt(req.params.id);
    const bookmark = await prisma.bookmark.findUnique({ where: { id } });

    if (!bookmark || bookmark.userId !== req.userId!) {
        return res.status(404).json({ error: 'Bookmark not found' });
    }

    await prisma.bookmark.delete({ where: { id } });
    res.json({ message: 'Bookmark removed' });
});

export default router;
