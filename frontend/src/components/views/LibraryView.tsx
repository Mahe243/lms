import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { LibraryItem, Flashcard } from '../../types';

export const LibraryView: React.FC = () => {
  const { libraryItems, toggleBookmark, flashcards, reviewFlashcard } = useApp();
  const [activeTab, setActiveTab] = useState<'vault' | 'srs'>('vault');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReaderItem, setActiveReaderItem] = useState<LibraryItem | null>(null);

  // SRS Flashcard State
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const categories = ['All', 'Book', 'Research Paper', 'Lecture Note', 'Cheat Sheet'];

  const filteredItems = libraryItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const currentCard: Flashcard | undefined = flashcards[currentCardIdx];

  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    reviewFlashcard(currentCard.id, rating);
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev + 1) % flashcards.length);
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
              My Library & Second Brain
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary text-xs font-bold font-code-sm">
              INTELLECTUAL VAULT
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
            Curated repository of foundational papers, corporate valuation manuals, and active spaced repetition decks.
          </p>
        </div>

        {/* View Switcher: Vault vs Spaced Repetition Decks */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low dark:bg-dark-surface-2 rounded-xl border border-surface-variant/40">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'vault' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">local_library</span>
            <span>Master Repository ({libraryItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('srs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'srs' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">style</span>
            <span>Spaced Repetition Decks ({flashcards.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REPOSITORY VAULT */}
      {activeTab === 'vault' && (
        <div className="flex flex-col gap-space-md">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-container-lowest dark:bg-dark-surface p-space-sm rounded-xl border border-surface-variant/40 shadow-sm">
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search titles, authors, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest dark:bg-dark-surface rounded-2xl p-space-md border border-surface-variant/40 dark:border-dark-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary text-[10px] font-code-sm font-bold uppercase">
                      {item.category} {item.year ? `• ${item.year}` : ''}
                    </span>
                    <button
                      onClick={() => toggleBookmark(item.id)}
                      className="p-1 rounded-full text-on-surface-variant hover:text-amber-500 transition-colors"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${item.bookmarked ? 'text-amber-500 fill-current' : ''}`}>
                        {item.bookmarked ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>

                  <h3 
                    onClick={() => setActiveReaderItem(item)}
                    className="font-headline-sm text-base font-bold font-serif text-on-surface dark:text-dark-text group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                  >
                    {item.title}
                  </h3>

                  <span className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted block mt-1">
                    {item.author}
                  </span>

                  <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted mt-2 line-clamp-3">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-code-sm text-primary dark:text-inverse-primary bg-surface-container px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-surface-variant/30 dark:border-dark-border flex items-center justify-between text-xs">
                  <span className="font-code-sm text-on-surface-variant text-[11px]">
                    {item.readTime}
                  </span>
                  <button
                    onClick={() => setActiveReaderItem(item)}
                    className="font-bold text-primary dark:text-inverse-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>Read Notes</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SPACED REPETITION FLASHCARDS TRAINER */}
      {activeTab === 'srs' && (
        <div className="flex flex-col items-center justify-center py-6 gap-space-lg max-w-2xl mx-auto w-full">
          <div className="w-full flex items-center justify-between text-xs font-code-sm text-on-surface-variant">
            <span>CARD {currentCardIdx + 1} OF {flashcards.length}</span>
            <span className="font-bold text-primary">{currentCard?.category}</span>
            <span>NEXT REVIEW: {currentCard?.nextReview}</span>
          </div>

          {/* Flashcard Surface */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] rounded-2xl bg-surface-container-lowest dark:bg-dark-surface border-2 border-surface-variant/60 dark:border-dark-border p-space-xl flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all relative select-none"
          >
            <div className="flex items-center justify-between text-xs font-code-sm text-on-surface-variant">
              <span className="uppercase font-bold tracking-wider">
                {isFlipped ? 'Answer / Synthesized Insight' : 'Core Prompt / Concept'}
              </span>
              <span className="text-[11px]">Click to flip card (or press Space)</span>
            </div>

            <div className="my-auto py-6 text-center">
              <p className={`font-serif leading-relaxed text-on-surface dark:text-dark-text whitespace-pre-line ${
                isFlipped ? 'text-sm font-medium' : 'text-lg md:text-xl font-bold'
              }`}>
                {isFlipped ? currentCard?.back : currentCard?.front}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-code-sm text-on-surface-variant/60">
              <span>Reviewed {currentCard?.reviewCount} times</span>
              <span className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[14px]">touch_app</span>
                <span>{isFlipped ? 'Back' : 'Front'}</span>
              </span>
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-3 w-full animate-fadeIn">
              <button
                onClick={() => handleRateCard('again')}
                className="py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-all flex flex-col items-center cursor-pointer"
              >
                <span>Again</span>
                <span className="text-[10px] opacity-70">&lt; 1 min</span>
              </button>
              <button
                onClick={() => handleRateCard('hard')}
                className="py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-all flex flex-col items-center cursor-pointer"
              >
                <span>Hard</span>
                <span className="text-[10px] opacity-70">1 day</span>
              </button>
              <button
                onClick={() => handleRateCard('good')}
                className="py-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-all flex flex-col items-center cursor-pointer"
              >
                <span>Good</span>
                <span className="text-[10px] opacity-70">3 days</span>
              </button>
              <button
                onClick={() => handleRateCard('easy')}
                className="py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all flex flex-col items-center cursor-pointer"
              >
                <span>Easy</span>
                <span className="text-[10px] opacity-70">7 days</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* READING MODAL / DRAWER */}
      {activeReaderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-3xl max-h-[85vh] bg-surface-container-lowest dark:bg-dark-surface rounded-2xl shadow-2xl border border-surface-variant/60 dark:border-dark-border overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-surface-variant/40 dark:border-dark-border">
              <div>
                <span className="text-[10px] font-code-sm uppercase font-bold text-primary block">
                  {activeReaderItem.category} • {activeReaderItem.author}
                </span>
                <h3 className="font-headline-sm text-lg font-bold font-serif text-on-surface dark:text-dark-text">
                  {activeReaderItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveReaderItem(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-body-md text-on-surface dark:text-dark-text leading-relaxed">
              <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 font-code-sm">
                <span className="font-bold text-on-surface block mb-1">Standard Academic Citation:</span>
                <p className="text-on-surface-variant">{activeReaderItem.citation}</p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1">Executive Summary</h4>
                <p className="text-on-surface-variant leading-relaxed">{activeReaderItem.summary}</p>
              </div>

              {activeReaderItem.fullNotes && (
                <div>
                  <h4 className="font-bold text-sm mb-1">Detailed Research Annotations</h4>
                  <pre className="p-4 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 font-mono text-xs whitespace-pre-wrap overflow-x-auto text-on-surface dark:text-dark-text">
                    {activeReaderItem.fullNotes}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-container-low dark:bg-dark-surface-2 border-t border-surface-variant/40 flex items-center justify-between text-xs">
              <span className="font-code-sm text-on-surface-variant">Progress: {activeReaderItem.progress}% completed</span>
              <button
                onClick={() => setActiveReaderItem(null)}
                className="px-5 py-2 rounded-xl bg-primary text-white font-bold cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
