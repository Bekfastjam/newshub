import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Onboarding() {
  const [allSources, setAllSources] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sourcesRes, categoriesRes] = await Promise.all([
          api.get('/api/news/meta/sources'),
          api.get('/api/news/meta/categories'),
        ]);
        setAllSources(sourcesRes.data);
        setAllCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      } finally {
        setLoading(false);
      }
    };
    loadMeta();
  }, []);

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

  const handleContinue = async () => {
    setSaving(true);
    try {
      await api.put('/api/preferences', {
        categories: selectedCategories,
        sources: selectedSources,
      });
    } catch (err) {
      console.error('Failed to save preferences', err);
    } finally {
      setSaving(false);
      navigate('/');
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading options...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Personalize your feed</h1>
        <p className="text-gray-400 mb-8">
          Pick the sources and categories you care about. You can change this anytime in Settings.
        </p>

        {allSources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Sources</h2>
            <div className="flex flex-wrap gap-2">
              {allSources.map(source => {
                const active = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`text-sm px-4 py-2 rounded-full border transition ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-sm px-4 py-2 rounded-full border capitalize transition ${
                      active
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue to Feed'}
          </button>
        </div>
      </div>
    </div>
  );
}
