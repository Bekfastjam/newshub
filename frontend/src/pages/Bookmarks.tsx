import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Bookmark {
  id: number;
  article: {
    id: number;
    title: string;
    source: string;
    aiSummary: string | null;
    summary: string | null;
    publishedAt: string;
    category: string;
  };
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    api.get('/api/bookmarks').then(res => setBookmarks(res.data));
  }, []);

  const removeBookmark = async (id: number) => {
    await api.delete(`/api/bookmarks/${id}`);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-gray-400 hover:text-white transition">← Feed</Link>
        <h1 className="text-xl font-bold">★ Bookmarks</h1>
        <div />
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {bookmarks.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-4xl mb-4">📭</p>
            <p>No bookmarks yet. Start saving articles!</p>
            <Link to="/" className="text-blue-400 hover:underline mt-2 inline-block">Browse Feed</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map(b => (
              <div key={b.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex justify-between items-start gap-4">
                <Link to={`/article/${b.article.id}`} className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{b.article.source} · {b.article.category}</p>
                  <h2 className="text-white font-semibold mb-1">{b.article.title}</h2>
                  <p className="text-gray-400 text-sm line-clamp-2">{b.article.aiSummary || b.article.summary}</p>
                </Link>
                <button
                  onClick={() => removeBookmark(b.id)}
                  className="text-gray-600 hover:text-red-400 transition text-xl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
