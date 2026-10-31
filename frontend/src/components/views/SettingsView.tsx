import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { user, updateUser, theme, toggleTheme, geminiApiKey, setGeminiApiKey, fastRecalls, sprintTasks } = useApp();
  const [name, setName] = useState(user.name);
  const [program, setProgram] = useState(user.program);
  const [targetHours, setTargetHours] = useState(user.deepWorkTargetToday);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      program,
      deepWorkTargetToday: targetHours,
    });
    setGeminiApiKey(apiKeyInput.trim());
    setSaveStatus('Profile and preferences updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
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

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
          Settings & Environment Preferences
        </h1>
        <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
          Manage your dual-track curriculum profile, cognitive targets, theme palettes, and AI integrations.
        </p>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-code-sm flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{saveStatus}</span>
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
                {theme === 'dark' ? 'Fine mineral dark umber #141413 tuned for late night sessions' : 'Soft tactile reading surface #FAF9F5 with Playfair Display editorial precision'}
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
                Connect live Gemini 1.5/2.0 API directly to Professor Nova for unrestricted real-time AI responses!
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
    </div>
  );
};
