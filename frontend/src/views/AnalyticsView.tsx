import React, { useState, useEffect } from 'react';
import {
  BarChart3, Flame, Clock, Award, HelpCircle,
  Calendar, CheckCircle2, TrendingUp, Info
} from 'lucide-react';
import { AnalyticsData, Course } from '../types';
import { api } from '../api';

interface AnalyticsViewProps {
  courses: Course[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ courses }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-xs text-neutral-400">Loading analytics data...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Learning Analytics & Insights</h2>
        <p className="text-xs text-neutral-500">
          Honest study statistics measured from actual focus timers, active tabs, and deliberate visits
        </p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Study Day Streak</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {data.streak_days} <span className="text-xs font-normal text-neutral-500">Days</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">≥15 mins active study required</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Study Time This Week</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {data.study_time_week_hours} <span className="text-xs font-normal text-neutral-500">Hours</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Deduplicated active time</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Platform Visits</span>
            <BarChart3 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {data.total_visits} <span className="text-xs font-normal text-neutral-500">Visits</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">30-min inactivity session rule</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Active Study Days</span>
            <Calendar size={16} className="text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {data.total_active_days} <span className="text-xs font-normal text-neutral-500">Days</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Distinct days with verified focus</p>
        </div>
      </div>

      {/* 90-Day Learning Heatmap */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            90-Day Learning Activity Heatmap
          </h3>
          <span className="text-[10px] text-neutral-400">Minutes Studied per Day</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {data.heatmap.map((d, i) => {
            const mins = d.minutes;
            const bgClass =
              mins === 0
                ? 'bg-neutral-100 dark:bg-neutral-800'
                : mins < 15
                ? 'bg-indigo-200 dark:bg-indigo-950'
                : mins < 45
                ? 'bg-indigo-400 dark:bg-indigo-800'
                : 'bg-indigo-600 dark:bg-indigo-500';

            return (
              <div
                key={i}
                title={`${d.date}: ${d.minutes} study minutes`}
                className={`w-3.5 h-3.5 rounded-xs ${bgClass} transition-colors cursor-pointer hover:ring-2 hover:ring-indigo-400`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end space-x-2 text-[10px] text-neutral-400 pt-2">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xs" />
          <div className="w-2.5 h-2.5 bg-indigo-200 dark:bg-indigo-950 rounded-xs" />
          <div className="w-2.5 h-2.5 bg-indigo-400 dark:bg-indigo-800 rounded-xs" />
          <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-xs" />
          <span>More</span>
        </div>
      </div>

      {/* Course Study Time Breakdown & Quiz Accuracy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Time Breakdown */}
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm">Study Time by Course</h3>
          {data.course_times.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No completed study sessions yet.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {data.course_times.map((ct) => (
                <div key={ct.course_id} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{ct.course_name}</span>
                    <span className="font-mono text-neutral-500">{ct.minutes} mins</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (ct.minutes / 180) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Accuracy Trends */}
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm">Recent Practice Quiz Accuracy</h3>
          {data.quiz_trend.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No completed quizzes yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {data.quiz_trend.map((qt, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">{qt.quiz_title}</span>
                    <span className="text-[10px] text-neutral-400">{qt.date}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${
                      qt.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {qt.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plain Language Metric Definitions */}
      <div className="bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 text-xs space-y-2 text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center space-x-1.5 font-bold text-neutral-800 dark:text-neutral-200">
          <Info size={14} />
          <span>Understanding Your Learning Metrics:</span>
        </div>
        <p className="leading-relaxed">
          • <strong>Platform Visits:</strong> Counted only after a fresh browser login or after at least 30 minutes of inactivity. Refreshing the tab within a session never inflates your visit count.
        </p>
        <p className="leading-relaxed">
          • <strong>Active Study Time:</strong> Background tabs and idle periods are excluded. When manual study sessions and automated heartbeats coincide, intervals are merged to prevent double counting.
        </p>
        <p className="leading-relaxed">
          • <strong>Study Streak:</strong> Requires a minimum of 15 verified active study minutes on a given day. Merely opening the application does not count as studying.
        </p>
      </div>
    </div>
  );
};
