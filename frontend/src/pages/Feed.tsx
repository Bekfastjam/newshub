import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

interface Article {
  id: number;
  title: string;
  source: string;
  category: string;
  aiSummary: string | null;
  summary: string | null;
  publishedAt: string;
  link: string;
}

export default function Feed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const res = await api.get(`/news?${params.toString()}`);
    setArticles(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, [category]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const categoryColors: Record<string, string> = {
    technology: 'bg-blue-500',
    sports: 'bg-green-500',
    general: 'bg-purple-500',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">📰 NewsHub</h1>
        <div className="flex gap-3">
          <Link to="/bookmarks" className="text-gray-400 hover:text-white text-sm transition">Bookmarks</Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search + Filter */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchArticles()}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none"
          >
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="sports">Sports</option>
            <option value="general">General</option>
          </select>
          <button
            onClick={fetchArticles}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            Search
          </button>
        </div>

        {/* Articles */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <Link to={`/article/${article.id}`} key={article.id}>
                <div className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition cursor-pointer border border-gray-800 hover:border-gray-600 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${categoryColors[article.category] || 'bg-gray-600'}`}>
                      {article.category}
                    </span>
                    <span className="text-gray-500 text-xs">{article.source}</span>
                    <span className="text-gray-600 text-xs ml-auto">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-white font-semibold text-lg mb-2 leading-snug">{article.title}</h2>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {article.aiSummary || article.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
