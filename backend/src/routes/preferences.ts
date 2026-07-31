import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/preferences - fetch current user's saved categories + sources
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [categories, sources] = await Promise.all([
      prisma.preference.findMany({ where: { userId: req.userId! } }),
      prisma.sourcePreference.findMany({ where: { userId: req.userId! } }),
    ]);

    res.json({
      categories: categories.map((c) => c.category),
      sources: sources.map((s) => s.source),
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/preferences - replace current user's categories + sources
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { categories, sources } = req.body as { categories?: string[]; sources?: string[] };

    await prisma.$transaction([
      prisma.preference.deleteMany({ where: { userId: req.userId! } }),
      prisma.sourcePreference.deleteMany({ where: { userId: req.userId! } }),
      prisma.preference.createMany({
        data: (categories || []).map((category) => ({ userId: req.userId!, category })),
      }),
      prisma.sourcePreference.createMany({
        data: (sources || []).map((source) => ({ userId: req.userId!, source })),
      }),
    ]);

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

export default router;
