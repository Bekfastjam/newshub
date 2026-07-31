import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import bookmarkRoutes from './routes/bookmarks';
import { fetchAllFeeds } from './fetchNews';
import { summarizeUnsummarized } from './summarizeNews';

const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Cron: fetch RSS every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Cron: Fetching RSS feeds...');
    await fetchAllFeeds();
});

// Cron: summarize new articles every hour
cron.schedule('0 * * * *', async () => {
    console.log('⏰ Cron: Summarizing new articles...');
    await summarizeUnsummarized();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('⏰ Cron jobs scheduled');
});
