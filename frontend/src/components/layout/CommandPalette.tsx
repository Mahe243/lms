import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { NavigationPath } from '../../types';

interface SearchOption {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Course' | 'Action' | 'Resource';
  path: NavigationPath;
  icon: string;
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, setCurrentPath, courses, setIsFastRecallOpen } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const baseOptions: SearchOption[] = [
    { id: 'home', title: 'Home Dashboard', subtitle: 'View learning streaks, today focus protocol & metrics', category: 'Navigation', path: 'home', icon: 'home' },
    { id: 'classroom', title: 'Classroom: AI Product Management', subtitle: 'Hybrid Search Architecture & Reciprocal Rank Fusion', category: 'Navigation', path: 'classroom', icon: 'meeting_room' },
    { id: 'ai-tutor', title: 'Professor Nova (AI Tutor)', subtitle: 'Socratic 1:1 tutoring on Option Greeks & RAG', category: 'Navigation', path: 'ai-tutor', icon: 'neurology' },
    { id: 'practice-arena', title: 'Practice Arena & Mock Exam', subtitle: 'RBI Grade B Phase II ESI Full Mock #04', category: 'Navigation', path: 'practice-arena', icon: 'fitness_center' },
    { id: 'study-room', title: 'Study Room & Pomodoro Sanctuary', subtitle: 'Binaural 40Hz beats, focus timer & thought scratchpad', category: 'Navigation', path: 'study-room', icon: 'group' },
    { id: 'projects', title: 'Projects: Learn by Building', subtitle: 'FinTech Underwriting Agents & Uber Health PRD', category: 'Navigation', path: 'projects', icon: 'assignment' },
    { id: 'my-library', title: 'My Library & Spaced Repetition', subtitle: 'Second Brain vault, research papers & flashcards', category: 'Navigation', path: 'my-library', icon: 'local_library' },
    { id: 'goals', title: 'Goals & Mastery Matrix', subtitle: '365-day deep work consistency heatmap & skill trees', category: 'Navigation', path: 'goals-and-progress', icon: 'trending_up' },
    { id: 'settings', title: 'Settings & Integrations', subtitle: 'Profile, dual track, dark theme & Gemini API key', category: 'Navigation', path: 'settings', icon: 'settings' },
  ];

  // Add courses to search options
  const courseOptions: SearchOption[] = courses.map((c) => ({
    id: `course-${c.id}`,
    title: c.title,
    subtitle: `${c.code} • ${c.instructor} (${c.progress}% completed)`,
    category: 'Course',
    path: 'classroom',
    icon: 'auto_stories',
  }));

  const allOptions = [...baseOptions, ...courseOptions];

  const filteredOptions = allOptions.filter((opt) =>
    opt.title.toLowerCase().includes(query.toLowerCase()) ||
    opt.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    opt.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % (filteredOptions.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          executeOption(filteredOptions[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCommandPaletteOpen, filteredOptions, selectedIndex]);

  const executeOption = (opt: SearchOption) => {
    setCurrentPath(opt.path);
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-surface-container-lowest dark:bg-dark-surface rounded-xl shadow-2xl border border-surface-variant/50 dark:border-dark-border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-surface-variant/40 dark:border-dark-border gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]">search</span>
          <input
            autoFocus
            type="text"
            placeholder="Type a command, course, or topic (e.g. 'RAG', 'Options', 'Pomodoro')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none font-body-md text-on-surface dark:text-dark-text placeholder:text-on-surface-variant/60 text-base"
          />
          <kbd className="font-code-sm text-xs bg-surface-container dark:bg-dark-surface-2 px-2 py-0.5 rounded text-on-surface-variant dark:text-dark-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredOptions.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant dark:text-dark-text-muted">
              <span className="material-symbols-outlined text-3xl mb-2">sentiment_dissatisfied</span>
              <p className="font-body-md">No commands or courses found matching "{query}"</p>
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={opt.id}
                  onClick={() => executeOption(opt)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-container text-white'
                      : 'hover:bg-surface-container-high dark:hover:bg-dark-surface-2 text-on-surface dark:text-dark-text'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-white' : 'text-primary dark:text-inverse-primary'}`}>
                      {opt.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-label-md text-label-md font-semibold truncate ${isSelected ? 'text-white' : ''}`}>
                        {opt.title}
                      </span>
                      <span className={`font-body-sm text-xs truncate ${isSelected ? 'text-white/80' : 'text-on-surface-variant dark:text-dark-text-muted'}`}>
                        {opt.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-code-sm uppercase px-2 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-container dark:bg-dark-surface-2 text-on-surface-variant dark:text-dark-text-muted'
                  }`}>
                    {opt.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-low dark:bg-dark-surface-2 border-t border-surface-variant/30 dark:border-dark-border text-xs text-on-surface-variant dark:text-dark-text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <button
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsFastRecallOpen(true);
            }}
            className="flex items-center gap-1 text-primary dark:text-inverse-primary hover:underline font-medium"
          >
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>Open Fast Recall Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
