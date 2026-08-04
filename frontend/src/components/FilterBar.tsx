import React, { useState } from 'react';
import PreferenceSelector from './PreferenceSelector';
import api from '../api';

interface FilterBarProps {
  isAuthenticated: boolean;
  activeSources: string[];
  activeCategories: string[];
  onSourcesChange: (sources: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  isAuthenticated,
  activeSources,
  activeCategories,
  onSourcesChange,
  onCategoriesChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveAsDefault = async () => {
    if (isAuthenticated) {
      try {
        await api.put('/api/preferences', {
          sources: activeSources,
          categories: activeCategories,
        });
      } catch (err) {
        console.error('Failed to save default preferences', err);
      }
    } else {
      localStorage.setItem(
        'newshub_guest_filters',
        JSON.stringify({ sources: activeSources, categories: activeCategories })
      );
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleClear = () => {
    onSourcesChange([]);
    onCategoriesChange([]);
  };

  const activeCount = activeSources.length + activeCategories.length;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          Filters {expanded ? '▲' : '▼'}
          {activeCount > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
          )}
        </button>

        {expanded && (
          <div className="flex items-center gap-3">
            {savedMsg && <span className="text-green-600 dark:text-green-400 text-xs">Saved ✓</span>}
            <button onClick={handleClear} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              Clear all
            </button>
            <button onClick={handleSaveAsDefault} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Save as default
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <PreferenceSelector
            mode="compact"
            selectedSources={activeSources}
            selectedCategories={activeCategories}
            onSourcesChange={onSourcesChange}
            onCategoriesChange={onCategoriesChange}
          />
        </div>
      )}
    </div>
  );
};

export default FilterBar;
