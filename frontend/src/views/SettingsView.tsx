import React, { useState, useEffect } from 'react';
import {
  Settings, Key, Download, Upload, Shield, Trash2,
  Sparkles, CheckCircle2, AlertTriangle, Moon, Sun, RefreshCw, FileArchive
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface SettingsViewProps {
  user: User | null;
  onRefreshUser: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onRefreshUser,
  darkMode,
  onToggleDarkMode,
}) => {
  const [apiKey, setApiKey] = useState(user?.preferences?.ai_api_key || '');
  const [aiProvider, setAiProvider] = useState(user?.preferences?.ai_provider || 'gemini');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferences?.preferred_explanation_language || 'English');
  const [preferredDepth, setPreferredDepth] = useState(user?.preferences?.preferred_depth || 'balanced');
  const [streakMinMinutes, setStreakMinMinutes] = useState(user?.preferences?.streak_min_minutes || 15);
  const [savedStatus, setSavedStatus] = useState(false);

  // Restore file
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreMessage, setRestoreMessage] = useState('');
  const [demoMessage, setDemoMessage] = useState('');

  useEffect(() => {
    if (user?.preferences) {
      setApiKey(user.preferences.ai_api_key || '');
      setAiProvider(user.preferences.ai_provider || 'gemini');
      setPreferredLanguage(user.preferences.preferred_explanation_language || 'English');
      setPreferredDepth(user.preferences.preferred_depth || 'balanced');
      setStreakMinMinutes(user.preferences.streak_min_minutes || 15);
    }
  }, [user]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateUser({
        preferences: {
          ai_provider: aiProvider,
          ai_api_key: apiKey,
          preferred_explanation_language: preferredLanguage,
          preferred_depth: preferredDepth,
          streak_min_minutes: streakMinMinutes,
        } as any,
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
      onRefreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportFullBackup = async () => {
    try {
      const data = await api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal_lms_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;
    try {
      const res = await api.restoreBackup(restoreFile);
      setRestoreMessage(res.message || 'Restored successfully!');
      setTimeout(() => setRestoreMessage(''), 5000);
    } catch (err: any) {
      setRestoreMessage(`Error: ${err.message}`);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await api.seedDemo();
      setDemoMessage(res.message);
      setTimeout(() => setDemoMessage(''), 4000);
      onRefreshUser();
    } catch (err: any) {
      setDemoMessage(err.message);
    }
  };

  const handleCleanDemo = async () => {
    if (!confirm('Are you sure you want to remove demo courses and materials? Your own created items will not be affected.')) return;
    try {
      const res = await api.cleanDemo();
      setDemoMessage(res.message);
      setTimeout(() => setDemoMessage(''), 4000);
      onRefreshUser();
    } catch (err: any) {
      setDemoMessage(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 text-xs">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Workspace Settings & Data</h2>
        <p className="text-neutral-500">Configure AI credentials, spaced repetition parameters, and export backups</p>
      </div>

      {/* AI Provider Configuration */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-indigo-600" />
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Real AI Tutor Configuration
          </h3>
        </div>
        <p className="text-neutral-500 leading-relaxed">
          The AI tutor strictly answers from your learning materials and never simulates hallucinated facts. Configure your API key below or set <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">GEMINI_API_KEY</code> in your environment.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                AI Provider
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
              >
                <option value="gemini">Google Gemini (Recommended - Fast & Grounded)</option>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... or sk-..."
                className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Explanation Language
              </label>
              <input
                type="text"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Explanation Depth
              </label>
              <select
                value={preferredDepth}
                onChange={(e) => setPreferredDepth(e.target.value)}
                className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
              >
                <option value="concise">Concise & Direct</option>
                <option value="balanced">Balanced with Examples</option>
                <option value="detailed">In-Depth & Rigorous</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Streak Min Minutes
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={streakMinMinutes}
                onChange={(e) => setStreakMinMinutes(parseInt(e.target.value) || 15)}
                className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedStatus && (
              <span className="text-emerald-600 font-medium flex items-center space-x-1">
                <CheckCircle2 size={14} />
                <span>Preferences saved successfully!</span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Backup, Restore, and Data Portability */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Shield size={16} className="text-emerald-600" />
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Data Portability & Backups
          </h3>
        </div>
        <p className="text-neutral-500 leading-relaxed">
          Your learning data belongs to you. Export complete JSON workspaces, download your notes in standard Markdown format, or download CSV logs.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportFullBackup}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 font-medium"
          >
            <Download size={14} />
            <span>Full Workspace JSON Backup</span>
          </button>

          <a
            href="/api/backup/export-notes-markdown"
            download
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 font-medium"
          >
            <FileArchive size={14} />
            <span>Export Notes as Markdown (.zip)</span>
          </a>

          <a
            href="/api/backup/export-csv"
            download
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 font-medium"
          >
            <Download size={14} />
            <span>Export Activity Log (CSV)</span>
          </a>
        </div>

        {/* Restore Backup Form */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <span className="font-semibold block mb-2 text-neutral-700 dark:text-neutral-300">
            Restore Backup to Clean Workspace
          </span>
          <form onSubmit={handleRestoreBackup} className="flex items-center space-x-2 max-w-md">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              className="text-xs flex-1"
            />
            <button
              type="submit"
              disabled={!restoreFile}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Restore
            </button>
          </form>
          {restoreMessage && (
            <p className="mt-2 text-indigo-600 font-medium">{restoreMessage}</p>
          )}
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
          Demo Data Controls
        </h3>
        <p className="text-neutral-500 leading-relaxed">
          You can load realistic demo courses, flashcards, and quizzes to test every feature. You can remove all demo materials at any time with a single click without touching any personal notes or courses you have created!
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedDemo}
            className="px-3.5 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg font-semibold hover:bg-indigo-100"
          >
            Seed Realistic Demo Data
          </button>
          <button
            onClick={handleCleanDemo}
            className="px-3.5 py-2 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg font-semibold hover:bg-rose-100"
          >
            Wipe Demo Data (Keep Personal)
          </button>
        </div>

        {demoMessage && (
          <p className="text-neutral-700 dark:text-neutral-300 font-medium">{demoMessage}</p>
        )}
      </div>
    </div>
  );
};
