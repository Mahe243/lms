import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { studySessionsApi } from '../../api/studySessions';
import { NovaCompanion } from '../kingdom/NovaCompanion';
import type { SoundscapeType } from '../../utils/soundscapes';

export const StudyRoomView: React.FC = () => {
  const {
    timerSeconds,
    timerRunning,
    toggleTimer,
    resetTimer,
    timerMode,
    setTimerMode,
    activeSoundscape,
    setSoundscape,
    soundscapeVolume,
    setSoundscapeVolume,
    sprintTasks,
    toggleSprintTask,
    addSprintTask,
    thoughtNotes,
    setThoughtNotes,
    isCalmMode,
    refreshWallet,
  } = useApp();

  const [newTaskInput, setNewTaskInput] = useState('');
  const [isZenMode, setIsZenMode] = useState(false);
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);
  const [sessionElapsedSecs, setSessionElapsedSecs] = useState<number>(0);
  const [completedAward, setCompletedAward] = useState<{ xp: number; coins: number } | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore running session on mount if one is already active
  useEffect(() => {
    studySessionsApi.getActiveSession()
      .then((sess) => {
        if (sess && (sess.status === 'running' || sess.status === 'paused')) {
          setBackendSessionId(sess.id);
          const startMs = new Date(sess.start_time).getTime();
          const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          setSessionElapsedSecs(elapsed);
        }
      })
      .catch(() => {});
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sync session tracking when timer runs
  useEffect(() => {
    if (timerRunning) {
      if (!backendSessionId) {
        // Start backend session
        const durationMins = timerMode === 'pomodoro' ? 25 : timerMode === 'deep_work' ? 50 : 90;
        studySessionsApi
          .startSession({
            goal: sprintTasks.find((t) => !t.done)?.text || 'Deep focus work block',
            session_type: 'focus',
            planned_duration_mins: durationMins,
          })
          .then((sess) => {
            setBackendSessionId(sess.id);
          })
          .catch(() => {
            // Keep going locally
          });
      }

      elapsedTimerRef.current = setInterval(() => {
        setSessionElapsedSecs((prev) => prev + 1);
      }, 1000);
    } else {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    }

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [timerRunning]);

  // Handle explicit session completion
  const handleCompleteSession = async () => {
    if (!backendSessionId) return;

    try {
      await studySessionsApi.updateSession(backendSessionId, {
        status: 'completed',
        actual_duration_secs: sessionElapsedSecs,
        session_notes: thoughtNotes,
      });
      const durationMins = Math.floor(sessionElapsedSecs / 60);
      if (durationMins >= 15) {
        const cappedMins = Math.min(durationMins, 90);
        const xpEarned = Math.floor(cappedMins * 1.5);
        const coinsEarned = Math.floor(cappedMins * 0.5);
        setCompletedAward({ xp: xpEarned, coins: coinsEarned });
      } else {
        setCompletedAward(null);
      }
      if (refreshWallet) refreshWallet();
    } catch {
      // Offline fallback
    } finally {
      setBackendSessionId(null);
      setSessionElapsedSecs(0);
      resetTimer();
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addSprintTask(newTaskInput.trim());
    setNewTaskInput('');
  };

  const soundscapesList: { id: SoundscapeType; label: string; icon: string; desc: string }[] = [
    { id: 'binaural_40hz', label: '40Hz Gamma Binaural', icon: 'headphones', desc: 'Cognitive focus & working memory frequency' },
    { id: 'library_rain', label: 'Sanctuary Skylight Rain', icon: 'water_drop', desc: 'Gentle low-pass acoustic rain drops' },
    { id: 'coffeehouse', label: 'Cyberpunk Coffeehouse', icon: 'coffee', desc: 'Warm ambient background chatter & hum' },
    { id: 'pink_noise', label: 'Pure Pink Noise', icon: 'waves', desc: 'Balanced frequency mask for deep reading' },
  ];

  return (
    <div
      className={`relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-surface dark:bg-dark-canvas overflow-y-auto px-6 py-8'
          : ''
      }`}
    >
      {/* Top Banner / Header */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
              The Focus Sanctuary
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-kingdom-emerald/15 text-kingdom-emerald text-xs font-bold font-code-sm border border-kingdom-emerald/30">
              DEEP WORK SANCTUARY
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted mt-0.5">
            Eliminate cognitive friction with synchronized binaural soundscapes, focused sprints, and persistent focus milestones.
          </p>
        </div>

        {/* Zen Mode Button */}
        <div className="flex items-center gap-2">
          {sessionElapsedSecs >= 60 && (
            <button
              onClick={handleCompleteSession}
              className="px-3.5 py-1.5 rounded-xl bg-kingdom-emerald text-white text-xs font-bold hover:bg-kingdom-emerald/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>Finish & Claim Sanctuary XP</span>
            </button>
          )}

          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isZenMode ? 'close_fullscreen' : 'fit_screen'}
            </span>
            <span>{isZenMode ? 'Exit Zen Mode' : 'Zen Focus Mode'}</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {completedAward && (
        <div className="p-4 rounded-2xl bg-kingdom-emerald/10 border border-kingdom-emerald/30 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <NovaCompanion expression="celebrate" size="sm" />
            <div>
              <span className="font-bold text-sm text-kingdom-emerald block">
                Sanctuary Session Concluded!
              </span>
              <span className="text-xs text-on-surface-variant">
                Awarded +{completedAward.xp} XP and +{completedAward.coins} Coins. Your Focus Sanctuary has flourished!
              </span>
            </div>
          </div>
          <button
            onClick={() => setCompletedAward(null)}
            className="text-xs font-bold text-kingdom-emerald hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Focus Timer & Audio Generator (Left 7 cols) & Thought Parker + Reference (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Timer & Ambient Soundscape (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Hero Focus Timer Surface with Sanctuary Aesthetic */}
          <div
            className={`rounded-3xl border border-surface-variant/40 dark:border-dark-border p-space-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all ${
              !isCalmMode
                ? 'bg-gradient-to-b from-surface-container-lowest to-kingdom-emerald/5 dark:from-dark-surface dark:to-kingdom-emerald/10'
                : 'bg-surface-container-lowest dark:bg-dark-surface'
            }`}
          >
            {/* Ambient Pulse Ring */}
            <div
              className={`absolute w-72 h-72 rounded-full border border-kingdom-emerald/25 pointer-events-none transition-all duration-1000 ${
                timerRunning ? 'scale-110 opacity-70 animate-ping' : 'scale-95 opacity-20'
              }`}
            ></div>

            {/* Mode Selector Presets */}
            <div className="flex items-center gap-2 mb-6 bg-surface-container-low dark:bg-dark-surface-2 p-1 rounded-xl border border-surface-variant/40 z-10">
              <button
                onClick={() => setTimerMode('pomodoro')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timerMode === 'pomodoro'
                    ? 'bg-kingdom-emerald text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                25m Pomodoro
              </button>
              <button
                onClick={() => setTimerMode('deep_work')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timerMode === 'deep_work'
                    ? 'bg-kingdom-emerald text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                50m Deep Sprint
              </button>
              <button
                onClick={() => setTimerMode('flow')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timerMode === 'flow'
                    ? 'bg-kingdom-emerald text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                90m Flow State
              </button>
            </div>

            {/* Giant Timer Display */}
            <div className="font-code-sm text-6xl lg:text-7xl font-bold tracking-tighter text-on-surface dark:text-dark-text my-4 select-none z-10">
              {formatTimer(timerSeconds)}
            </div>

            <p className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant dark:text-dark-text-muted mb-6 z-10">
              {timerRunning
                ? `Deep Focus Sanctuary Active • ${Math.floor(sessionElapsedSecs / 60)}m elapsed`
                : 'Session Ready — Calm Your Mind & Enter the Zone'}
            </p>

            {/* Timer Action Buttons */}
            <div className="flex items-center gap-4 z-10">
              <button
                onClick={resetTimer}
                title="Reset Session"
                className="p-3 rounded-full bg-surface-container-high dark:bg-dark-surface-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">restart_alt</span>
              </button>

              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-full text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                  timerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : 'bg-kingdom-emerald hover:bg-kingdom-emerald/90 shadow-kingdom-emerald/30'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {timerRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{timerRunning ? 'Pause Sanctuary' : 'Enter Focus Sanctuary'}</span>
              </button>
            </div>
          </div>

          {/* Web Audio Ambient Soundscape Generator */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface rounded-2xl border border-surface-variant/40 dark:border-dark-border p-space-lg shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-kingdom-emerald text-[22px]">graphic_eq</span>
                <div>
                  <h3 className="font-headline-sm text-base font-serif font-bold text-on-surface dark:text-dark-text">
                    Sanctuary Ambient Audio Generator
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-dark-text-muted">
                    Synthesized browser-native Web Audio soundscapes with zero buffering
                  </p>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">volume_up</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundscapeVolume}
                  onChange={(e) => setSoundscapeVolume(parseFloat(e.target.value))}
                  className="w-20 accent-kingdom-emerald cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {soundscapesList.map((sound) => {
                const isActive = activeSoundscape === sound.id;
                return (
                  <div
                    key={sound.id}
                    onClick={() => setSoundscape(isActive ? 'none' : sound.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                      isActive
                        ? 'border-kingdom-emerald bg-kingdom-emerald/10 text-kingdom-emerald dark:text-emerald-300 font-bold shadow-sm'
                        : 'border-surface-variant/50 dark:border-dark-border hover:bg-surface-container-high dark:hover:bg-dark-surface-2 text-on-surface dark:text-dark-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="material-symbols-outlined text-[18px]">{sound.icon}</span>
                        <span>{sound.label}</span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          isActive ? 'text-kingdom-emerald animate-pulse' : 'text-on-surface-variant'
                        }`}
                      >
                        {isActive ? 'volume_up' : 'play_arrow'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant dark:text-dark-text-muted font-normal">
                      {sound.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sprint Milestones & Thought Parker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Sprint Milestones Checklist */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface rounded-2xl border border-surface-variant/40 dark:border-dark-border p-space-md shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
                <span className="material-symbols-outlined text-kingdom-emerald text-[18px]">checklist</span>
                <span>Active Sprint Milestones</span>
              </div>
              <span className="text-[11px] font-code-sm text-kingdom-emerald font-bold">
                {sprintTasks.filter((t) => t.done).length} / {sprintTasks.length} Done
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {sprintTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleSprintTask(task.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                    task.done
                      ? 'bg-surface-container-low dark:bg-dark-surface-2 text-on-surface-variant line-through opacity-70 border-transparent'
                      : 'border-surface-variant/40 dark:border-dark-border hover:bg-surface-container-low text-on-surface dark:text-dark-text'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      task.done ? 'text-kingdom-emerald' : 'text-on-surface-variant'
                    }`}
                  >
                    {task.done ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span className="flex-1 font-medium">{task.text}</span>
                </div>
              ))}
            </div>

            {/* Add task input */}
            <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-2 border-t border-surface-variant/30">
              <input
                type="text"
                placeholder="Add focus objective..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-kingdom-emerald"
              />
              <button
                type="submit"
                disabled={!newTaskInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-kingdom-emerald text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Thought Parker (Scratchpad for Distracting Thoughts) */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface rounded-2xl border border-surface-variant/40 dark:border-dark-border p-space-md shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span>Thought Parker</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-code-sm">Never break flow</span>
            </div>

            <p className="text-[11px] text-on-surface-variant dark:text-dark-text-muted">
              Park sudden unrelated thoughts here immediately so your working memory stays 100% focused on your current deep study block.
            </p>

            <textarea
              rows={4}
              value={thoughtNotes}
              onChange={(e) => setThoughtNotes(e.target.value)}
              placeholder="Dump distracting ideas, grocery lists, or urgent reminders here..."
              className="w-full p-2.5 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 dark:border-dark-border text-xs text-on-surface dark:text-dark-text font-mono resize-none focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Circadian Focus Curve Indicator */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface rounded-2xl border border-surface-variant/40 dark:border-dark-border p-space-md shadow-sm flex flex-col gap-2 text-xs">
            <span className="font-bold text-on-surface dark:text-dark-text flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-kingdom-emerald">insights</span>
              <span>Sanctuary Bio-Energy Flow</span>
            </span>
            <p className="text-[11px] text-on-surface-variant dark:text-dark-text-muted">
              Your peak analytic alertness occurs between 18:00 - 22:30. Current cognitive capacity: <strong>94% Peak</strong>.
            </p>
            <div className="w-full bg-surface-container-high dark:bg-dark-surface-2 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-kingdom-emerald h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
