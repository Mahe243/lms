import React, { useState, useEffect } from 'react';
import {
  RotateCcw, Check, Sparkles, BookOpen, Clock,
  Calendar, Award, ChevronRight, Layers, AlertCircle
} from 'lucide-react';
import { TopicRevisionQueueItem, FlashcardDeck } from '../types';
import { api } from '../api';

interface RevisionViewProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ onNavigate }) => {
  const [topicQueue, setTopicQueue] = useState<TopicRevisionQueueItem[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopicRev, setSelectedTopicRev] = useState<TopicRevisionQueueItem | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const tq = await api.getRevisionQueue();
      setTopicQueue(tq);
      const d = await api.getDecks();
      setDecks(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleRateTopicRevision = async (rating: 'forgot' | 'difficult' | 'good' | 'easy') => {
    if (!selectedTopicRev) return;
    try {
      await api.submitRevision(selectedTopicRev.topic_id, rating, revisionNotes);
      setSelectedTopicRev(null);
      setRevisionNotes('');
      fetchQueues();
    } catch (err) {
      console.error(err);
    }
  };

  const totalCardsDue = decks.reduce((acc, d) => acc + (d.due_count || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Unified Spaced Revision Queue</h2>
          <p className="text-xs text-neutral-500">
            Scientifically spaced intervals (1, 3, 7, 14, 30 days) to prevent the forgetting curve
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Flashcards due card */}
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Active Recall Cards
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 block font-mono">
              {totalCardsDue}
            </span>
            <span className="text-xs text-neutral-500">Individual flashcards due today</span>
          </div>
          <button
            onClick={() => onNavigate('flashcards', { mode: 'due_today' })}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
          >
            Review Flashcards →
          </button>
        </div>

        {/* Topics due card */}
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
              Curriculum Topics
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 block font-mono">
              {topicQueue.length}
            </span>
            <span className="text-xs text-neutral-500">Course topics scheduled for spaced revision</span>
          </div>
        </div>
      </div>

      {/* Topics Spaced Revision List */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
          Topics in Spaced Revision Schedule
        </h3>

        {topicQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No topics in revision schedule yet. Mark topics completed in your courses to schedule them!
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {topicQueue.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.topic_title}</span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      {item.course_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-neutral-400 mt-1 font-mono">
                    <span>Interval: {item.interval_days} days</span>
                    <span>Revision #{item.revision_number}</span>
                    <span>Scheduled: {new Date(item.scheduled_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedTopicRev(item)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                  >
                    Rate Recall
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Rate Topic Revision Recall */}
      {selectedTopicRev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Topic Spaced Recall
              </span>
              <h3 className="font-bold text-base mt-1">{selectedTopicRev.topic_title}</h3>
              <p className="text-neutral-500 mt-0.5">Course: {selectedTopicRev.course_name}</p>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              How accurately did you remember this topic's theorems, invariants, and key mechanics?
            </p>

            <textarea
              rows={2}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Revision notes (optional)..."
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
            />

            <div className="grid grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleRateTopicRevision('forgot')}
                className="py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold hover:bg-rose-100"
              >
                Forgot (1d)
              </button>
              <button
                onClick={() => handleRateTopicRevision('difficult')}
                className="py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold hover:bg-amber-100"
              >
                Difficult
              </button>
              <button
                onClick={() => handleRateTopicRevision('good')}
                className="py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100"
              >
                Good (Next)
              </button>
              <button
                onClick={() => handleRateTopicRevision('easy')}
                className="py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100"
              >
                Easy (+Boost)
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTopicRev(null)}
                className="text-neutral-500 hover:text-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
