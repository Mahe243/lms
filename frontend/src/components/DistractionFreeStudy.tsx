import React, { useState } from 'react';
import { Minimize2, Play, Pause, Square, Sparkles, Send, CheckCircle2, BookOpen } from 'lucide-react';
import { StudySession, Topic } from '../types';
import { api } from '../api';

interface DistractionFreeStudyProps {
  activeSession: StudySession | null;
  sessionTimerSeconds: number;
  onToggleTimerPause: () => void;
  onOpenSessionModal: () => void;
  onExit: () => void;
  currentTopic?: Topic;
}

export const DistractionFreeStudy: React.FC<DistractionFreeStudyProps> = ({
  activeSession,
  sessionTimerSeconds,
  onToggleTimerPause,
  onOpenSessionModal,
  onExit,
  currentTopic,
}) => {
  const [scratchpad, setScratchpad] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ q: string; a: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || loadingAi) return;
    const q = aiQuestion;
    setAiQuestion('');
    setLoadingAi(true);

    try {
      const res = await api.chatWithTutor({
        message: q,
        context_mode: 'my_materials_plus_general',
        topic_id: currentTopic?.id,
      });
      setAiAnswers((prev) => [...prev, { q, a: res.content }]);
    } catch (err: any) {
      setAiAnswers((prev) => [...prev, { q, a: `Error: ${err.message}` }]);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#faf8f5] dark:bg-[#0e0e10] flex flex-col animate-fade-in text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Top minimal focus bar */}
      <div className="h-14 px-6 border-b border-[#e8e2d7] dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Distraction-Free Focus Mode
          </span>
          {currentTopic && (
            <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium border-l border-neutral-300 dark:border-neutral-700 pl-3">
              {currentTopic.title}
            </span>
          )}
        </div>

        {/* Center Timer */}
        <div className="flex items-center space-x-3 bg-white dark:bg-neutral-900 px-4 py-1 rounded-full border border-[#e8e2d7] dark:border-neutral-800 shadow-xs">
          <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
            {formatTimer(sessionTimerSeconds)}
          </span>
          {activeSession && (
            <button
              onClick={onToggleTimerPause}
              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400"
              title={activeSession.status === 'running' ? 'Pause' : 'Resume'}
            >
              {activeSession.status === 'running' ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
          <button
            onClick={onOpenSessionModal}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline ml-1"
          >
            Finish
          </button>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="flex items-center space-x-1.5 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-lg transition"
        >
          <Minimize2 size={14} />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Scratchpad Notes & Topic Objectives */}
        <div className="flex-1 flex flex-col p-8 max-w-3xl mx-auto w-full">
          {activeSession?.goal && (
            <div className="mb-4 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900">
              🎯 Session Target: {activeSession.goal}
            </div>
          )}

          {currentTopic?.learning_objectives && currentTopic.learning_objectives.length > 0 && (
            <div className="mb-4 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="font-semibold block mb-1">Learning Objectives:</span>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-400">
                {currentTopic.learning_objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Active Focus Scratchpad / Working Notes
            </label>
            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="Jot down formulas, derivations, immediate questions, and key takeaways as you study..."
              className="flex-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm leading-relaxed outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>
        </div>

        {/* Right: Quick In-Focus AI Tutor Drawer */}
        <div className="w-80 border-l border-[#e8e2d7] dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center space-x-2">
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-xs font-semibold">Tutor Assistant</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {aiAnswers.length === 0 ? (
              <div className="text-neutral-400 text-center py-10">
                Need quick clarification or worked example? Ask your tutor here without leaving your session.
              </div>
            ) : (
              aiAnswers.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                    Q: {item.q}
                  </div>
                  <div className="p-2 text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {item.a}
                  </div>
                </div>
              ))
            )}
            {loadingAi && (
              <div className="text-xs text-indigo-500 animate-pulse text-center">Tutor thinking...</div>
            )}
          </div>

          <form onSubmit={handleAskAI} className="p-2 border-t border-neutral-200 dark:border-neutral-800 flex space-x-1.5">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask doubt..."
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
            />
            <button
              type="submit"
              disabled={loadingAi}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
