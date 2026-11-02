import React from 'react';

export type BuildingType =
  | 'citadel'
  | 'academy'
  | 'archive'
  | 'arena'
  | 'sanctuary'
  | 'forge'
  | 'observatory'
  | 'hall';

export interface BuildingStateProps {
  level?: number;
  tier?: number; // 1 to 4
  isSelected?: boolean;
  isHovered?: boolean;
  className?: string;
  onClick?: () => void;
  accentSkin?: string;
}

// 1. KNOWLEDGE CITADEL (Central Castle / Crystal Spire)
export const KnowledgeCitadelBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  tier = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Knowledge Citadel - Level ${level}, Tier ${tier}`}
    >
      {/* Ground Aura */}
      <div
        className={`absolute -inset-4 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected
            ? 'bg-kingdom-violet/40 opacity-100'
            : 'bg-kingdom-violet/20 opacity-0 group-hover:opacity-80'
        }`}
      />

      <svg width="180" height="190" viewBox="0 0 180 190" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="citBaseGrad" x1="20" y1="120" x2="160" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2A385E" />
            <stop offset="1" stopColor="#141B2D" />
          </linearGradient>
          <linearGradient id="citRoofGrad" x1="90" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7869DE" />
            <stop offset="0.7" stopColor="#54CFE0" />
            <stop offset="1" stopColor="#3525CD" />
          </linearGradient>
          <linearGradient id="citSpireGrad" x1="90" y1="0" x2="90" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#54CFE0" />
            <stop offset="0.5" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#7869DE" />
          </linearGradient>
          <linearGradient id="citGoldTrim" x1="60" y1="70" x2="120" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAD387" />
            <stop offset="1" stopColor="#F2BD58" />
          </linearGradient>
        </defs>

        {/* Isometric Foundation Plinth */}
        <polygon points="90,175 160,140 90,105 20,140" fill="url(#citBaseGrad)" stroke="#4A5B87" strokeWidth="2" />
        <polygon points="20,140 90,175 90,185 20,150" fill="#111726" />
        <polygon points="90,175 160,140 160,150 90,185" fill="#1C263D" />

        {/* Outer Guard Bastions for Tier 2+ */}
        {tier >= 2 && (
          <>
            <polygon points="35,125 55,115 55,145 35,155" fill="#2E3C62" stroke="#5D73A6" strokeWidth="1.2" />
            <polygon points="55,115 75,125 75,155 55,145" fill="#1A2338" />
            <polygon points="55,95 35,115 75,115" fill="#7869DE" />

            <polygon points="125,115 145,125 145,155 125,145" fill="#1A2338" />
            <polygon points="105,125 125,115 125,145 105,155" fill="#2E3C62" stroke="#5D73A6" strokeWidth="1.2" />
            <polygon points="125,95 105,115 145,115" fill="#7869DE" />
          </>
        )}

        {/* Central Citadel Keep */}
        <polygon points="60,110 90,95 90,150 60,165" fill="#3A4C7A" stroke="#5C72A8" strokeWidth="1.5" />
        <polygon points="90,95 120,110 120,165 90,150" fill="#243152" stroke="#5C72A8" strokeWidth="1.5" />

        {/* Grand Archway Portal */}
        <path d="M 80 155 L 80 135 Q 90 125 100 135 L 100 155 Z" fill="#0D1322" stroke="#F2BD58" strokeWidth="1.6" />
        <circle cx="90" cy="138" r="4" fill="#54CFE0" className="animate-kingdom-glow" />

        {/* Tier 3 & 4 Extended Towers and Buttresses */}
        {tier >= 3 && (
          <>
            <polygon points="70,75 90,65 90,95 70,105" fill="#4B6096" />
            <polygon points="90,65 110,75 110,105 90,95" fill="#324168" />
            {/* Luminous Runes */}
            <line x1="78" y1="83" x2="84" y2="86" stroke="#54CFE0" strokeWidth="1.5" />
            <line x1="102" y1="83" x2="96" y2="86" stroke="#54CFE0" strokeWidth="1.5" />
          </>
        )}

        {/* Main Crystal Spire Tower */}
        <polygon points="75,55 90,30 105,55 90,68" fill="url(#citRoofGrad)" stroke="#54CFE0" strokeWidth="1.5" />
        <polygon points="90,30 105,55 90,68" fill="#3525CD" opacity="0.4" />

        {/* Tier 4 Crown & Floating Spire Shards */}
        {tier >= 4 ? (
          <>
            <polygon points="90,2 96,25 90,35 84,25" fill="url(#citSpireGrad)" className="animate-kingdom-float" />
            <polygon points="68,30 72,40 68,46 64,40" fill="#54CFE0" opacity="0.8" className="animate-kingdom-float" />
            <polygon points="112,30 116,40 112,46 108,40" fill="#54CFE0" opacity="0.8" className="animate-kingdom-float" />
            {/* Crown of Wisdom */}
            <circle cx="90" cy="20" r="16" stroke="url(#citGoldTrim)" strokeWidth="1.8" strokeDasharray="5 3" />
          </>
        ) : (
          <polygon points="90,8 95,28 90,36 85,28" fill="url(#citSpireGrad)" />
        )}

        {/* Level Banner Pill */}
        <g transform="translate(62, 168)">
          <rect width="56" height="18" rx="9" fill="#18213B" stroke="#7869DE" strokeWidth="1.5" />
          <text x="28" y="13" textAnchor="middle" fill="#F5F7FC" fontSize="10" fontWeight="bold" fontFamily="system-ui">
            LVL {level}
          </text>
        </g>
      </svg>
    </div>
  );
};

// 2. ACADEMY (Classroom & Courses)
export const AcademyBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  tier = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`The Academy - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-cyan/40 opacity-100' : 'bg-kingdom-cyan/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="acadDome" x1="75" y1="20" x2="75" y2="65" gradientUnits="userSpaceOnUse">
            <stop stopColor="#54CFE0" />
            <stop offset="1" stopColor="#2575CD" />
          </linearGradient>
        </defs>

        {/* Base Platform */}
        <polygon points="75,135 130,105 75,75 20,105" fill="#243447" stroke="#486585" strokeWidth="1.5" />
        <polygon points="20,105 75,135 75,142 20,112" fill="#141E2B" />
        <polygon points="75,135 130,105 130,112 75,142" fill="#1B2838" />

        {/* Pillars / Colonnade */}
        <rect x="42" y="70" width="6" height="35" rx="2" fill="#DCE5F2" />
        <rect x="60" y="65" width="6" height="35" rx="2" fill="#DCE5F2" />
        <rect x="84" y="65" width="6" height="35" rx="2" fill="#B3C4DE" />
        <rect x="102" y="70" width="6" height="35" rx="2" fill="#9CB2D4" />

        {/* Entablature & Pediment */}
        <polygon points="35,68 75,45 115,68" fill="#58B995" stroke="#7DE3BF" strokeWidth="1.2" />

        {/* Crystalline Dome */}
        <path d="M 55 48 C 55 30, 95 30, 95 48 Z" fill="url(#acadDome)" stroke="#54CFE0" strokeWidth="1.5" />

        {/* Knowledge Beacon atop Dome */}
        <polygon points="75,18 78,25 75,30 72,25" fill="#F2BD58" className="animate-kingdom-glow" />

        {/* Tier 2+ Courtyard Scrolls */}
        {tier >= 2 && (
          <ellipse cx="75" cy="100" rx="14" ry="7" fill="#7869DE" opacity="0.6" stroke="#9B8FF3" strokeWidth="1" />
        )}

        {/* Level Tag */}
        <g transform="translate(50, 126)">
          <rect width="50" height="16" rx="8" fill="#18213B" stroke="#54CFE0" strokeWidth="1.2" />
          <text x="25" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            ACADEMY
          </text>
        </g>
      </svg>
    </div>
  );
};

// 3. ARCHIVE TOWER (Library & Flashcards)
export const ArchiveTowerBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Archive Tower - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-gold/40 opacity-100' : 'bg-kingdom-gold/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="archTowerGrad" x1="50" y1="30" x2="90" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3E3466" />
            <stop offset="1" stopColor="#1E1933" />
          </linearGradient>
        </defs>

        {/* Hexagonal Base */}
        <polygon points="70,140 115,115 70,90 25,115" fill="#231E3D" stroke="#584C8A" strokeWidth="1.5" />
        <polygon points="25,115 70,140 70,148 25,123" fill="#131024" />
        <polygon points="70,140 115,115 115,123 70,148" fill="#1C1733" />

        {/* Slender Multi-Tier Library Tower */}
        <polygon points="50,60 70,50 70,115 50,125" fill="#4B3F7A" stroke="#6C5FA3" strokeWidth="1.2" />
        <polygon points="70,50 90,60 90,125 70,115" fill="#322A52" stroke="#6C5FA3" strokeWidth="1.2" />

        {/* Glowing Archive Windows / Book Ribbons */}
        <line x1="57" y1="75" x2="63" y2="78" stroke="#F2BD58" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="57" y1="90" x2="63" y2="93" stroke="#F2BD58" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="77" y1="78" x2="83" y2="75" stroke="#54CFE0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="77" y1="93" x2="83" y2="90" stroke="#54CFE0" strokeWidth="2.5" strokeLinecap="round" />

        {/* Levitating Memory Scroll Rings */}
        <ellipse
          cx="70"
          cy="48"
          rx="26"
          ry="10"
          stroke="#FAD387"
          strokeWidth="1.6"
          strokeDasharray="4 3"
          className="animate-kingdom-float"
        />

        {/* Conical Roof with Celestial Orb */}
        <polygon points="70,15 95,45 45,45" fill="#7869DE" stroke="#9B8FF3" strokeWidth="1.2" />
        <circle cx="70" cy="14" r="5" fill="#F2BD58" className="animate-kingdom-glow" />

        {/* Level Tag */}
        <g transform="translate(45, 134)">
          <rect width="50" height="16" rx="8" fill="#18213B" stroke="#F2BD58" strokeWidth="1.2" />
          <text x="25" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            ARCHIVE
          </text>
        </g>
      </svg>
    </div>
  );
};

// 4. CHALLENGE ARENA (Practice Arena & Quizzes)
export const ChallengeArenaBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Challenge Arena - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-coral/40 opacity-100' : 'bg-kingdom-coral/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Isometric Arena Circle Base */}
        <ellipse cx="75" cy="100" rx="58" ry="28" fill="#2E1C27" stroke="#7A3F5B" strokeWidth="1.8" />
        <ellipse cx="75" cy="97" rx="46" ry="21" fill="#472638" />

        {/* Inner Sand / Proving Circle */}
        <ellipse cx="75" cy="95" rx="34" ry="15" fill="#F2BD58" opacity="0.3" stroke="#F2BD58" strokeWidth="1.2" />

        {/* Energy Pillars around Colosseum */}
        <polygon points="35,70 41,67 41,92 35,95" fill="#F27C76" />
        <polygon points="115,70 109,67 109,92 115,95" fill="#F27C76" />
        <polygon points="52,55 58,52 58,78 52,81" fill="#54CFE0" />
        <polygon points="98,55 92,52 92,78 98,81" fill="#54CFE0" />

        {/* Floating Champion Crest */}
        <polygon points="75,40 85,55 75,70 65,55" fill="#F27C76" className="animate-kingdom-float" />
        <polygon points="75,45 81,55 75,65 69,55" fill="#FFFFFF" opacity="0.8" />

        {/* Level Tag */}
        <g transform="translate(50, 120)">
          <rect width="50" height="16" rx="8" fill="#18213B" stroke="#F27C76" strokeWidth="1.2" />
          <text x="25" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            ARENA
          </text>
        </g>
      </svg>
    </div>
  );
};

// 5. FOCUS SANCTUARY (Study Room & Pomodoro)
export const FocusSanctuaryBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Focus Sanctuary - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-emerald/40 opacity-100' : 'bg-kingdom-emerald/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Floating Garden Rock */}
        <path
          d="M 25 95 Q 75 80 125 95 Q 100 125 75 130 Q 50 125 25 95 Z"
          fill="#1C382F"
          stroke="#3C6E5E"
          strokeWidth="1.5"
        />

        {/* Tranquil Waterfall Cascade */}
        <path d="M 68 100 Q 75 110 75 135" stroke="#54CFE0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

        {/* Zen Pagoda Shrine */}
        <rect x="63" y="65" width="24" height="25" fill="#1A2D25" stroke="#58B995" strokeWidth="1.2" />
        {/* Pagoda Tiers */}
        <polygon points="50,65 75,50 100,65" fill="#58B995" stroke="#7DE3BF" strokeWidth="1.2" />
        <polygon points="58,50 75,38 92,50" fill="#3D856B" stroke="#7DE3BF" strokeWidth="1" />

        {/* Bonsai & Foliage */}
        <circle cx="45" cy="85" r="9" fill="#58B995" opacity="0.8" />
        <circle cx="105" cy="85" r="10" fill="#3D856B" opacity="0.8" />

        {/* Luminous Calm Lotus Light */}
        <circle cx="75" cy="32" r="4" fill="#54CFE0" className="animate-kingdom-glow" />

        {/* Level Tag */}
        <g transform="translate(45, 124)">
          <rect width="60" height="16" rx="8" fill="#18213B" stroke="#58B995" strokeWidth="1.2" />
          <text x="30" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            SANCTUARY
          </text>
        </g>
      </svg>
    </div>
  );
};

// 6. INNOVATION FORGE (Projects)
export const InnovationForgeBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Innovation Forge - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-cyan/40 opacity-100' : 'bg-kingdom-cyan/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Foundation */}
        <polygon points="75,135 125,108 75,80 25,108" fill="#243044" stroke="#4B6082" strokeWidth="1.5" />

        {/* High-Tech Industrial Lab Core */}
        <polygon points="50,80 75,68 75,115 50,127" fill="#334663" stroke="#54CFE0" strokeWidth="1" />
        <polygon points="75,68 100,80 100,127 75,115" fill="#202D40" stroke="#54CFE0" strokeWidth="1" />

        {/* Energy Conduits / Plasma Pipes */}
        <path d="M 40 100 L 50 90 L 75 100" stroke="#54CFE0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 110 100 L 100 90 L 75 100" stroke="#F2BD58" strokeWidth="2.5" strokeLinecap="round" />

        {/* Floating Alchemical Gears / Gyroscope */}
        <g transform="translate(75, 45)" className="animate-kingdom-float">
          <circle cx="0" cy="0" r="16" stroke="#54CFE0" strokeWidth="1.8" strokeDasharray="6 3" />
          <polygon points="0,-12 10,0 0,12 -10,0" fill="#7869DE" />
          <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
        </g>

        {/* Level Tag */}
        <g transform="translate(50, 124)">
          <rect width="50" height="16" rx="8" fill="#18213B" stroke="#54CFE0" strokeWidth="1.2" />
          <text x="25" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            FORGE
          </text>
        </g>
      </svg>
    </div>
  );
};

// 7. OBSERVATORY OF WISDOM (AI Tutor)
export const ObservatoryBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Observatory of Wisdom - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-violet/40 opacity-100' : 'bg-kingdom-violet/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base */}
        <polygon points="70,140 115,115 70,90 25,115" fill="#201E3B" stroke="#524A8A" strokeWidth="1.5" />

        {/* Tower Cylinder */}
        <path d="M 45 65 L 45 115 Q 70 128 95 115 L 95 65 Z" fill="#2E2857" stroke="#6C5FB0" strokeWidth="1.2" />

        {/* Rotating Celestial Dome */}
        <path d="M 42 65 C 42 35, 98 35, 98 65 Z" fill="#7869DE" stroke="#9B8FF3" strokeWidth="1.4" />

        {/* Magical Astronomical Telescope */}
        <line
          x1="62"
          y1="55"
          x2="95"
          y2="22"
          stroke="#F2BD58"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-kingdom-float"
        />
        <circle cx="95" cy="22" r="3.5" fill="#54CFE0" className="animate-kingdom-glow" />

        {/* Nebula Star Particles */}
        <circle cx="35" cy="40" r="1.5" fill="#FFFFFF" />
        <circle cx="105" cy="45" r="1.8" fill="#FAD387" />

        {/* Level Tag */}
        <g transform="translate(38, 130)">
          <rect width="64" height="16" rx="8" fill="#18213B" stroke="#7869DE" strokeWidth="1.2" />
          <text x="32" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            OBSERVATORY
          </text>
        </g>
      </svg>
    </div>
  );
};

// 8. HALL OF ACHIEVEMENTS (Goals & Progress)
export const HallOfAchievementsBuilding: React.FC<BuildingStateProps> = ({
  level = 1,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative cursor-pointer transition-transform duration-300 transform group ${
        isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1.5'
      }`}
      aria-label={`Hall of Achievements - Level ${level}`}
    >
      <div
        className={`absolute -inset-3 rounded-full blur-xl transition-opacity duration-500 ${
          isSelected ? 'bg-kingdom-gold/40 opacity-100' : 'bg-kingdom-gold/20 opacity-0 group-hover:opacity-75'
        }`}
      />

      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base */}
        <polygon points="75,135 125,108 75,80 25,108" fill="#3B3224" stroke="#8A7752" strokeWidth="1.5" />

        {/* Golden Triumphal Arch */}
        <path
          d="M 45 115 L 45 65 Q 75 45 105 65 L 105 115 L 88 108 L 88 80 Q 75 72 62 80 L 62 108 Z"
          fill="#524329"
          stroke="#F2BD58"
          strokeWidth="1.6"
        />

        {/* Laurel Star Medal / Trophy */}
        <g transform="translate(75, 45)" className="animate-kingdom-float">
          <circle cx="0" cy="0" r="12" fill="#F2BD58" stroke="#FFFFFF" strokeWidth="1.5" />
          <polygon points="0,-7 2,-2 7,-2 3,1 5,6 0,3 -5,6 -3,1 -7,-2 -2,-2" fill="#18213B" />
        </g>

        {/* Level Tag */}
        <g transform="translate(50, 122)">
          <rect width="50" height="16" rx="8" fill="#18213B" stroke="#F2BD58" strokeWidth="1.2" />
          <text x="25" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            TROPHIES
          </text>
        </g>
      </svg>
    </div>
  );
};
