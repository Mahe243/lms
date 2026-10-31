import React from 'react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    user,
    timerSeconds,
    timerRunning,
    toggleTimer,
    setCurrentPath,
    activeSoundscape,
    setSoundscape,
    theme,
    toggleTheme,
    setIsFastRecallOpen,
  } = useApp();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSoundscapeLabel = () => {
    switch (activeSoundscape) {
      case 'binaural_40hz': return '40Hz Gamma';
      case 'library_rain': return 'Rain';
      case 'coffeehouse': return 'Coffeehouse';
      case 'pink_noise': return 'Pink Noise';
      default: return null;
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 dark:bg-dark-surface/85 backdrop-blur-xl border-b border-surface-variant/30 dark:border-dark-border z-30 flex items-center justify-between px-space-lg select-none">
      {/* Left Subtitle / Context */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-dark-text-muted uppercase tracking-wider font-semibold">
            Personal Learning Universe
          </span>
        </div>
        <span className="text-outline-variant/60 hidden md:inline">|</span>
        <span className="font-code-sm text-code-sm text-on-surface-variant/80 dark:text-dark-text-muted hidden md:inline">
          {user.cohort} • {user.term}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-sm md:gap-space-md">
        {/* Active Soundscape Badge */}
        {getSoundscapeLabel() && (
          <div 
            onClick={() => setSoundscape('none')}
            title="Click to stop audio soundscape"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-inverse-primary border border-primary/20 text-xs font-medium cursor-pointer hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin">graphic_eq</span>
            <span>{getSoundscapeLabel()}</span>
            <span className="material-symbols-outlined text-[14px]">close</span>
          </div>
        )}

        {/* Global Focus Timer Pill */}
        <div className="flex items-center gap-space-xs bg-surface-container-low dark:bg-dark-surface-2 px-space-sm py-1 rounded-full border border-surface-variant/50 dark:border-dark-border shadow-sm">
          <button
            onClick={() => setCurrentPath('study-room')}
            title="Open Focus Sanctuary"
            className="flex items-center gap-1 text-on-surface dark:text-dark-text hover:text-primary transition-colors"
          >
            <span className={`material-symbols-outlined text-[18px] ${timerRunning ? 'text-tertiary animate-spin' : 'text-on-surface-variant dark:text-dark-text-muted'}`}>
              timer
            </span>
            <span className="font-code-sm text-code-sm font-semibold tracking-tight">
              {formatTimer(timerSeconds)}
            </span>
          </button>
          <button
            onClick={toggleTimer}
            className="font-label-sm text-label-sm font-bold text-primary dark:text-inverse-primary hover:text-primary-container px-2 py-0.5 rounded-full bg-primary-fixed dark:bg-primary/20 transition-colors ml-space-2xs"
          >
            {timerRunning ? 'Pause' : 'Focus'}
          </button>
        </div>

        {/* Fast Recall Button */}
        <button
          onClick={() => setIsFastRecallOpen(true)}
          className="hidden lg:flex items-center gap-1 px-3 py-1 bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary/10 hover:text-primary dark:hover:text-inverse-primary transition-colors rounded-lg font-label-md text-label-md text-on-surface dark:text-dark-text border border-surface-variant/40 dark:border-dark-border"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
          <span>Fast Recall</span>
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg text-on-surface-variant dark:text-dark-text-muted hover:bg-surface-container-high dark:hover:bg-dark-surface-2 hover:text-on-surface dark:hover:text-dark-text transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <button 
          title="Notifications"
          className="relative p-2 rounded-lg text-on-surface-variant dark:text-dark-text-muted hover:bg-surface-container-high dark:hover:bg-dark-surface-2 hover:text-on-surface dark:hover:text-dark-text transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
        </button>

        {/* User Avatar */}
        <img
          alt={user.name}
          onClick={() => setCurrentPath('settings')}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 cursor-pointer hover:ring-primary transition-all"
          src={user.avatar}
        />
      </div>
    </header>
  );
};
