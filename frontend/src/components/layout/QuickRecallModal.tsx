import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const QuickRecallModal: React.FC = () => {
  const { isFastRecallOpen, setIsFastRecallOpen, addFastRecall, fastRecalls } = useApp();
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('AI Systems');

  const topics = ['AI Systems', 'Quant Finance', 'Macroeconomics', 'Product Strategy', 'Distributed Systems'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addFastRecall(text.trim(), topic);
    setText('');
    setIsFastRecallOpen(false);
  };

  if (!isFastRecallOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-surface-container-lowest dark:bg-dark-surface rounded-2xl shadow-2xl border border-surface-variant/60 dark:border-dark-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-variant/40 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-serif font-bold text-on-surface dark:text-dark-text">
                Fast Recall Log
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
                Capture high-velocity cognitive insights & compound intellectual retention (+25 XP)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFastRecallOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted mb-2">
              Topic Domain
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    topic === t
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container dark:bg-dark-surface-2 text-on-surface-variant dark:text-dark-text-muted hover:bg-surface-container-high'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted mb-2">
              Insight or Core Recall Concept
            </label>
            <textarea
              autoFocus
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. When gamma is deeply negative, market makers must sell into market drops to delta-hedge, triggering cascading sell-offs..."
              className="w-full p-3 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/60 dark:border-dark-border text-on-surface dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 font-body-md text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-on-surface-variant dark:text-dark-text-muted">
              Auto-indexed to My Library & Spaced Repetition queue
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFastRecallOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-container text-white disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Log Insight</span>
              </button>
            </div>
          </div>
        </form>

        {/* Recent Insights Preview */}
        {fastRecalls.length > 0 && (
          <div className="px-5 pb-5 border-t border-surface-variant/30 dark:border-dark-border pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-text-muted block mb-2">
              Recent Vault Captures
            </span>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {fastRecalls.slice(0, 3).map((r) => (
                <div key={r.id} className="p-2.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary dark:text-inverse-primary">{r.topic}</span>
                    <span className="text-on-surface-variant/60">{r.timestamp}</span>
                  </div>
                  <p className="text-on-surface dark:text-dark-text line-clamp-2">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
