import React from 'react';
import { useApp } from '../../context/AppContext';
import type { NavigationPath } from '../../types';

interface NavItem {
  path: NavigationPath;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: 'home', label: 'Home', icon: 'home' },
  { path: 'my-learning', label: 'My Learning', icon: 'auto_stories' },
  { path: 'classroom', label: 'Classroom', icon: 'meeting_room' },
  { path: 'ai-tutor', label: 'AI Tutor', icon: 'neurology' },
  { path: 'practice-arena', label: 'Practice Arena', icon: 'fitness_center' },
  { path: 'study-room', label: 'Study Room', icon: 'group' },
  { path: 'my-library', label: 'My Library', icon: 'local_library' },
  { path: 'projects', label: 'Projects', icon: 'assignment' },
  { path: 'goals-and-progress', label: 'Goals & Progress', icon: 'trending_up' },
  { path: 'settings', label: 'Settings', icon: 'settings' },
];

export const Sidebar: React.FC = () => {
  const { currentPath, setCurrentPath, user, setIsCommandPaletteOpen } = useApp();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-low dark:bg-dark-surface dark:border-r dark:border-dark-border flex flex-col justify-between p-space-md z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none">
      <div className="flex flex-col gap-space-md">
        {/* Brand / Logo */}
        <div 
          onClick={() => setCurrentPath('home')}
          className="flex items-center gap-space-sm px-space-xs py-space-2xs cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          </div>
          <span className="font-headline-sm text-headline-sm text-primary dark:text-inverse-primary tracking-tight font-serif font-bold">
            LEARNOVA
          </span>
        </div>

        {/* Global Search Bar */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative flex items-center bg-surface-container-lowest dark:bg-dark-surface-2 dark:text-dark-text rounded-lg px-space-sm py-space-xs text-on-surface-variant hover:border-primary/40 border border-transparent transition-all shadow-sm text-left group"
        >
          <span className="material-symbols-outlined text-space-md mr-space-xs text-on-surface-variant group-hover:text-primary transition-colors">
            search
          </span>
          <span className="font-body-sm text-body-sm flex-1 text-on-surface-variant dark:text-dark-text-muted">
            Search or ⌘K
          </span>
          <kbd className="font-code-sm text-code-sm bg-surface-container dark:bg-dark-canvas px-1.5 py-0.5 rounded text-on-surface-variant dark:text-dark-text border border-outline-variant/30">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-space-2xs overflow-y-auto max-h-[calc(100vh-21rem)] pr-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path === 'my-learning' && currentPath === 'classroom');
            return (
              <button
                key={item.path}
                onClick={() => setCurrentPath(item.path)}
                className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg font-label-md text-label-md transition-all text-left ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant dark:text-dark-text-muted hover:bg-surface-container-high dark:hover:bg-dark-surface-2 hover:text-on-surface dark:hover:text-dark-text'
                }`}
              >
                <span className={`material-symbols-outlined text-space-lg ${isActive ? 'text-white' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.path === 'classroom' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Streak */}
      <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-variant/40 dark:border-dark-border">
        {/* Streak Capsule */}
        <div 
          onClick={() => setCurrentPath('goals-and-progress')}
          className="flex items-center justify-between bg-surface-container-highest dark:bg-dark-surface-2 px-space-sm py-space-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-amber-500 fill-current">local_fire_department</span>
            <span className="font-label-sm text-label-sm uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider">
              {user.streakDays} Day Streak
            </span>
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant dark:text-dark-text-muted bg-surface-container-lowest/80 dark:bg-dark-canvas px-1.5 py-0.5 rounded">
            TOP {user.streakTopPercent}%
          </span>
        </div>

        {/* User Card */}
        <div 
          onClick={() => setCurrentPath('settings')}
          className="flex items-center gap-space-sm p-space-xs rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-2 transition-colors cursor-pointer group"
        >
          <img
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
            src={user.avatar}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-on-surface dark:text-dark-text font-semibold truncate">
              {user.name}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-dark-text-muted truncate">
              {user.program}
            </span>
          </div>
          <span className="material-symbols-outlined text-space-md text-on-surface-variant dark:text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
            chevron_right
          </span>
        </div>
      </div>
    </aside>
  );
};
