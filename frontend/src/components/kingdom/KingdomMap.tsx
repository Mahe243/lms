import React, { useState } from 'react';
import {
  KnowledgeCitadelBuilding,
  AcademyBuilding,
  ArchiveTowerBuilding,
  ChallengeArenaBuilding,
  FocusSanctuaryBuilding,
  InnovationForgeBuilding,
  ObservatoryBuilding,
  HallOfAchievementsBuilding,
  type BuildingType,
} from './KingdomBuildings';
import { BuildingInfoDrawer, type BuildingDetail } from './BuildingInfoDrawer';
import { NovaCompanion } from './NovaCompanion';

export interface KingdomMapData {
  citadelLevel: number;
  citadelTier: number;
  totalXP: number;
  completedLessons: number;
  reviewedCards: number;
  completedQuizzes: number;
  focusMinutes: number;
  completedProjects: number;
  aiInteractions: number;
  earnedAchievements: number;
}

interface KingdomMapProps {
  data: KingdomMapData;
  onNavigate: (path: string) => void;
  isCalmMode?: boolean;
}

export const KingdomMap: React.FC<KingdomMapProps> = ({
  data,
  onNavigate,
  isCalmMode = false,
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDetail | null>(null);

  // Helper building metadata builder
  const getBuildingDetails = (type: BuildingType): BuildingDetail => {
    switch (type) {
      case 'citadel':
        return {
          type,
          title: 'Knowledge Citadel',
          subtitle: 'Kingdom Capital',
          description:
            'The crowning heart of your learning civilisation. Evolving with your cumulative XP and overall academic milestones.',
          level: data.citadelLevel,
          tier: data.citadelTier,
          progressPercent: ((data.totalXP % 500) / 500) * 100,
          currentStatLabel: 'Total Earned XP',
          currentStatValue: `${data.totalXP.toLocaleString()} XP`,
          nextMilestone: `Level ${data.citadelLevel + 1}`,
          targetPath: 'goals-and-progress',
          buttonLabel: 'View Mastery Matrix',
          accentColor: '#7869DE',
        };
      case 'academy': {
        const tier = Math.min(4, Math.max(1, Math.floor(data.completedLessons / 3) + 1));
        return {
          type,
          title: 'The Academy',
          subtitle: 'Courses & Curriculum',
          description:
            'Where structured understanding is forged. Expands as you master lessons, syllabus units, and lecture modules.',
          level: data.completedLessons + 1,
          tier,
          progressPercent: Math.min(100, ((data.completedLessons % 3) / 3) * 100),
          currentStatLabel: 'Lessons Completed',
          currentStatValue: `${data.completedLessons} Lessons`,
          nextMilestone: `${3 - (data.completedLessons % 3)} lessons to next tier`,
          targetPath: 'classroom',
          buttonLabel: 'Enter Classroom',
          accentColor: '#54CFE0',
        };
      }
      case 'archive': {
        const tier = Math.min(4, Math.max(1, Math.floor(data.reviewedCards / 20) + 1));
        return {
          type,
          title: 'Archive Tower',
          subtitle: 'Library & Memory Vault',
          description:
            'Houses your Second Brain documents, books, lecture notes, and FSRS spaced repetition flashcard decks.',
          level: Math.floor(data.reviewedCards / 10) + 1,
          tier,
          progressPercent: Math.min(100, ((data.reviewedCards % 20) / 20) * 100),
          currentStatLabel: 'Flashcards Reviewed',
          currentStatValue: `${data.reviewedCards} Reviews`,
          nextMilestone: `${20 - (data.reviewedCards % 20)} reviews to next tier`,
          targetPath: 'my-library',
          buttonLabel: 'Open Second Brain Vault',
          accentColor: '#F2BD58',
        };
      }
      case 'arena': {
        const tier = Math.min(4, Math.max(1, Math.floor(data.completedQuizzes / 2) + 1));
        return {
          type,
          title: 'Challenge Arena',
          subtitle: 'Practice & Diagnostic Suite',
          description:
            'Where concepts are tested under pressure through timed standard exams and interactive Kingdom Trials.',
          level: data.completedQuizzes + 1,
          tier,
          progressPercent: Math.min(100, ((data.completedQuizzes % 2) / 2) * 100),
          currentStatLabel: 'Quizzes Taken',
          currentStatValue: `${data.completedQuizzes} Attempts`,
          nextMilestone: `${2 - (data.completedQuizzes % 2)} tests to next tier`,
          targetPath: 'practice-arena',
          buttonLabel: 'Enter Practice Arena',
          accentColor: '#F27C76',
        };
      }
      case 'sanctuary': {
        const tier = Math.min(4, Math.max(1, Math.floor(data.focusMinutes / 60) + 1));
        return {
          type,
          title: 'Focus Sanctuary',
          subtitle: 'Deep Work & Timers',
          description:
            'A tranquil space protected from distraction. Develops as you log genuine, validated Pomodoro and deep work hours.',
          level: Math.floor(data.focusMinutes / 30) + 1,
          tier,
          progressPercent: Math.min(100, ((data.focusMinutes % 60) / 60) * 100),
          currentStatLabel: 'Focus Logged',
          currentStatValue: `${Math.round(data.focusMinutes)} mins`,
          nextMilestone: `${60 - (data.focusMinutes % 60)}m to next tier`,
          targetPath: 'study-room',
          buttonLabel: 'Enter Study Room',
          accentColor: '#58B995',
        };
      }
      case 'forge': {
        const tier = Math.min(4, Math.max(1, data.completedProjects + 1));
        return {
          type,
          title: 'Innovation Forge',
          subtitle: 'Capstone Projects & Code',
          description:
            'Translates theoretical mastery into production-grade multi-agent architectures, PRDs, and venture models.',
          level: data.completedProjects + 1,
          tier,
          progressPercent: Math.min(100, data.completedProjects * 50),
          currentStatLabel: 'Milestones Persisted',
          currentStatValue: `${data.completedProjects} Milestones`,
          nextMilestone: 'Complete next project capstone',
          targetPath: 'projects',
          buttonLabel: 'Launch Project Lab',
          accentColor: '#54CFE0',
        };
      }
      case 'observatory':
        return {
          type,
          title: 'Observatory of Wisdom',
          subtitle: 'The Knowledge Coach',
          description:
            'Your AI Professor and Socratic mentor. Clarifies complex doubts, provides conceptual hints, and drafts practice drills.',
          level: Math.floor(data.aiInteractions / 5) + 1,
          tier: Math.min(4, Math.floor(data.aiInteractions / 10) + 1),
          progressPercent: Math.min(100, ((data.aiInteractions % 10) / 10) * 100),
          currentStatLabel: 'AI Explorations',
          currentStatValue: `${data.aiInteractions} Prompts`,
          nextMilestone: 'Ask your coach for a concept breakdown',
          targetPath: 'ai-tutor',
          buttonLabel: 'Consult Knowledge Coach',
          accentColor: '#7869DE',
        };
      case 'hall':
      default:
        return {
          type,
          title: 'Hall of Achievements',
          subtitle: 'Goals, Milestones & Consistency',
          description:
            'Celebrates genuine learning discipline, habit streaks, 364-day consistency heatmaps, and earned accolades.',
          level: data.earnedAchievements + 1,
          tier: Math.min(4, Math.floor(data.earnedAchievements / 3) + 1),
          progressPercent: Math.min(100, ((data.earnedAchievements % 3) / 3) * 100),
          currentStatLabel: 'Trophies Unlocked',
          currentStatValue: `${data.earnedAchievements} Badges`,
          nextMilestone: 'Maintain 7-day study streak',
          targetPath: 'goals-and-progress',
          buttonLabel: 'Inspect Trophies',
          accentColor: '#F2BD58',
        };
    }
  };

  // If Calm Mode is enabled, render clean academic list/cards without heavy 3D scenery
  if (isCalmMode) {
    const buildings: BuildingType[] = [
      'citadel',
      'academy',
      'archive',
      'arena',
      'sanctuary',
      'forge',
      'observatory',
      'hall',
    ];

    return (
      <div className="w-full bg-white dark:bg-kingdom-navy-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-kingdom-emerald" />
              Academic Centres Overview (Calm Mode)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clean listing of learning infrastructure, metrics, and direct navigation links.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Level {data.citadelLevel} • {data.totalXP.toLocaleString()} XP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {buildings.map((bType) => {
            const b = getBuildingDetails(bType);
            return (
              <div
                key={bType}
                onClick={() => onNavigate(b.targetPath)}
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-kingdom-violet/40 dark:hover:border-kingdom-violet/40 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${b.accentColor}18`,
                        color: b.accentColor,
                      }}
                    >
                      Tier {b.tier}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Lvl {b.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-kingdom-violet transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {b.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {b.currentStatValue}
                  </span>
                  <span className="font-medium text-kingdom-violet flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Enter &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // GAME MODE: Interactive Isometric Knowledge Archipelago
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#F5F7FC] to-[#E3E8F5] dark:from-[#0D1322] dark:to-[#151D33] border border-slate-200/80 dark:border-slate-800 shadow-xl select-none">
      {/* Ambient Grid & Nebula Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#7869de15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Companion Mascot Anchor */}
      <div className="absolute top-5 left-5 z-20 hidden md:block">
        <NovaCompanion
          expression="happy"
          size="md"
          message={`Welcome back! Your kingdom holds ${data.totalXP.toLocaleString()} XP of genuine mastery.`}
        />
      </div>

      {/* Map Control Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/80 dark:bg-kingdom-navy/80 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
          Evergrowth Kingdom • Realm Level {data.citadelLevel}
        </span>
      </div>

      {/* Isometric Canvas Container */}
      <div className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center p-4 overflow-x-auto no-scrollbar">
        <div className="relative w-[860px] h-[580px] shrink-0">
          {/* Main Floating Island Base SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 860 580"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="islandSurface" x1="430" y1="120" x2="430" y2="460" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EAF0F9" />
                <stop offset="1" stopColor="#D5DEEE" />
              </linearGradient>
              <linearGradient id="islandRock" x1="430" y1="360" x2="430" y2="520" gradientUnits="userSpaceOnUse">
                <stop stopColor="#25324E" />
                <stop offset="1" stopColor="#111728" />
              </linearGradient>
              <linearGradient id="energyBridgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#7869DE" stopOpacity="0.4" />
                <stop offset="0.5" stopColor="#54CFE0" stopOpacity="0.8" />
                <stop offset="1" stopColor="#58B995" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Floating Island Cliff Strata */}
            <path
              d="M 120 280 L 430 460 L 740 280 L 740 330 L 430 520 L 120 330 Z"
              fill="url(#islandRock)"
              opacity="0.95"
            />

            {/* Central Top Green Plateau */}
            <polygon
              points="430,130 740,280 430,460 120,280"
              fill="url(#islandSurface)"
              stroke="#BAC8DE"
              strokeWidth="2"
            />

            {/* Cobblestone / Glowing Energy Paths linking to Citadel */}
            {/* North-West to Citadel */}
            <path d="M 230 200 Q 330 250 430 290" stroke="url(#energyBridgeGrad)" strokeWidth="4" strokeDasharray="6 4" />
            {/* North-East to Citadel */}
            <path d="M 630 200 Q 530 250 430 290" stroke="url(#energyBridgeGrad)" strokeWidth="4" strokeDasharray="6 4" />
            {/* South-West to Citadel */}
            <path d="M 230 380 Q 330 330 430 290" stroke="url(#energyBridgeGrad)" strokeWidth="4" strokeDasharray="6 4" />
            {/* South-East to Citadel */}
            <path d="M 630 380 Q 530 330 430 290" stroke="url(#energyBridgeGrad)" strokeWidth="4" strokeDasharray="6 4" />
            {/* Direct South to Citadel */}
            <path d="M 430 430 L 430 310" stroke="url(#energyBridgeGrad)" strokeWidth="4" strokeDasharray="6 4" />

            {/* Subtle Floating Orbiting Crystals */}
            <circle cx="80" cy="180" r="4" fill="#54CFE0" className="animate-kingdom-float" />
            <circle cx="780" cy="220" r="5" fill="#7869DE" className="animate-kingdom-float" />
            <circle cx="100" cy="400" r="3.5" fill="#F2BD58" className="animate-kingdom-float" />
            <circle cx="760" cy="420" r="4.5" fill="#58B995" className="animate-kingdom-float" />
          </svg>

          {/* 1. KNOWLEDGE CITADEL (Centre) */}
          <div className="absolute left-[340px] top-[170px] z-10">
            <KnowledgeCitadelBuilding
              level={data.citadelLevel}
              tier={data.citadelTier}
              isSelected={selectedBuilding?.type === 'citadel'}
              onClick={() => setSelectedBuilding(getBuildingDetails('citadel'))}
            />
          </div>

          {/* 2. THE ACADEMY (North-West) */}
          <div className="absolute left-[130px] top-[110px] z-10">
            <AcademyBuilding
              level={data.completedLessons + 1}
              tier={Math.min(4, Math.floor(data.completedLessons / 3) + 1)}
              isSelected={selectedBuilding?.type === 'academy'}
              onClick={() => setSelectedBuilding(getBuildingDetails('academy'))}
            />
          </div>

          {/* 3. ARCHIVE TOWER (North-East) */}
          <div className="absolute left-[590px] top-[100px] z-10">
            <ArchiveTowerBuilding
              level={Math.floor(data.reviewedCards / 10) + 1}
              isSelected={selectedBuilding?.type === 'archive'}
              onClick={() => setSelectedBuilding(getBuildingDetails('archive'))}
            />
          </div>

          {/* 4. CHALLENGE ARENA (East) */}
          <div className="absolute left-[620px] top-[240px] z-10">
            <ChallengeArenaBuilding
              level={data.completedQuizzes + 1}
              isSelected={selectedBuilding?.type === 'arena'}
              onClick={() => setSelectedBuilding(getBuildingDetails('arena'))}
            />
          </div>

          {/* 5. FOCUS SANCTUARY (South-East) */}
          <div className="absolute left-[540px] top-[340px] z-10">
            <FocusSanctuaryBuilding
              level={Math.floor(data.focusMinutes / 30) + 1}
              isSelected={selectedBuilding?.type === 'sanctuary'}
              onClick={() => setSelectedBuilding(getBuildingDetails('sanctuary'))}
            />
          </div>

          {/* 6. INNOVATION FORGE (South-West) */}
          <div className="absolute left-[160px] top-[330px] z-10">
            <InnovationForgeBuilding
              level={data.completedProjects + 1}
              isSelected={selectedBuilding?.type === 'forge'}
              onClick={() => setSelectedBuilding(getBuildingDetails('forge'))}
            />
          </div>

          {/* 7. OBSERVATORY OF WISDOM (West) */}
          <div className="absolute left-[100px] top-[210px] z-10">
            <ObservatoryBuilding
              level={Math.floor(data.aiInteractions / 5) + 1}
              isSelected={selectedBuilding?.type === 'observatory'}
              onClick={() => setSelectedBuilding(getBuildingDetails('observatory'))}
            />
          </div>

          {/* 8. HALL OF ACHIEVEMENTS (South) */}
          <div className="absolute left-[355px] top-[370px] z-10">
            <HallOfAchievementsBuilding
              level={data.earnedAchievements + 1}
              isSelected={selectedBuilding?.type === 'hall'}
              onClick={() => setSelectedBuilding(getBuildingDetails('hall'))}
            />
          </div>
        </div>
      </div>

      {/* Building Contextual Drawer / Bottom Sheet */}
      <BuildingInfoDrawer
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
