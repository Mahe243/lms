import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, FileText, Folder, HelpCircle, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { SearchResult } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: string, id: string, url: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query, filterType === 'all' ? undefined : filterType);
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [query, filterType]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen size={14} className="text-indigo-500" />;
      case 'topic': return <BookOpen size={14} className="text-teal-500" />;
      case 'note': return <FileText size={14} className="text-amber-500" />;
      case 'resource': return <Folder size={14} className="text-blue-500" />;
      case 'doubt': return <HelpCircle size={14} className="text-rose-500" />;
      case 'flashcard': return <Layers size={14} className="text-emerald-500" />;
      case 'task': return <CheckCircle2 size={14} className="text-purple-500" />;
      default: return <FileText size={14} className="text-neutral-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 space-x-3">
          <Search size={18} className="text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, notes, resources, doubts, cards, tasks..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
              <X size={16} />
            </button>
          )}
          <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-x-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'course', label: 'Courses' },
            { id: 'note', label: 'Notes' },
            { id: 'resource', label: 'Resources' },
            { id: 'doubt', label: 'Doubts' },
            { id: 'flashcard', label: 'Flashcards' },
            { id: 'task', label: 'Tasks' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                filterType === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-800">
          {loading && (
            <div className="p-8 text-center text-xs text-neutral-400">Searching your learning workspace...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400">
              No results found for "<span className="font-semibold">{query}</span>"
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center text-xs text-neutral-400">
              Type keywords to search across notes, video notes, transcripts, doubts, and courses.
            </div>
          )}

          {!loading && results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => {
                onNavigate(item.type, item.id, item.url);
                onClose();
              }}
              className="w-full text-left p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-lg flex items-start justify-between group transition"
            >
              <div className="flex items-start space-x-3 overflow-hidden">
                <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex flex-col truncate">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                      {item.type}
                    </span>
                  </div>
                  {item.snippet && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 max-w-lg">
                      {item.snippet}
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight size={14} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition mt-1 ml-2 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
