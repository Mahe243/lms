import React, { useState } from 'react';
import {
  BookOpen, Clock, Flame, RotateCcw, AlertTriangle, Layers,
  CheckCircle2, ArrowRight, Play, Plus, BookMarked, HelpCircle,
  Folder, FileText, ChevronRight
} from 'lucide-react';
import { Course, Task, TopicRevisionQueueItem, Comment, StudySession, AnalyticsData, FlashcardDeck } from '../types';
import { api } from '../api';
import { LoveToStudyBanner } from '../components/LoveToStudyBanner';
import { FestiveTheme } from '../components/FestiveBackground';

interface DashboardViewProps {
  courses: Course[];
  tasks: Task[];
  revisionQueue: TopicRevisionQueueItem[];
  unresolvedDoubts: Comment[];
  decks: FlashcardDeck[];
  analytics: AnalyticsData | null;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenQuickCapture: () => void;
  onOpenSessionModal: () => void;
  onRefreshData: () => void;
  festiveTheme: FestiveTheme;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  tasks,
  revisionQueue,
  unresolvedDoubts,
  decks,
  analytics,
  onNavigate,
  onOpenQuickCapture,
  onOpenSessionModal,
  onRefreshData,
  festiveTheme,
}) => {
  const [quickJournal, setQuickJournal] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  // Filter tasks due soon
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 4);
  // Due revision topics
  const dueTopics = revisionQueue.slice(0, 3);
  // Total flashcards waiting
  const totalCardsDue = decks.reduce((acc, d) => acc + (d.due_count || 0), 0);

  const handleSaveQuickJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJournal.trim()) return;
    try {
      await api.createJournalEntry({
        entry_date: new Date().toISOString().split('T')[0],
        entry_type: 'daily',
        learned_text: quickJournal,
      });
      setQuickJournal('');
      setJournalSaved(true);
      setTimeout(() => setJournalSaved(false), 3000);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Love of Learning & Festive Motivation Banner */}
      <LoveToStudyBanner theme={festiveTheme} streakDays={analytics?.streak_days || 0} />

      {/* Top Banner / Today's Action Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Welcome to Your Personal Workspace</h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl leading-relaxed">
            Organise courses, understand difficult concepts through real AI citations, practise active recall, and track your honest study metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenSessionModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 font-medium text-xs shadow-xs transition"
          >
            <Play size={14} className="fill-indigo-700" />
            <span>Start Study Session</span>
          </button>
          <button
            onClick={onOpenQuickCapture}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-500/50 hover:bg-indigo-500/70 text-white font-medium text-xs border border-indigo-400/30 transition"
          >
            <Plus size={14} />
            <span>Quick Capture</span>
          </button>
        </div>
      </div>

      {/* Honest Consistency & Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Study Streak</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {analytics?.streak_days || 0} <span className="text-xs font-normal text-neutral-500">Days</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">≥15m active study required</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Today's Study Time</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {analytics?.study_time_today_minutes || 0} <span className="text-xs font-normal text-neutral-500">Mins</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Deduplicated active time</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Cards & Topics Due</span>
            <RotateCcw size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {totalCardsDue + dueTopics.length} <span className="text-xs font-normal text-neutral-500">Items</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Spaced repetition queue</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Unresolved Doubts</span>
            <HelpCircle size={16} className="text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {unresolvedDoubts.length} <span className="text-xs font-normal text-neutral-500">Questions</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Pending tutor clarification</p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Courses & Due Revisions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Courses */}
          <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Active Courses & Progress
                </h3>
              </div>
              <button
                onClick={() => onNavigate('courses')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>All Courses</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No active courses yet. Click "Quick Capture" or visit My Courses to add your first curriculum!
              </div>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map((c) => {
                  const pct = c.progress?.completion_percentage || 0;
                  return (
                    <div
                      key={c.id}
                      onClick={() => onNavigate('courses', { courseId: c.id })}
                      className="p-3.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 cursor-pointer transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                            {c.name}
                          </span>
                          <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                            {c.description || 'No description'}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {pct}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
                        <span>
                          {c.progress?.completed_topics || 0} of {c.progress?.total_topics || 0} non-optional topics
                        </span>
                        <span>{c.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Topics & Cards Due for Spaced Revision */}
          <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <RotateCcw size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Ready for Spaced Revision Today
                </h3>
              </div>
              <button
                onClick={() => onNavigate('revision')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>Revision Queue</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Flashcards Queue */}
              <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold block text-neutral-900 dark:text-neutral-100">
                    Flashcard Decks
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {totalCardsDue} card{totalCardsDue === 1 ? '' : 's'} scheduled for recall
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('flashcards', { mode: 'due_today' })}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Study Now
                </button>
              </div>

              {/* Topics Queue */}
              <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold block text-neutral-900 dark:text-neutral-100">
                    Curriculum Topics
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {dueTopics.length} topic{dueTopics.length === 1 ? '' : 's'} ready for interval review
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('revision')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Upcoming Deadlines, Doubts, Quick Reflection */}
        <div className="space-y-6">
          {/* Upcoming Tasks & Deadlines */}
          <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-purple-600" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Upcoming Deadlines
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3 text-center">No pending deadlines</p>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pendingTasks.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {t.task_type} • Priority: {t.priority}
                      </span>
                    </div>
                    {t.due_date && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        {new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doubt Inbox Snapshot */}
          <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle size={16} className="text-rose-600" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Unresolved Doubts
                </h3>
              </div>
              <button
                onClick={() => onNavigate('doubts')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Doubt Inbox
              </button>
            </div>

            {unresolvedDoubts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3 text-center">No unresolved doubts right now!</p>
            ) : (
              <div className="space-y-2">
                {unresolvedDoubts.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onNavigate('doubts')}
                    className="p-2.5 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs cursor-pointer hover:border-rose-300 transition"
                  >
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 line-clamp-2">
                      {d.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Learning Journal Reflection */}
          <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-2">
              <BookMarked size={16} className="text-amber-600" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Quick Daily Reflection
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 mb-3">
              What was the single most valuable concept you learned today?
            </p>
            <form onSubmit={handleSaveQuickJournal} className="space-y-2">
              <textarea
                rows={2}
                value={quickJournal}
                onChange={(e) => setQuickJournal(e.target.value)}
                placeholder="Today I mastered..."
                className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
              <div className="flex justify-between items-center">
                {journalSaved && <span className="text-[11px] text-emerald-600">Saved to Journal!</span>}
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition ml-auto"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
