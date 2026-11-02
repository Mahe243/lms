import React from 'react';
import type { BuildingType } from './KingdomBuildings';

export interface BuildingDetail {
  type: BuildingType;
  title: string;
  subtitle: string;
  description: string;
  level: number;
  tier: number;
  progressPercent: number;
  currentStatLabel: string;
  currentStatValue: string | number;
  nextMilestone: string;
  targetPath: string;
  buttonLabel: string;
  accentColor: string;
}

interface BuildingInfoDrawerProps {
  building: BuildingDetail | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const BuildingInfoDrawer: React.FC<BuildingInfoDrawerProps> = ({
  building,
  onClose,
  onNavigate,
}) => {
  if (!building) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-kingdom-navy/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-kingdom-navy-card rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-kingdom-navy/80 text-slate-900 dark:text-slate-100 transition-all transform animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: building.accentColor }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {building.subtitle} • Tier {building.tier}
              </span>
            </div>
            <h2 id="drawer-title" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {building.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          {building.description}
        </p>

        {/* Progression Card */}
        <div className="bg-slate-50 dark:bg-kingdom-navy-dark p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Building Level {building.level}
            </span>
            <span className="font-bold font-mono text-kingdom-violet">
              {Math.round(building.progressPercent)}% to Tier {Math.min(4, building.tier + 1)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, building.progressPercent))}%`,
                backgroundColor: building.accentColor,
              }}
            />
          </div>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                {building.currentStatLabel}
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {building.currentStatValue}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Next Milestone
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                {building.nextMilestone}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onClose();
            onNavigate(building.targetPath);
          }}
          className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99]"
          style={{ backgroundColor: building.accentColor }}
        >
          <span>{building.buttonLabel}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};
