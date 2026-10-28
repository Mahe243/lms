import React, { useState, useEffect } from 'react';
import {
  BookMarked, Plus, Calendar, Smile, Meh, Frown,
  Trash2, ChevronRight, BookOpen
} from 'lucide-react';
import { JournalEntry, Course } from '../types';
import { api } from '../api';

interface JournalViewProps {
  courses: Course[];
}

export const JournalView: React.FC<JournalViewProps> = ({ courses }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryType, setEntryType] = useState('daily');
  const [learnedText, setLearnedText] = useState('');
  const [difficultText, setDifficultText] = useState('');
  const [unclearText, setUnclearText] = useState('');
  const [helpedText, setHelpedText] = useState('');
  const [nextText, setNextText] = useState('');
  const [moodRating, setMoodRating] = useState(4);
  const [courseId, setCourseId] = useState('');

  const fetchEntries = async () => {
    try {
      const data = await api.getJournalEntries();
      setEntries(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createJournalEntry({
        entry_date: entryDate,
        entry_type: entryType,
        learned_text: learnedText,
        difficult_text: difficultText,
        unclear_text: unclearText,
        helped_text: helpedText,
        next_text: nextText,
        mood_rating: moodRating,
        course_id: courseId || undefined,
      });
      setShowAddModal(false);
      setLearnedText('');
      setDifficultText('');
      setUnclearText('');
      setHelpedText('');
      setNextText('');
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const getMoodEmoji = (rating: number) => {
    if (rating >= 4) return '😄 Great';
    if (rating === 3) return '😐 Neutral';
    return '😞 Struggling';
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Learning Journal & Reflections</h2>
          <p className="text-xs text-neutral-500">Record daily takeaways, persistent roadblocks, and deliberate next steps</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-xs"
        >
          <Plus size={14} />
          <span>New Entry</span>
        </button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            No journal entries recorded yet. Take a moment to reflect on your learning!
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                    {entry.entry_date}
                  </span>
                  <span className="capitalize text-neutral-400">({entry.entry_type})</span>
                </div>
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  Mood: {getMoodEmoji(entry.mood_rating)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                {entry.learned_text && (
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-600">What I Learned:</span>
                    <p className="text-neutral-700 dark:text-neutral-300">{entry.learned_text}</p>
                  </div>
                )}
                {entry.difficult_text && (
                  <div className="space-y-0.5">
                    <span className="font-bold text-rose-600">What was Difficult:</span>
                    <p className="text-neutral-700 dark:text-neutral-300">{entry.difficult_text}</p>
                  </div>
                )}
                {entry.unclear_text && (
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-600">What Remains Unclear:</span>
                    <p className="text-neutral-700 dark:text-neutral-300">{entry.unclear_text}</p>
                  </div>
                )}
                {entry.next_text && (
                  <div className="space-y-0.5">
                    <span className="font-bold text-indigo-600">Next Action:</span>
                    <p className="text-neutral-700 dark:text-neutral-300">{entry.next_text}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Journal Entry */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <h3 className="font-semibold text-sm">Learning Journal Entry</h3>
            <form onSubmit={handleCreateEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Mood Rating</label>
                  <select
                    value={moodRating}
                    onChange={(e) => setMoodRating(parseInt(e.target.value) || 3)}
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  >
                    <option value={5}>5 - Excellent Focus & Clarity</option>
                    <option value={4}>4 - Good Progress</option>
                    <option value={3}>3 - Neutral / Routine</option>
                    <option value={2}>2 - Struggling with Concepts</option>
                    <option value={1}>1 - Low Energy / Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-600 mb-1">1. What did I learn today?</label>
                <textarea
                  rows={2}
                  required
                  value={learnedText}
                  onChange={(e) => setLearnedText(e.target.value)}
                  placeholder="Key concepts, algorithms, or mechanics mastered..."
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-600 mb-1">2. What was difficult or confusing?</label>
                <textarea
                  rows={2}
                  value={difficultText}
                  onChange={(e) => setDifficultText(e.target.value)}
                  placeholder="Points where intuition broke down..."
                  className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-indigo-600 mb-1">3. What will I do next?</label>
                <input
                  type="text"
                  value={nextText}
                  onChange={(e) => setNextText(e.target.value)}
                  placeholder="Tomorrow's focus target..."
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
