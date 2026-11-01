import React from 'react';
import { useApp } from '../../context/AppContext';

export const HomeDashboard: React.FC = () => {
  const { user, courses, setCurrentPath, selectCourse, setIsFastRecallOpen, setIsUploadModalOpen } = useApp();

  const handleResumeCourse = (courseId: string) => {
    selectCourse(courseId);
  };

  return (
    <div className="relative w-full overflow-hidden px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-2xl">
      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-48 right-0 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

      {/* SECTION 1: EDITORIAL WELCOME & HERO BANNER */}
      <section className="relative flex flex-col gap-space-lg">
        {/* Breadcrumb Metadata / Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-dark-surface-2 text-on-surface-variant dark:text-dark-text font-code-sm text-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              FOCUS PROTOCOL ACTIVE
            </span>
            <span className="text-on-surface-variant font-code-sm text-code-sm">/</span>
            <span className="text-on-surface-variant dark:text-dark-text-muted font-code-sm text-code-sm uppercase tracking-wider">
              {user.program} '28
            </span>
          </div>
          <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant dark:text-dark-text-muted">
            <span>{user.term} • {user.week}</span>
            <span className="w-1 h-1 rounded-full bg-outline"></span>
            <span>SYNCED LIVE</span>
          </div>
        </div>

        {/* Editorial Typography Greeting */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="max-w-2xl">
            <p className="font-label-md text-label-md uppercase tracking-widest text-primary dark:text-inverse-primary font-semibold mb-space-2xs">
              Cognitive Momentum
            </p>
            <h1 className="font-headline-lg text-headline-lg lg:font-display-hero lg:text-display-hero text-on-surface dark:text-dark-text tracking-tight leading-none font-serif">
              Good evening, <span className="italic font-medium text-primary dark:text-inverse-primary">{user.name.split(' ')[0]}.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-dark-text-muted mt-space-2xs">
              Ready to compound your edge across Product, Markets, and Intelligence?
            </p>
          </div>

          {/* Quick Action Trigger Pill */}
          <div className="flex items-center gap-space-xs self-start lg:self-end">
            <button
              onClick={() => setIsFastRecallOpen(true)}
              className="px-space-md py-2 bg-surface-container-highest dark:bg-dark-surface-2 hover:bg-surface-container-high dark:hover:bg-dark-surface transition-all rounded-lg font-label-md text-label-md text-on-surface dark:text-dark-text flex items-center gap-space-xs shadow-sm border border-surface-variant/40 dark:border-dark-border"
            >
              <span className="material-symbols-outlined text-space-md text-primary dark:text-inverse-primary">bolt</span>
              <span>Fast Recall Log</span>
            </button>
          </div>
        </div>

        {/* Vital Performance Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
          {/* Metric 1: Streak */}
          <div 
            onClick={() => setCurrentPath('goals-and-progress')}
            className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-xl shadow-sm border border-surface-variant/40 dark:border-dark-border flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-dark-text-muted uppercase tracking-wider">
                Discipline
              </span>
              <span className="p-1.5 rounded-lg bg-secondary-fixed/50 dark:bg-secondary/30 text-secondary dark:text-secondary-fixed">
                <span className="material-symbols-outlined text-space-md">local_fire_department</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-dark-text">
                  {user.streakDays}
                </span>
                <span className="font-code-sm text-code-sm text-secondary dark:text-secondary-fixed font-medium">
                  Days Streak
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-dark-text-muted mt-1">
                Top {user.streakTopPercent}% cohort velocity
              </p>
            </div>
          </div>

          {/* Metric 2: Today's Deep Work Goal */}
          <div 
            onClick={() => setCurrentPath('study-room')}
            className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-xl shadow-sm border border-surface-variant/40 dark:border-dark-border flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-dark-text-muted uppercase tracking-wider">
                Deep Work
              </span>
              <span className="p-1.5 rounded-lg bg-tertiary-fixed/60 dark:bg-tertiary/30 text-tertiary dark:text-tertiary-fixed">
                <span className="material-symbols-outlined text-space-md">schedule</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-dark-text">
                  {user.deepWorkHoursToday}
                  <span className="text-outline font-normal dark:text-dark-text-muted">/{user.deepWorkTargetToday}</span>
                </span>
                <span className="font-code-sm text-code-sm text-tertiary dark:text-tertiary-fixed font-medium">
                  Hours
                </span>
              </div>
              <div className="w-full bg-surface-container-high dark:bg-dark-surface-2 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-tertiary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (user.deepWorkHoursToday / user.deepWorkTargetToday) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Metric 3: Weekly XP */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-xl shadow-sm border border-surface-variant/40 dark:border-dark-border flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-dark-text-muted uppercase tracking-wider">
                Knowledge Yield
              </span>
              <span className="p-1.5 rounded-lg bg-primary-fixed dark:bg-primary/20 text-primary dark:text-inverse-primary">
                <span className="material-symbols-outlined text-space-md">energy_savings_leaf</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-dark-text">
                  {user.weeklyXP.toLocaleString()}
                </span>
                <span className="font-code-sm text-code-sm text-primary dark:text-inverse-primary font-medium">
                  XP
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-dark-text-muted mt-1">
                +18% over last week
              </p>
            </div>
          </div>

          {/* Metric 4: Retained Nodes */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-xl shadow-sm border border-surface-variant/40 dark:border-dark-border flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-dark-text-muted uppercase tracking-wider">
                Retained Nodes
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container-highest dark:bg-dark-surface-2 text-on-surface dark:text-dark-text">
                <span className="material-symbols-outlined text-space-md">fact_check</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-dark-text">
                  {user.retainedNodes}
                </span>
                <span className="font-code-sm text-code-sm text-on-surface-variant dark:text-dark-text-muted font-medium">
                  Modules
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-dark-text-muted mt-1">
                94% recall benchmark
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Hero Card: Apple Precision meets Academic Gravitas */}
        <div className="relative bg-gradient-to-br from-[#1c1b19] to-[#282724] text-white rounded-2xl p-space-lg lg:p-space-xl overflow-hidden shadow-xl border border-white/10 mt-space-xs">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary-container/20 blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-space-lg opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[160px] leading-none">memory</span>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="max-w-xl flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-white font-code-sm text-xs font-semibold uppercase tracking-wider">
                  Active Sprint
                </span>
                <span className="text-white/60 font-code-sm text-xs">CS-742 • Module 03</span>
              </div>
              <h2 className="font-headline-md text-2xl lg:text-3xl font-serif font-bold text-white leading-snug">
                Latency Optimization in Enterprise RAG Pipelines
              </h2>
              <p className="font-body-md text-white/80 text-sm line-clamp-2">
                Hybrid Search Architecture: Blending Keyword Precision with Semantic Context. Unpack BM25 + Reciprocal Rank Fusion at enterprise scale.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs font-code-sm text-white/70">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">schedule</span>
                  12m remaining
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
                  4 of 6 modules completed (68%)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm self-start lg:self-center">
              <button
                onClick={() => handleResumeCourse('ai-pm-llm')}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/30 transition-all cursor-pointer group"
              >
                <span>Resume Learning</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-label-md text-sm font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Upload Resources</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TODAY'S FOCUS PROTOCOL */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
              Today's Focus Protocol
            </h3>
            <p className="font-body-sm text-sm text-on-surface-variant dark:text-dark-text-muted">
              Curated intellectual priorities based on your mastery decay curve and upcoming milestones.
            </p>
          </div>
          <button 
            onClick={() => setCurrentPath('study-room')}
            className="font-label-sm text-xs font-bold text-primary dark:text-inverse-primary hover:underline flex items-center gap-1"
          >
            <span>Start Deep Focus Block</span>
            <span className="material-symbols-outlined text-[16px]">timer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {courses.slice(1, 4).map((course, idx) => (
            <div
              key={course.id}
              onClick={() => handleResumeCourse(course.id)}
              className="bg-surface-container-lowest dark:bg-dark-surface rounded-xl p-space-md border border-surface-variant/50 dark:border-dark-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-code-sm font-bold uppercase px-2 py-0.5 rounded-full ${
                    course.track === 'Finance'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  }`}>
                    {course.track} • {course.code}
                  </span>
                  <span className="font-code-sm text-xs text-on-surface-variant dark:text-dark-text-muted">
                    0{idx + 1}
                  </span>
                </div>

                <h4 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text group-hover:text-primary dark:group-hover:text-inverse-primary transition-colors line-clamp-2">
                  {course.title}
                </h4>

                <p className="font-body-sm text-xs text-on-surface-variant dark:text-dark-text-muted mt-2 line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-surface-variant/30 dark:border-dark-border flex items-center justify-between text-xs">
                <span className="font-code-sm text-on-surface-variant dark:text-dark-text-muted">
                  {course.timeLeft}
                </span>
                <span className="text-primary dark:text-inverse-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>Enter</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: QUICK CAPSTONE & PRACTICE ARENA ENTRY */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Practice Arena Teaser */}
        <div 
          onClick={() => setCurrentPath('practice-arena')}
          className="bg-surface-container-low dark:bg-dark-surface-2 p-space-lg rounded-xl border border-surface-variant/50 dark:border-dark-border flex flex-col justify-between cursor-pointer hover:border-primary/40 transition-all group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary dark:text-inverse-primary">
              <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              <span className="font-label-sm text-xs uppercase tracking-wider font-bold">Practice Arena</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface dark:text-dark-text group-hover:text-primary transition-colors">
              RBI Grade B Phase II — Economic & Social Issues Mock #04
            </h3>
            <p className="font-body-sm text-sm text-on-surface-variant dark:text-dark-text-muted mt-1">
              Test your recall on Flexible Inflation Targeting, Black-Scholes Greeks, and distributed consensus mechanisms under exam pressure.
            </p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-variant/40 dark:border-dark-border text-xs">
            <span className="font-code-sm text-on-surface-variant dark:text-dark-text-muted">45 mins • 15 questions</span>
            <span className="font-bold text-primary dark:text-inverse-primary flex items-center gap-1">
              Take Diagnostic Test
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Project Capstone Teaser */}
        <div 
          onClick={() => setCurrentPath('projects')}
          className="bg-surface-container-low dark:bg-dark-surface-2 p-space-lg rounded-xl border border-surface-variant/50 dark:border-dark-border flex flex-col justify-between cursor-pointer hover:border-primary/40 transition-all group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
              <span className="font-label-sm text-xs uppercase tracking-wider font-bold">Capstone Project</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface dark:text-dark-text group-hover:text-amber-600 transition-colors">
              FinTech Multi-Agent Underwriting & Risk Engine
            </h3>
            <p className="font-body-sm text-sm text-on-surface-variant dark:text-dark-text-muted mt-1">
              Live Python engine sandbox with interactive multi-agent consensus, Cornish-Fisher VaR calculations, and enterprise PRD.
            </p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-variant/40 dark:border-dark-border text-xs">
            <span className="font-code-sm text-emerald-600 dark:text-emerald-400 font-bold">82% Completed • Active Sandbox</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Launch Sandbox
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
