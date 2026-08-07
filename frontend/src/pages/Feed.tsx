import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import { sourceGroups, expandSourceSelection } from '../sourceGroups';

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

// Reverse-lookup: given a raw DB source name, find which brand it belongs to.
// Falls back to the raw name itself if it's not part of any group.
function getBrandForSource(raw: string): string {
  for (const [brand, list] of Object.entries(sourceGroups)) {
    if (list.includes(raw)) return brand;
  }
  return raw;
}

// Normalize any stored/loaded source values (which may be old raw strings
// from before grouping existed) into deduplicated brand names.
function normalizeToBrands(sources: string[]): string[] {
  return Array.from(new Set(sources.map(getBrandForSource)));
}

export default function Feed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const navigate = useNavigate();

  const displayBrands = useMemo(
    () => Array.from(new Set(allSources.map(getBrandForSource))).sort(),
    [allSources]
  );

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
          setSelectedCategories(res.data.categories || []);
          setSelectedSources(normalizeToBrands(res.data.sources || []));
        } catch (err) {
          console.error('Failed to load preferences', err);
        }
      } else {
        const saved = localStorage.getItem(GUEST_FILTERS_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSelectedCategories(parsed.categories || []);
            setSelectedSources(normalizeToBrands(parsed.sources || []));
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
    if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
    const expandedSources = expandSourceSelection(selectedSources);
    if (expandedSources.length > 0) params.append('source', expandedSources.join(','));
    const res = await api.get(`/api/news?${params.toString()}`);
    setArticles(res.data);
    setLoading(false);
  };

  const persistFilters = async () => {
    if (isLoggedIn) {
      try {
        await api.put('/api/preferences', {
          categories: selectedCategories,
          sources: selectedSources,
        });
      } catch (err) {
        console.error('Failed to save preferences', err);
      }
    } else {
      localStorage.setItem(
        GUEST_FILTERS_KEY,
        JSON.stringify({ categories: selectedCategories, sources: selectedSources })
      );
    }
  };

  useEffect(() => {
    if (!prefsLoaded) return;
    fetchArticles();
    persistFilters();
  }, [selectedCategories, selectedSources, prefsLoaded]);

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">📰 NewsHub</h1>
        <div className="flex items-center gap-3">
          <Link to="/bookmarks" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition">Bookmarks</Link>
          <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-sm transition">Logout</button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchArticles()}
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchArticles}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Search
          </button>
        </div>

        {displayBrands.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-gray-400 dark:text-gray-500 text-sm mr-1">Sources:</span>
            {displayBrands.map(source => {
              const active = selectedSources.includes(source);
              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {source}
                </button>
              );
            })}
            {selectedSources.length > 0 && (
              <button
                onClick={() => setSelectedSources([])}
                className="text-xs px-3 py-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-gray-400 dark:text-gray-500 text-sm mr-1">Categories:</span>
            {allCategories.map(cat => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border capitalize transition ${
                    active
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs px-3 py-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-20">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-20">No articles match your filters.</div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <Link to={`/article/${article.id}`} key={article.id}>
                <div className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-5 transition cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${categoryColors[article.category] || 'bg-gray-500'}`}>
                      {article.category}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{article.source}</span>
                    <span className="text-gray-400 dark:text-gray-600 text-xs ml-auto">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-gray-900 dark:text-white font-semibold text-lg mb-2 leading-snug">{article.title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
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
