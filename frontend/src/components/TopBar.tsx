import React from 'react';
import {
  Search, Plus, Bell, Sun, Moon, Maximize2, Play, Pause, Square,
  Clock, CheckCircle, Flame
} from 'lucide-react';
import { StudySession } from '../types';

interface TopBarProps {
  currentTabName: string;
  onOpenSearch: () => void;
  onOpenQuickCapture: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  activeSession: StudySession | null;
  sessionTimerSeconds: number;
  onToggleTimerPause: () => void;
  onOpenSessionModal: () => void;
  onEnterDistractionFree: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  streakDays: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTabName,
  onOpenSearch,
  onOpenQuickCapture,
  onOpenNotifications,
  unreadNotificationsCount,
  activeSession,
  sessionTimerSeconds,
  onToggleTimerPause,
  onOpenSessionModal,
  onEnterDistractionFree,
  darkMode,
  onToggleDarkMode,
  streakDays,
}) => {
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 border-b border-[#e8e2d7] dark:border-neutral-800 bg-[#fcfbf9]/80 dark:bg-[#121214]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Section Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 capitalize tracking-tight">
          {currentTabName}
        </h1>
        {streakDays > 0 && (
          <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-medium">
            <Flame size={13} className="text-amber-500 fill-amber-500" />
            <span>{streakDays} Day Streak</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Active Focus Session Widget */}
        {activeSession ? (
          <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-lg px-2.5 py-1 text-xs text-indigo-900 dark:text-indigo-200 shadow-sm">
            <Clock size={14} className="mr-1.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <button
              onClick={onOpenSessionModal}
              className="font-mono font-bold mr-2 hover:underline"
              title="Click to view/finish session"
            >
              {formatTimer(sessionTimerSeconds)}
            </button>
            <button
              onClick={onToggleTimerPause}
              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded text-indigo-700 dark:text-indigo-300"
              title={activeSession.status === 'running' ? 'Pause session' : 'Resume session'}
            >
              {activeSession.status === 'running' ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={onOpenSessionModal}
              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded text-indigo-700 dark:text-indigo-300 ml-0.5"
              title="Finish session reflection"
            >
              <CheckCircle size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenSessionModal}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[#e8e2d7] dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition shadow-sm"
          >
            <Clock size={13} className="text-neutral-500" />
            <span>Start Session</span>
          </button>
        )}

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-2.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 rounded-lg transition border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
          title="Search workspace (Ctrl+K)"
        >
          <Search size={14} />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline font-mono text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
            Ctrl K
          </kbd>
        </button>

        {/* Quick Capture Button */}
        <button
          onClick={onOpenQuickCapture}
          className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm flex items-center justify-center"
          title="Quick capture (Note, link, doubt, task)"
        >
          <Plus size={16} />
        </button>

        {/* Distraction Free Study Mode */}
        <button
          onClick={onEnterDistractionFree}
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title="Enter Distraction-Free Study Mode"
        >
          <Maximize2 size={16} />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition relative"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
