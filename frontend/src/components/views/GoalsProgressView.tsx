import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { activityApi, type AnalyticsResponse } from '../../api/activity';
import { gameApi, type AchievementResponse } from '../../api/game';
import { NovaCompanion } from '../kingdom/NovaCompanion';

export const GoalsProgressView: React.FC = () => {
  const { user, gameWallet, courses } = useApp();
  const [hoveredDay, setHoveredDay] = useState<{ day: number; hours: number; date: string } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'heatmap' | 'curriculum'>('achievements');

  useEffect(() => {
    activityApi.getAnalytics().then(setAnalytics).catch(() => {});
    gameApi.getAchievements().then(setAchievements).catch(() => {});
  }, []);

  // Generate 52 weeks x 7 days = 364 days heatmap based on real database analytics
  const generateHeatmap = () => {
    const days = [];
    for (let i = 0; i < 52 * 7; i++) {
      let hours = 0;
      let date = `Day ${i + 1}`;
      if (analytics?.heatmap && analytics.heatmap[i]) {
        hours = Number((analytics.heatmap[i].minutes / 60).toFixed(1));
        date = analytics.heatmap[i].date;
      }
      days.push({
        day: i,
        hours,
        date,
      });
    }
    return days;
  };

  const totalHoursLogged = analytics?.heatmap
    ? Number((analytics.heatmap.reduce((acc, curr) => acc + (curr.minutes || 0), 0) / 60).toFixed(1))
    : Number((analytics?.study_time_week_hours || 0).toFixed(1));

  const heatmapDays = generateHeatmap();

  const getHeatmapColor = (hours: number) => {
    if (hours === 0) return 'bg-surface-container dark:bg-dark-surface-2';
    if (hours < 1.0) return 'bg-kingdom-emerald/30';
    if (hours < 2.5) return 'bg-kingdom-emerald/60';
    if (hours < 4.0) return 'bg-kingdom-emerald/90';
    return 'bg-kingdom-emerald';
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div className="flex items-center gap-3">
          <NovaCompanion expression="celebrate" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
                The Hall of Achievements
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-kingdom-gold/15 text-kingdom-gold text-xs font-bold font-code-sm border border-kingdom-gold/30">
                CITADEL LEVEL {gameWallet.level || user.level}
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted mt-0.5">
              A permanent record of learning consistency, mastery milestones, unlocked trophies, and long-term deep work.
            </p>
          </div>
        </div>

        {/* Quick Kingdom Stats */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[22px]">local_fire_department</span>
            <div>
              <span className="font-code-sm text-sm font-bold text-on-surface dark:text-dark-text block leading-none">
                {(typeof gameWallet.streak_days === 'number' && gameWallet.streak_days > 0) ? gameWallet.streak_days : (user.streakDays || 1)} Days
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Active Streak</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-kingdom-violet text-[22px]">military_tech</span>
            <div>
              <span className="font-code-sm text-sm font-bold text-on-surface dark:text-dark-text block leading-none">
                {gameWallet.total_xp.toLocaleString()} XP
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Cumulative XP</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-kingdom-gold text-[22px]">monetization_on</span>
            <div>
              <span className="font-code-sm text-sm font-bold text-on-surface dark:text-dark-text block leading-none">
                {gameWallet.coin_balance} 🟡
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Cosmetic Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-2">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'bg-kingdom-gold text-kingdom-navy shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">emoji_events</span>
          <span>Earned Trophies ({achievements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'heatmap'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          <span>364-Day Consistency Heatmap</span>
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'curriculum'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          <span>Curriculum Mastery Tracks</span>
        </button>
      </div>

      {/* TAB 1: ACHIEVEMENTS TROPHY ROOM */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 bg-surface-container-lowest dark:bg-dark-surface border-kingdom-gold/50 shadow-md ring-1 ring-kingdom-gold/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{ach.badge_icon || '🏆'}</span>
                      <span className="text-[10px] font-bold font-code-sm uppercase px-2 py-0.5 rounded-full bg-kingdom-gold/20 text-kingdom-gold border border-kingdom-gold/30">
                        EARNED
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-on-surface dark:text-dark-text">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-surface-variant/30 text-xs">
                    <div className="flex justify-between font-code-sm text-[11px] text-on-surface-variant">
                      <span>Unlocked {new Date(ach.unlocked_at).toLocaleDateString()}</span>
                      <span className="font-bold text-kingdom-gold">+{ach.reward_coins} 🟡 +{ach.reward_xp} XP</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center rounded-2xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-xs text-on-surface-variant font-code-sm">
                No trophies unlocked yet. Complete lessons in the Academy, run trials in the Arena, or review flashcards along the Knowledge Trail to earn trophies!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 364-DAY DEEP WORK HEATMAP */}
      {activeTab === 'heatmap' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-kingdom-emerald text-[18px]">calendar_month</span>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
                Deep Work Consistency Matrix (Past 52 Weeks)
              </span>
            </div>
            <span className="text-xs font-code-sm text-on-surface-variant">
              {hoveredDay ? `${hoveredDay.date}: ${hoveredDay.hours} hours logged` : 'Hover squares to view hours'}
            </span>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto py-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[700px]">
              {heatmapDays.map((d) => (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3 h-3 rounded-xs ${getHeatmapColor(
                    d.hours
                  )} transition-all hover:ring-2 hover:ring-kingdom-emerald cursor-pointer`}
                ></div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-variant/30">
            <span>
              Total Deep Work:{' '}
              <strong>{totalHoursLogged} Hours Logged</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-surface-container"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-kingdom-emerald/30"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-kingdom-emerald/60"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-kingdom-emerald/90"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-kingdom-emerald"></span>
              <span>More</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM MASTERY TRACKS */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg animate-fadeIn">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-code-sm font-bold uppercase text-primary">
                    Track {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-code-sm text-kingdom-emerald font-bold">
                    {course.progress}% Mastery
                  </span>
                </div>
                <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface dark:text-dark-text">
                  {course.title}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 mt-4 text-xs font-medium">
                  <div className="flex justify-between">
                    <span>Curriculum Modules</span>
                    <span className="text-kingdom-emerald font-bold">
                      {course.completedModules} / {course.totalModules} Completed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Lesson</span>
                    <span className="text-primary font-bold truncate max-w-[180px]">
                      {course.currentLesson}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Faculty / Mentor</span>
                    <span className="text-on-surface-variant dark:text-dark-text-muted font-bold">
                      {course.instructor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
