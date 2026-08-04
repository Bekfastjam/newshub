import React, { useEffect, useState } from 'react';
import api from '../api';

interface PreferenceSelectorProps {
  mode?: 'full' | 'compact';
  selectedSources: string[];
  selectedCategories: string[];
  onSourcesChange: (sources: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
}

const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({
  mode = 'full',
  selectedSources,
  selectedCategories,
  onSourcesChange,
  onCategoriesChange,
}) => {
  const [sources, setSources] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [sourcesRes, categoriesRes] = await Promise.all([
          api.get('/api/news/meta/sources'),
          api.get('/api/news/meta/categories'),
        ]);
        setSources(sourcesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to load metadata', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const toggleSource = (source: string) => {
    onSourcesChange(
      selectedSources.includes(source)
        ? selectedSources.filter((s) => s !== source)
        : [...selectedSources, source]
    );
  };

  const toggleCategory = (category: string) => {
    onCategoriesChange(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category]
    );
  };

  if (loading) {
    return <div className="text-sm text-gray-400 py-4">Loading options...</div>;
  }

  const isCompact = mode === 'compact';

  return (
    <div className={isCompact ? 'flex flex-wrap items-center gap-4' : 'space-y-6'}>
      <div>
        {!isCompact && <h3 className="text-sm font-semibold text-gray-700 mb-2">Sources</h3>}
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => {
            const active = selectedSources.includes(source);
            return (
              <button
                key={source}
                type="button"
                onClick={() => toggleSource(source)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {source}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {!isCompact && <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm border capitalize transition-colors ${
                  active
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreferenceSelector;
