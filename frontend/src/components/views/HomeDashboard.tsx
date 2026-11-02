import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { KingdomMap, type KingdomMapData } from '../kingdom/KingdomMap';
import { gameApi, type DailyMissionResponse } from '../../api/game';
import confetti from 'canvas-confetti';

export const HomeDashboard: React.FC = () => {
  const {
    user,
    activeCourseId,
    setCurrentPath,
    isCalmMode,
    toggleCalmMode,
    gameWallet,
    refreshWallet,
    flashcards,
  } = useApp();

  const [missions, setMissions] = useState<DailyMissionResponse[]>([]);
  const [kingdomStats, setKingdomStats] = useState<KingdomMapData>({
    citadelLevel: 1,
    citadelTier: 1,
    totalXP: 0,
    completedLessons: 0,
    reviewedCards: 0,
    completedQuizzes: 0,
    focusMinutes: 0,
    completedProjects: 0,
    aiInteractions: 0,
    earnedAchievements: 0,
  });
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Load backend profile, kingdom metrics, and today's daily missions
  const loadData = useCallback(async () => {
    try {
      const profile = await gameApi.getProfile();
      if (profile && profile.stats) {
        setKingdomStats({
          citadelLevel: profile.stats.citadel_level || 1,
          citadelTier: profile.stats.citadel_tier || 1,
          totalXP: profile.wallet.total_xp || 0,
          completedLessons: profile.stats.completed_lessons || 0,
          reviewedCards: profile.stats.reviewed_cards || 0,
          completedQuizzes: profile.stats.completed_quizzes || 0,
          focusMinutes: profile.stats.focus_minutes || 0,
          completedProjects: profile.stats.completed_projects || 0,
          aiInteractions: profile.stats.ai_interactions || 0,
          earnedAchievements: profile.stats.earned_achievements || 0,
        });
        setMissions(profile.missions || []);
      }
    } catch {
      // Fallback to local gameWallet & state if server starting up
      setKingdomStats((prev) => ({
        ...prev,
        citadelLevel: gameWallet.level,
        totalXP: gameWallet.total_xp,
      }));
    }
  }, [gameWallet.level, gameWallet.total_xp]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle claiming a completed daily mission
  const handleClaimMission = async (missionId: string) => {
    try {
      setClaimingId(missionId);
      await gameApi.claimMission(missionId);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      // Refresh wallet & missions
      await refreshWallet();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Could not claim mission');
    } finally {
      setClaimingId(null);
    }
  };

  // Determine intelligent "CONTINUE LEARNING" target
  const handleContinueLearning = () => {
    // 1. Incomplete lesson in active course
    if (activeCourseId) {
      setCurrentPath('classroom');
      return;
    }
    // 2. Due flashcards
    const dueCount = flashcards.filter((f) => f.nextReview === 'Tomorrow' || f.nextReview === 'Due now').length;
    if (dueCount > 0) {
      setCurrentPath('my-library');
      return;
    }
    // 3. Fallback to classroom
    setCurrentPath('classroom');
  };

  const isStarterKingdom = kingdomStats.totalXP === 0 && kingdomStats.completedLessons === 0;

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* TOP REALM BANNER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-kingdom-cyan animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              The Evergrowth Kingdom
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Welcome back,{' '}
            <span className="text-kingdom-violet italic font-semibold">
              {user.name.split(' ')[0]}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your civilisation flourishes with every concept mastered, chapter read, and focus session completed.
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleCalmMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
              isCalmMode
                ? 'bg-kingdom-emerald text-white border-kingdom-emerald shadow-emerald-500/20'
                : 'bg-white dark:bg-kingdom-navy-card text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-kingdom-violet'
            }`}
            title="Toggle between full Kingdom Map and Calm Academic Mode"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCalmMode ? 'menu_book' : 'castle'}
            </span>
            <span>{isCalmMode ? 'Calm Mode Active' : 'Game Mode'}</span>
          </button>

          <button
            onClick={handleContinueLearning}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-kingdom-violet hover:bg-kingdom-violet-light transition-all shadow-md shadow-kingdom-violet/30 flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>Continue Learning</span>
          </button>
        </div>
      </div>

      {/* STARTER ONBOARDING BANNER IF FRESH */}
      {isStarterKingdom && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-kingdom-violet/10 via-kingdom-cyan/10 to-transparent border border-kingdom-violet/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Your Evergrowth Outpost has been established!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Begin your first lecture in the Academy or log 15 minutes of deep work to advance your Knowledge Keep.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPath('classroom')}
            className="px-3 py-1.5 rounded-lg bg-kingdom-violet text-white text-xs font-bold whitespace-nowrap"
          >
            Start First Lesson &rarr;
          </button>
        </div>
      )}

      {/* HERO SECTION: INTERACTIVE KINGDOM MAP */}
      <section className="w-full">
        <KingdomMap
          data={kingdomStats}
          onNavigate={(path) => setCurrentPath(path as any)}
          isCalmMode={isCalmMode}
        />
      </section>

      {/* DASHBOARD SUPPORTING CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 & 2: DAILY MISSIONS */}
        <div className="lg:col-span-2 bg-white dark:bg-kingdom-navy-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-kingdom-gold text-[20px]">
                  flag
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Knowledge Missions
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Refreshes Daily
              </span>
            </div>

            {missions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Generating daily learning objectives...
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {missions.map((m) => {
                  const pct = Math.min(100, Math.round((m.current_value / m.target_value) * 100));
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {m.title}
                          </h4>
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {m.current_value} / {m.target_value}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {m.description}
                        </p>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-kingdom-emerald rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Reward & Claim Pill */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-kingdom-gold">
                          <span>+{m.reward_coins} Coins</span>
                          <span className="text-kingdom-violet">+{m.reward_xp} XP</span>
                        </div>

                        {m.is_claimed ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                            Claimed ✓
                          </span>
                        ) : m.is_completed ? (
                          <button
                            disabled={claimingId === m.id}
                            onClick={() => handleClaimMission(m.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-kingdom-emerald hover:bg-kingdom-emerald-light text-white shadow-sm transition-all active:scale-95"
                          >
                            {claimingId === m.id ? 'Claiming...' : 'Claim Reward'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: REAL LEARNING SUMMARY */}
        <div className="bg-white dark:bg-kingdom-navy-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Civilisation Metrics
              </h3>
              <span className="text-xs font-bold text-kingdom-violet">
                Level {kingdomStats.citadelLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                onClick={() => setCurrentPath('classroom')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-kingdom-cyan transition-all"
              >
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Lessons Done
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {kingdomStats.completedLessons}
                </span>
              </div>

              <div
                onClick={() => setCurrentPath('my-library')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-kingdom-gold transition-all"
              >
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Cards Recalled
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {kingdomStats.reviewedCards}
                </span>
              </div>

              <div
                onClick={() => setCurrentPath('study-room')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-kingdom-emerald transition-all"
              >
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Focus Logged
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {Math.round(kingdomStats.focusMinutes)}m
                </span>
              </div>

              <div
                onClick={() => setCurrentPath('practice-arena')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-kingdom-coral transition-all"
              >
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Quizzes Passed
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {kingdomStats.completedQuizzes}
                </span>
              </div>
            </div>

            {/* Quick Link to Kingdom Market */}
            <div
              onClick={() => setCurrentPath('market')}
              className="p-3 rounded-xl bg-gradient-to-r from-kingdom-violet/10 to-kingdom-gold/10 border border-kingdom-violet/20 hover:border-kingdom-violet transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-kingdom-gold text-[22px]">
                  storefront
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    The Kingdom Market
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Customise Citadel & Island skins
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-kingdom-violet group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
