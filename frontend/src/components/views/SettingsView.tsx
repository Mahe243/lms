import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gameApi } from '../../api/game';
import { userApi } from '../../api/user';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUser,
    theme,
    toggleTheme,
    geminiApiKey,
    setGeminiApiKey,
    fastRecalls,
    sprintTasks,
    isCalmMode,
    toggleCalmMode,
    isSoundEnabled,
    toggleSound,
    reducedMotion,
    refreshWallet,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [program, setProgram] = useState(user.program);
  const [targetHours, setTargetHours] = useState(user.deepWorkTargetToday);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Load authoritative profile on mount
  useEffect(() => {
    userApi
      .getProfile()
      .then((profile) => {
        setName(profile.name);
        const prefs = profile.preferences || {};
        if (prefs.program) setProgram(prefs.program);
        if (prefs.target_hours) setTargetHours(prefs.target_hours);
        if (prefs.ai_api_key) setApiKeyInput(prefs.ai_api_key);
        updateUser({
          name: profile.name,
          program: prefs.program || user.program,
          deepWorkTargetToday: prefs.target_hours || user.deepWorkTargetToday,
        });
      })
      .catch(() => {});
  }, []);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        preferences: {
          program: program.trim(),
          target_hours: targetHours,
          ai_api_key: apiKeyInput.trim(),
          theme,
          sound_enabled: isSoundEnabled,
          calm_mode: isCalmMode,
        },
      });

      updateUser({
        name: updated.name,
        program,
        deepWorkTargetToday: targetHours,
      });
      setGeminiApiKey(apiKeyInput.trim());
      setSaveStatus('Profile and preferences saved to backend database!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch {
      setIsError(true);
      setSaveStatus('Failed to save to server. Please check connection.');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleExportData = () => {
    const backup = {
      user,
      fastRecalls,
      sprintTasks,
      exportTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnova_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteReset = async () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'RESET') return;
    setIsResetting(true);
    try {
      const res = await gameApi.resetGameProgress();
      if (refreshWallet) await refreshWallet();
      setResetFeedback(res.message || 'Game progress reset successfully.');
      setShowResetModal(false);
      setResetConfirmInput('');
    } catch {
      setResetFeedback('Reset request failed. Please check network connection.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
          Settings & Environment Preferences
        </h1>
        <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
          Manage your curriculum profile, Evergrowth Kingdom preferences, soundscapes, accessibility, and AI integrations.
        </p>
      </div>

      {saveStatus && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold font-code-sm flex items-center gap-2 animate-fadeIn ${
          isError
            ? 'bg-red-100 dark:bg-red-950/40 border-red-500/40 text-red-800 dark:text-red-300'
            : 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
        }`}>
          <span className="material-symbols-outlined text-[18px]">{isError ? 'error' : 'check_circle'}</span>
          <span>{saveStatus}</span>
        </div>
      )}

      {resetFeedback && (
        <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold font-code-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>{resetFeedback}</span>
          </div>
          <button onClick={() => setResetFeedback(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-surface-variant/30 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">person</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text">
              Learner Identity & Cohort
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
                Curriculum Track
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
              />
            </div>
          </div>
        </div>

        {/* Evergrowth Kingdom & Calm Mode */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-kingdom-gold/30 dark:border-kingdom-gold/20 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-kingdom-gold text-[22px]">castle</span>
              <div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text">
                  The Evergrowth Kingdom & Experience Mode
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  Toggle between the immersive isometric strategy kingdom and focused academic Calm Mode.
                </p>
              </div>
            </div>
          </div>

          {/* Calm Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2">
            <div>
              <span className="text-xs font-bold text-on-surface dark:text-dark-text block">
                Academic Calm Mode
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Replaces the isometric game map and trial runners with clean academic lists. Never hides educational functionality.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleCalmMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCalmMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCalmMode ? 'spa' : 'sports_esports'}
              </span>
              <span>{isCalmMode ? 'Calm Mode Active' : 'Kingdom Active'}</span>
            </button>
          </div>

          {/* Audio Sound Toggle (OFF by default) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2">
            <div>
              <span className="text-xs font-bold text-on-surface dark:text-dark-text block">
                Kingdom Audio & Sound Effects
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Sound is OFF by default. Enable synthesized sound cues for rewards, trial runners, and ambient soundscapes.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSoundEnabled
                  ? 'bg-kingdom-emerald text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSoundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span>{isSoundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
            </button>
          </div>

          {/* Reduced Motion Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 text-xs">
            <div>
              <span className="font-bold text-on-surface dark:text-dark-text block">
                Operating System Reduced Motion
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Automatically detects <code className="font-mono">prefers-reduced-motion</code> to disable floating animations and camera zooms.
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold font-code-sm ${
                reducedMotion
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {reducedMotion ? 'REDUCED MOTION ACTIVE' : 'STANDARD ANIMATIONS'}
            </span>
          </div>
        </div>

        {/* Cognitive Work Targets */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-surface-variant/30 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">timer</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text">
              Cognitive Workload & Daily Targets
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface dark:text-dark-text mb-1">
              Daily Deep Work Target: <span className="text-primary font-code-sm">{targetHours} Hours</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Visual Theme & Palette */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-surface-variant/30 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">palette</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text">
              Editorial Aesthetic & Theme Mode
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface dark:text-dark-text block">
                {theme === 'dark' ? 'Deep Slate Umber (Dark Canvas)' : 'Warm Alabaster Stone (Light Canvas)'}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {theme === 'dark'
                  ? 'Fine mineral dark umber #141413 tuned for late night sessions'
                  : 'Soft tactile reading surface #FAF9F5 with Playfair Display editorial precision'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-surface-container-high dark:bg-dark-surface-2 text-xs font-bold text-on-surface dark:text-dark-text hover:bg-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Custom Gemini API Key */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-surface-variant/30 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text">
                Gemini API Key (Optional)
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Connect live Gemini 1.5/2.0 API directly to Professor Nova for real-time AI responses!
              </p>
            </div>
          </div>

          <div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-surface-variant/50 text-xs font-mono text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
              Stored locally on your machine in browser localStorage only. Leave empty to use Professor Nova's fast built-in cognitive model.
            </span>
          </div>
        </div>

        {/* Reset Game Progress Warning Card */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-red-500/30 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b border-surface-variant/30 pb-3">
            <span className="material-symbols-outlined text-red-500 text-[22px]">warning</span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-red-600 dark:text-red-400">
                Evergrowth Kingdom Progress Reset
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Reset your cosmetic game level, XP, coins, and building visual tiers without touching learning data.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant max-w-xl">
              <strong>Guaranteed Safe Reset:</strong> All enrolled courses, notes, flashcards, study sessions, quizzes, and project records will remain 100% untouched. Only the gamified layer is reset.
            </p>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            >
              Reset Game Progress
            </button>
          </div>
        </div>

        {/* Submit & Backup Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-xs font-bold text-on-surface dark:text-dark-text transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Second Brain JSON</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Confirmation Modal for Reset Game Progress */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md bg-surface-container-lowest dark:bg-dark-surface rounded-2xl shadow-2xl border border-red-500/40 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-[28px]">restart_alt</span>
              <h3 className="font-bold text-lg font-serif">Confirm Kingdom Reset</h3>
            </div>

            <div className="text-xs text-on-surface dark:text-dark-text space-y-2 leading-relaxed">
              <p>
                You are about to reset your <strong>Evergrowth Kingdom</strong> progression.
              </p>
              <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 space-y-1">
                <div className="text-red-500 font-bold">What will reset:</div>
                <ul className="list-disc list-inside text-on-surface-variant space-y-0.5">
                  <li>Citadel Level back to 1</li>
                  <li>Cosmetic Coins balance to 0</li>
                  <li>Game XP to 0</li>
                  <li>Building visual tiers to Tier 1</li>
                  <li>Daily missions progress</li>
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                <strong>What remains 100% safe:</strong> All your enrolled courses, lesson notes, flashcard reviews, study session history, and capstone project files remain untouched.
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface dark:text-dark-text">
                Type <span className="font-mono text-red-500">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="RESET"
                className="w-full px-3 py-2 rounded-xl bg-surface dark:bg-dark-surface-2 border border-red-500/40 text-xs font-mono text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET' || isResetting}
                onClick={handleExecuteReset}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-40 cursor-pointer"
              >
                {isResetting ? 'Resetting...' : 'Confirm Kingdom Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
