import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

interface Article {
  id: number;
  title: string;
  source: string;
  category: string;
  aiSummary: string | null;
  summary: string | null;
  content: string | null;
  publishedAt: string;
  link: string;
  imageUrl: string | null;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/news/${id}`).then(res => setArticle(res.data));
  }, [id]);

  const handleBookmark = async () => {
    try {
      await api.post('/api/bookmarks', { articleId: Number(id) });
      setBookmarked(true);
    } catch {
      setBookmarked(true);
    }
  };

  if (!article) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">← Back</button>
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">📰 NewsHub</Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className={`text-sm px-4 py-1.5 rounded-lg transition ${bookmarked ? 'bg-yellow-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-yellow-600 dark:hover:bg-yellow-600 text-gray-700 dark:text-white'}`}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {article.imageUrl && !imageError && (
          <img
            src={article.imageUrl}
            alt={article.title}
            onError={() => setImageError(true)}
            className="w-full max-h-[420px] object-cover rounded-xl mb-6 border border-gray-200 dark:border-gray-800"
          />
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{article.category}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">{article.source}</span>
          <span className="text-gray-400 dark:text-gray-500 text-sm ml-auto">{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>

        <h1 className="text-3xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">{article.title}</h1>

        {article.aiSummary && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-5 mb-6">
            <p className="text-blue-600 dark:text-blue-300 text-xs font-semibold uppercase mb-2">🤖 AI Summary</p>
            <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{article.aiSummary}</p>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{article.content || article.summary}</p>

        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
}
