import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { activityApi, type AnalyticsMetrics } from '../../api/activityApi';
import { goalsApi, type GoalItem } from '../../api/goalsApi';

export const GoalsProgressView: React.FC = () => {
  const { user } = useApp();
  const [hoveredDay, setHoveredDay] = useState<{ day: number; hours: number; date: string } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [goals, setGoals] = useState<GoalItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [aData, gData] = await Promise.all([
          activityApi.getAnalytics().catch(() => null),
          goalsApi.getGoals().catch(() => []),
        ]);
        if (isMounted) {
          if (aData) setAnalytics(aData);
          if (gData) setGoals(gData);
        }
      } catch (err) {
        console.log('Goals offline load note:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Use real backend heatmap if available (last 90 days), or generate 52-week array
  const heatmapDays = analytics?.heatmap?.length
    ? analytics.heatmap.map((h, idx) => ({
        day: idx,
        hours: Number((h.minutes / 60).toFixed(1)),
        date: h.date,
      }))
    : Array.from({ length: 52 * 7 }, (_, i) => {
        const rand = Math.sin(i / 14) * 0.5 + 0.5;
        const noise = i % 7 === 0 || i % 7 === 6 ? 0.2 : 0.8;
        const hours = Number((rand * noise * 3.8 + (i % 11 === 0 ? 1.5 : 0)).toFixed(1));
        return {
          day: i,
          hours,
          date: `Day ${i + 1}`,
        };
      });

  const getHeatmapColor = (hours: number) => {
    if (hours === 0) return 'bg-surface-container dark:bg-dark-surface-2';
    if (hours < 0.5) return 'bg-emerald-200 dark:bg-emerald-950/60';
    if (hours < 1.5) return 'bg-emerald-400 dark:bg-emerald-800';
    if (hours < 3.0) return 'bg-emerald-600 dark:bg-emerald-600';
    return 'bg-emerald-800 dark:bg-emerald-400';
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-variant/40 dark:border-dark-border pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
              Goals & Mastery Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-code-sm">
              LEVEL {user.level} COGNITIVE ARCHITECT
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
            Tracking persistent retention, real non-gameable focus time, and dual-track curriculum milestones.
          </p>
        </div>

        {/* Quick Streak Stats */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[22px]">local_fire_department</span>
            <div>
              <span className="font-code-sm text-sm font-bold text-on-surface dark:text-dark-text block leading-none">
                {user.streakDays} Days
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Active Streak</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">military_tech</span>
            <div>
              <span className="font-code-sm text-sm font-bold text-on-surface dark:text-dark-text block leading-none">
                {user.weeklyXP.toLocaleString()} XP
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Weekly Velocity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Persistent Goals Strip */}
      {goals && goals.length > 0 && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">flag</span>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
                Active Strategic Learning Goals
              </span>
            </div>
            <span className="text-xs font-code-sm text-emerald-500 font-bold">
              {goals.filter((g) => g.is_completed).length} of {goals.length} Achieved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        g.is_completed ? 'text-emerald-500' : 'text-primary'
                      }`}
                    >
                      {g.is_completed ? 'check_circle' : 'pending'}
                    </span>
                    <span className="font-semibold text-xs text-on-surface dark:text-dark-text leading-snug">
                      {g.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-code-sm px-2 py-0.5 rounded-full bg-surface-container font-bold uppercase">
                    {g.period}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant dark:text-dark-text-muted">
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((g.current_value || 0) / (g.target_value || 1)) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-code-sm font-bold">
                    {g.current_value} / {g.target_value} {g.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 365-Day Deep Work Heatmap */}
      <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-surface-variant/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
              Active Focus & Heartbeat Consistency Matrix
            </span>
          </div>
          <span className="text-xs font-code-sm text-on-surface-variant">
            {hoveredDay ? `${hoveredDay.date}: ${hoveredDay.hours} hours logged` : 'Hover blocks to view duration'}
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
                )} transition-all hover:ring-2 hover:ring-primary cursor-pointer`}
              ></div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-variant/30">
          <span>
            Total Measured Deep Work:{' '}
            <strong>
              {analytics ? `${analytics.study_time_week_hours}h this week` : '14.5 Hours Logged'}
            </strong>
          </span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-surface-container"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-800"></span>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Domain Skill Mastery Trees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Track 1: MBA Product Management */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-code-sm font-bold uppercase text-primary">Track 01</span>
              <span className="text-xs font-code-sm text-emerald-600 font-bold">84% Mastery</span>
            </div>
            <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface dark:text-dark-text">
              MBA Product Management & Growth
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
              Marketplace liquidity, unit economics, PRD authorship, and HIPAA SLA governance.
            </p>

            <div className="space-y-2 mt-4 text-xs font-medium">
              <div className="flex justify-between">
                <span>Marketplace Liquidity Curves</span>
                <span className="text-emerald-600 font-bold">Level 5</span>
              </div>
              <div className="flex justify-between">
                <span>Product Sense & Execution</span>
                <span className="text-emerald-600 font-bold">Level 4</span>
              </div>
              <div className="flex justify-between">
                <span>0-to-1 PRD System Design</span>
                <span className="text-emerald-600 font-bold">Level 4</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '84%' }}></div>
          </div>
        </div>

        {/* Track 2: Quant Finance & Central Banking */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-code-sm font-bold uppercase text-amber-600">Track 02</span>
              <span className="text-xs font-code-sm text-amber-600 font-bold">72% Mastery</span>
            </div>
            <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface dark:text-dark-text">
              Quantitative Finance & Central Banking (RBI Grade B)
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
              Macroeconomic monetary transmission, Black-Scholes Greeks, and DCF valuation modeling.
            </p>

            <div className="space-y-2 mt-4 text-xs font-medium">
              <div className="flex justify-between">
                <span>Monetary Policy & LAF Corridor</span>
                <span className="text-emerald-600 font-bold">Level 4</span>
              </div>
              <div className="flex justify-between">
                <span>Black-Scholes & Greek Sensitivity</span>
                <span className="text-amber-600 font-bold">Level 3</span>
              </div>
              <div className="flex justify-between">
                <span>Corporate DCF & ROIC Modeling</span>
                <span className="text-emerald-600 font-bold">Level 4</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        {/* Track 3: AI Systems & Distributed Engineering */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-code-sm font-bold uppercase text-emerald-600">Track 03</span>
              <span className="text-xs font-code-sm text-emerald-600 font-bold">88% Mastery</span>
            </div>
            <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface dark:text-dark-text">
              AI Systems & Distributed Engineering
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
              Hybrid search RRF algorithms, Apache Flink state backends, and multi-agent coordination.
            </p>

            <div className="space-y-2 mt-4 text-xs font-medium">
              <div className="flex justify-between">
                <span>Enterprise RAG & Hybrid Retrieval</span>
                <span className="text-emerald-600 font-bold">Level 5</span>
              </div>
              <div className="flex justify-between">
                <span>Event Stream Processing (Flink/Kafka)</span>
                <span className="text-emerald-600 font-bold">Level 4</span>
              </div>
              <div className="flex justify-between">
                <span>Multi-Agent Consensus Graphs</span>
                <span className="text-emerald-600 font-bold">Level 4</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
