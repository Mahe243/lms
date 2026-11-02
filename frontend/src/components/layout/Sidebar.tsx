import React from 'react';
import { useApp } from '../../context/AppContext';
import type { NavigationPath } from '../../types';

interface NavItem {
  path: NavigationPath;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: 'home', label: 'Kingdom Map', icon: 'castle' },
  { path: 'classroom', label: 'The Academy', icon: 'school' },
  { path: 'my-library', label: 'Archive Tower', icon: 'local_library' },
  { path: 'practice-arena', label: 'Challenge Arena', icon: 'fitness_center' },
  { path: 'study-room', label: 'Focus Sanctuary', icon: 'self_improvement' },
  { path: 'projects', label: 'Innovation Forge', icon: 'construction' },
  { path: 'ai-tutor', label: 'Observatory AI', icon: 'neurology' },
  { path: 'goals-and-progress', label: 'Achievements', icon: 'trophy' },
  { path: 'market', label: 'Kingdom Market', icon: 'storefront' },
  { path: 'settings', label: 'Settings', icon: 'settings' },
];

export const Sidebar: React.FC = () => {
  const { currentPath, setCurrentPath, user, gameWallet, setIsCommandPaletteOpen } = useApp();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-kingdom-navy-card border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 z-40 shadow-xs select-none transition-colors">
      <div className="flex flex-col gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => setCurrentPath('home')}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-kingdom-violet flex items-center justify-center text-white font-black shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">castle</span>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight font-serif text-slate-900 dark:text-white">
              LEARNOVA
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-kingdom-violet block leading-none">
              Knowledge Kingdom
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative flex items-center bg-slate-50 dark:bg-kingdom-navy-dark rounded-xl px-3 py-2 text-slate-500 hover:border-kingdom-violet/50 border border-slate-200/80 dark:border-slate-800 transition-all text-left group"
        >
          <span className="material-symbols-outlined text-base mr-2 text-slate-400 group-hover:text-kingdom-violet transition-colors">
            search
          </span>
          <span className="text-xs flex-1 text-slate-400 dark:text-slate-400">
            Search or ⌘K
          </span>
          <kbd className="text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-21rem)] pr-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setCurrentPath(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-kingdom-violet text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.path === 'classroom' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-kingdom-cyan animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Streak */}
      <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
        {/* Streak Capsule */}
        <div 
          onClick={() => setCurrentPath('goals-and-progress')}
          className="flex items-center justify-between bg-slate-50 dark:bg-kingdom-navy-dark px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">local_fire_department</span>
            <span className="text-xs uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider">
              {(typeof gameWallet.streak_days === 'number' && gameWallet.streak_days > 0) ? gameWallet.streak_days : (user.streakDays || 1)}d Streak
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
            LVL {gameWallet.level || user.level || 1}
          </span>
        </div>

        {/* User Card */}
        <div 
          onClick={() => setCurrentPath('settings')}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-kingdom-navy-dark transition-colors cursor-pointer group"
        >
          <img
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-kingdom-violet/30 group-hover:ring-kingdom-violet transition-all"
            src={user.avatar}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
              {user.program}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
