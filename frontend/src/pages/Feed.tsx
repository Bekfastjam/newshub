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

const GUEST_FILTERS_KEY = 'newshub_guest_filters';

export default function Feed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [allSources, setAllSources] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const init = async () => {
      try {
        const [sourcesRes, categoriesRes] = await Promise.all([
          api.get('/api/news/meta/sources'),
          api.get('/api/news/meta/categories'),
        ]);
        setAllSources(sourcesRes.data);
        setAllCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }

      if (isLoggedIn) {
        try {
          const res = await api.get('/api/preferences');
          setCategory(res.data.categories?.[0] || '');
          setSelectedSources(res.data.sources || []);
        } catch (err) {
          console.error('Failed to load preferences', err);
        }
      } else {
        const saved = localStorage.getItem(GUEST_FILTERS_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCategory(parsed.category || '');
            setSelectedSources(parsed.sources || []);
          } catch {
            // ignore malformed cached data
          }
        }
      }

      setPrefsLoaded(true);
    };
    init();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (selectedSources.length > 0) params.append('source', selectedSources.join(','));
    const res = await api.get(`/api/news?${params.toString()}`);
    setArticles(res.data);
    setLoading(false);
  };

  const persistFilters = async () => {
    if (isLoggedIn) {
      try {
        await api.put('/api/preferences', {
          categories: category ? [category] : [],
          sources: selectedSources,
        });
      } catch (err) {
        console.error('Failed to save preferences', err);
      }
    } else {
      localStorage.setItem(
        GUEST_FILTERS_KEY,
        JSON.stringify({ category, sources: selectedSources })
      );
    }
  };

  useEffect(() => {
    if (!prefsLoaded) return;
    fetchArticles();
    persistFilters();
  }, [category, selectedSources, prefsLoaded]);

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

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
        {/* Search + Category Filter */}
        <div className="flex gap-3 mb-4">
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
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={fetchArticles}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            Search
          </button>
        </div>

        {/* Source Multi-Select Filter */}
        {allSources.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-gray-500 text-sm mr-1">Sources:</span>
            {allSources.map(source => {
              const active = selectedSources.includes(source);
              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {source}
                </button>
              );
            })}
            {selectedSources.length > 0 && (
              <button
                onClick={() => setSelectedSources([])}
                className="text-xs px-3 py-1.5 rounded-full text-gray-500 hover:text-red-400 transition"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Articles */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No articles match your filters.</div>
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
