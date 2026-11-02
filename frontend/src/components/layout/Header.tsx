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
    isSoundEnabled,
    toggleSound,
    isCalmMode,
    toggleCalmMode,
    gameWallet,
    theme,
    toggleTheme,
    setIsFastRecallOpen,
  } = useApp();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentLevel = gameWallet.level || user.level || 1;
  const currentXP = gameWallet.total_xp ?? user.weeklyXP ?? 0;
  const coins = gameWallet.coin_balance ?? user.coins ?? 0;
  const streak = (typeof gameWallet.streak_days === 'number' && gameWallet.streak_days > 0) ? gameWallet.streak_days : (user.streakDays || 1);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/90 dark:bg-kingdom-navy/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 z-30 flex items-center justify-between px-4 sm:px-6 select-none transition-colors">
      {/* LEFT: KINGDOM EMBLEM & PROGRESS */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Kingdom Level Badge */}
        <div
          onClick={() => setCurrentPath('goals-and-progress')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-kingdom-violet/15 to-kingdom-cyan/15 border border-kingdom-violet/30 cursor-pointer hover:border-kingdom-violet transition-all group"
          title={`Level ${currentLevel} • Total XP: ${currentXP.toLocaleString()}`}
        >
          <div className="w-5 h-5 rounded-md bg-kingdom-violet text-white font-black text-[11px] flex items-center justify-center shadow-xs">
            {currentLevel}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 leading-none">
              Citadel
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono leading-none mt-0.5">
              {currentXP.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Coin Balance */}
        <div
          onClick={() => setCurrentPath('market')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-kingdom-gold/10 border border-kingdom-gold/30 cursor-pointer hover:border-kingdom-gold transition-all"
          title="Kingdom Coins (Customise your realm in the Market)"
        >
          <span className="material-symbols-outlined text-kingdom-gold text-[17px]">
            monetization_on
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
            {coins.toLocaleString()}
          </span>
        </div>

        {/* Daily Streak */}
        <div
          onClick={() => setCurrentPath('goals-and-progress')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:border-amber-500 transition-all"
          title={`${streak} Days Consecutive Learning Streak`}
        >
          <span className="material-symbols-outlined text-amber-500 text-[17px]">
            local_fire_department
          </span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
            {streak}d
          </span>
        </div>
      </div>

      {/* RIGHT: FOCUS TIMER, CALM/GAME MODE, SOUND, THEME, PROFILE */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Soundscape Indicator if playing */}
        {activeSoundscape !== 'none' && (
          <button
            onClick={() => setSoundscape('none')}
            title="Stop soundscape"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kingdom-violet/10 text-kingdom-violet border border-kingdom-violet/30 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[15px] animate-spin">graphic_eq</span>
            <span>Audio Active</span>
            <span className="material-symbols-outlined text-[13px]">close</span>
          </button>
        )}

        {/* Global Focus Timer Capsule */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-kingdom-navy-dark px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setCurrentPath('study-room')}
            title="Open Focus Sanctuary"
            className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-kingdom-violet transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[17px] ${
                timerRunning ? 'text-kingdom-emerald animate-spin' : 'text-slate-400'
              }`}
            >
              timer
            </span>
            <span className="font-mono text-xs font-bold tracking-tight">
              {formatTimer(timerSeconds)}
            </span>
          </button>
          <button
            onClick={toggleTimer}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ml-1 ${
              timerRunning
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-kingdom-violet text-white hover:bg-kingdom-violet-light'
            }`}
          >
            {timerRunning ? 'Pause' : 'Focus'}
          </button>
        </div>

        {/* Fast Recall Trigger */}
        <button
          onClick={() => setIsFastRecallOpen(true)}
          title="Quick Recall Log"
          className="hidden xl:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-kingdom-violet text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-kingdom-gold">bolt</span>
          <span>Fast Recall</span>
        </button>

        {/* Sound Toggle (OFF by default) */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? 'Sound is ON (Click to Mute)' : 'Sound is OFF (Click to Enable)'}
          className={`p-2 rounded-xl border transition-all ${
            isSoundEnabled
              ? 'bg-kingdom-violet/10 text-kingdom-violet border-kingdom-violet/30'
              : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Sound Toggle"
        >
          <span className="material-symbols-outlined text-[19px]">
            {isSoundEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Calm Mode Toggle Button */}
        <button
          onClick={toggleCalmMode}
          title={isCalmMode ? 'Switch to Game Mode' : 'Switch to Calm Academic Mode'}
          className={`p-2 rounded-xl border transition-all ${
            isCalmMode
              ? 'bg-kingdom-emerald/10 text-kingdom-emerald border-kingdom-emerald/30'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Calm Mode Toggle"
        >
          <span className="material-symbols-outlined text-[19px]">
            {isCalmMode ? 'menu_book' : 'castle'}
          </span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Theme"
        >
          <span className="material-symbols-outlined text-[19px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* User Profile Avatar */}
        <img
          alt={user.name}
          onClick={() => setCurrentPath('settings')}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-kingdom-violet/30 hover:ring-kingdom-violet cursor-pointer transition-all ml-1"
          src={user.avatar}
        />
      </div>
    </header>
  );
};
