import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square, Clock, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../api';
import { StudySession, Course } from '../types';

interface StudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSession: StudySession | null;
  courses: Course[];
  sessionTimerSeconds: number;
  onSessionUpdated: () => void;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  onClose,
  activeSession,
  courses,
  sessionTimerSeconds,
  onSessionUpdated,
}) => {
  // New session state
  const [courseId, setCourseId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [goal, setGoal] = useState('');
  const [sessionType, setSessionType] = useState<'focus' | 'pomodoro'>('pomodoro');
  const [plannedDurationMins, setPlannedDurationMins] = useState(25);

  // Reflection state
  const [isFinishing, setIsFinishing] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState('');
  const [reflectionUnclear, setReflectionUnclear] = useState('');
  const [reflectionConfidence, setReflectionConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [reflectionNext, setReflectionNext] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSession) {
      setCourseId(activeSession.course_id || '');
      setTopicId(activeSession.topic_id || '');
      setGoal(activeSession.goal || '');
    }
  }, [activeSession]);

  if (!isOpen) return null;

  const selectedCourse = courses.find((c) => c.id === courseId);
  const topics = selectedCourse ? selectedCourse.modules.flatMap((m) => m.topics) : [];

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.startSession({
        course_id: courseId || undefined,
        topic_id: topicId || undefined,
        goal,
        session_type: sessionType,
        planned_duration_mins: plannedDurationMins,
      });
      onSessionUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async () => {
    if (!activeSession) return;
    const newStatus = activeSession.status === 'running' ? 'paused' : 'running';
    try {
      await api.updateSession(activeSession.id, {
        status: newStatus,
        actual_duration_secs: sessionTimerSeconds,
      });
      onSessionUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    setLoading(true);
    try {
      await api.updateSession(activeSession.id, {
        status: 'completed',
        actual_duration_secs: sessionTimerSeconds,
        reflection_completed: reflectionCompleted,
        reflection_unclear: reflectionUnclear,
        reflection_confidence: reflectionConfidence,
        reflection_next: reflectionNext,
        session_notes: sessionNotes,
      });
      setIsFinishing(false);
      onSessionUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-indigo-600" />
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              {activeSession ? (isFinishing ? 'End of Session Reflection' : 'Active Study Session') : 'Start Study Session'}
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {activeSession ? (
          isFinishing ? (
            /* Reflection Form */
            <form onSubmit={handleFinishReflectionSubmit} className="p-5 space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-xs">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">Session Completed:</span>
                <span className="ml-2 font-mono text-indigo-700 dark:text-indigo-300">
                  {formatTimer(sessionTimerSeconds)}
                </span>
                {activeSession.goal && (
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">Goal: {activeSession.goal}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  1. What did I complete?
                </label>
                <textarea
                  rows={2}
                  required
                  value={reflectionCompleted}
                  onChange={(e) => setReflectionCompleted(e.target.value)}
                  placeholder="e.g. Read Raft paper pages 1-8, wrote summary notes..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  2. What remains unclear or difficult?
                </label>
                <textarea
                  rows={2}
                  value={reflectionUnclear}
                  onChange={(e) => setReflectionUnclear(e.target.value)}
                  placeholder="e.g. Leader election randomized timer edge cases..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    3. How confident do I feel?
                  </label>
                  <select
                    value={reflectionConfidence}
                    onChange={(e) => setReflectionConfidence(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low (Needs Review)</option>
                    <option value="medium">Medium (Comfortable)</option>
                    <option value="high">High (Confident)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    4. What should I study next?
                  </label>
                  <input
                    type="text"
                    value={reflectionNext}
                    onChange={(e) => setReflectionNext(e.target.value)}
                    placeholder="e.g. Vector clock exercises"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFinishing(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Back to Timer
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  {loading ? 'Saving...' : 'Save & Record in Analytics'}
                </button>
              </div>
            </form>
          ) : (
            /* Running Timer View */
            <div className="p-6 text-center space-y-5">
              <div className="text-4xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {formatTimer(sessionTimerSeconds)}
              </div>

              {activeSession.goal && (
                <div className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/60 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 inline-block max-w-sm">
                  🎯 Goal: <span className="font-semibold">{activeSession.goal}</span>
                </div>
              )}

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={handlePauseResume}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
                    activeSession.status === 'running'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {activeSession.status === 'running' ? <Pause size={14} /> : <Play size={14} />}
                  <span>{activeSession.status === 'running' ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  onClick={() => setIsFinishing(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <Square size={14} />
                  <span>Finish & Reflect</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* Start New Session Form */
          <form onSubmit={handleStartSession} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Course (Optional)
              </label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setTopicId('');
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
              >
                <option value="">Independent Study / General</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {topics.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Topic (Optional)
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                >
                  <option value="">General Course Work</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Session Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Read Raft paper Section 5, practice 5 questions"
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Session Type
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSessionType(val);
                    if (val === 'pomodoro') setPlannedDurationMins(25);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                >
                  <option value="pomodoro">Pomodoro (25m / 5m)</option>
                  <option value="focus">Deep Focus Timer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Planned Minutes
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={plannedDurationMins}
                  onChange={(e) => setPlannedDurationMins(parseInt(e.target.value) || 25)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {loading ? 'Starting...' : 'Start Timer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
