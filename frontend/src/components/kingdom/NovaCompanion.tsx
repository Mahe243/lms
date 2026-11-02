import React from 'react';

export type NovaExpression = 'idle' | 'happy' | 'thinking' | 'celebrate' | 'focused';

interface NovaCompanionProps {
  expression?: NovaExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
  onClick?: () => void;
}

export const NovaCompanion: React.FC<NovaCompanionProps> = ({
  expression = 'idle',
  size = 'md',
  message,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { w: 36, h: 36, viewBox: '0 0 64 64' },
    md: { w: 56, h: 56, viewBox: '0 0 64 64' },
    lg: { w: 84, h: 84, viewBox: '0 0 64 64' },
    xl: { w: 120, h: 120, viewBox: '0 0 64 64' },
  };

  const { w, h, viewBox } = sizeMap[size];

  // Render original facial expressions using vector paths
  const renderFace = () => {
    switch (expression) {
      case 'happy':
        return (
          <>
            {/* Joyful arched eyes */}
            <path d="M 22 28 Q 26 23 30 28" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 34 28 Q 38 23 42 28" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Happy open smile */}
            <path d="M 28 35 Q 32 40 36 35 Z" fill="#FFFFFF" />
            {/* Blushing cheeks */}
            <circle cx="21" cy="32" r="2.5" fill="#F27C76" opacity="0.7" />
            <circle cx="43" cy="32" r="2.5" fill="#F27C76" opacity="0.7" />
          </>
        );
      case 'celebrate':
        return (
          <>
            {/* Star sparkle eyes */}
            <path d="M 26 24 L 27 28 L 30 29 L 27 30 L 26 34 L 25 30 L 22 29 L 25 28 Z" fill="#F2BD58" />
            <path d="M 38 24 L 39 28 L 42 29 L 39 30 L 38 34 L 37 30 L 34 29 L 37 28 Z" fill="#F2BD58" />
            {/* Enthusiastic smile */}
            <path d="M 27 36 Q 32 42 37 36" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <circle cx="20" cy="33" r="3" fill="#F27C76" opacity="0.8" />
            <circle cx="44" cy="33" r="3" fill="#F27C76" opacity="0.8" />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Curious raised brow and tilted gaze */}
            <circle cx="25" cy="27" r="3.2" fill="#FFFFFF" />
            <circle cx="26" cy="26" r="1.2" fill="#18213B" />
            <circle cx="39" cy="27" r="3.2" fill="#FFFFFF" />
            <circle cx="40" cy="26" r="1.2" fill="#18213B" />
            {/* Puzzled small mouth */}
            <ellipse cx="32" cy="36" rx="2.2" ry="3.2" fill="#FFFFFF" />
          </>
        );
      case 'focused':
        return (
          <>
            {/* Determined visor line eyes */}
            <line x1="21" y1="28" x2="29" y2="28" stroke="#54CFE0" strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="28" x2="43" y2="28" stroke="#54CFE0" strokeWidth="3" strokeLinecap="round" />
            {/* Resolute tiny grin */}
            <path d="M 29 35 Q 32 37 35 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );
      case 'idle':
      default:
        return (
          <>
            {/* Friendly wide luminous eyes */}
            <circle cx="25" cy="27" r="3.6" fill="#FFFFFF" />
            <circle cx="26" cy="26" r="1.4" fill="#54CFE0" />
            <circle cx="39" cy="27" r="3.6" fill="#FFFFFF" />
            <circle cx="40" cy="26" r="1.4" fill="#54CFE0" />
            {/* Friendly gentle mouth */}
            <path d="M 28 35 Q 32 38 36 35" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <circle cx="21" cy="32" r="2" fill="#F27C76" opacity="0.5" />
            <circle cx="43" cy="32" r="2" fill="#F27C76" opacity="0.5" />
          </>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={`Nova the Knowledge Companion (${expression} mood)`}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative animate-kingdom-float">
        {/* Glow halo behind Nova */}
        <div className="absolute inset-0 rounded-full bg-kingdom-cyan/30 blur-md pointer-events-none" />

        <svg
          width={w}
          height={h}
          viewBox={viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-md"
        >
          {/* Subtle drop shadow underneath */}
          <ellipse cx="32" cy="58" rx="14" ry="4" fill="rgba(24, 33, 59, 0.25)" />

          {/* Floating Orbit Rings */}
          <ellipse
            cx="32"
            cy="32"
            rx="27"
            ry="11"
            stroke="url(#novaRingGrad)"
            strokeWidth="1.6"
            strokeDasharray="4 3"
            transform="rotate(-15 32 32)"
            opacity="0.8"
          />

          {/* Orbit Satellite Particle */}
          <circle cx="10" cy="24" r="2.2" fill="#F2BD58" className="animate-kingdom-pulse" />

          {/* Nova Sprite Body (Original Crystalline Teardrop / Orb) */}
          <path
            d="M 32 10 
               C 46 10, 52 24, 52 36 
               C 52 48, 44 54, 32 54 
               C 20 54, 12 48, 12 36 
               C 12 24, 18 10, 32 10 Z"
            fill="url(#novaBodyGrad)"
          />

          {/* Inner Light Core Sheen */}
          <path
            d="M 32 13 
               C 42 13, 48 24, 48 34 
               C 48 42, 42 48, 32 48 
               C 22 48, 16 42, 16 34 
               C 16 24, 22 13, 32 13 Z"
            fill="url(#novaCoreGrad)"
            opacity="0.9"
          />

          {/* Knowledge Antenna / Crystal Crest */}
          <path d="M 32 10 L 32 4" stroke="#7869DE" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="32,1 35,5 32,9 29,5" fill="#54CFE0" />

          {/* Tiny Cute Little Floating Wings */}
          <path
            d="M 12 34 C 4 32, 2 38, 6 42 C 9 44, 13 40, 14 36 Z"
            fill="#85E4F2"
            opacity="0.8"
          />
          <path
            d="M 52 34 C 60 32, 62 38, 58 42 C 55 44, 51 40, 50 36 Z"
            fill="#85E4F2"
            opacity="0.8"
          />

          {/* Dynamic Facial Features */}
          {renderFace()}

          {/* Gradients */}
          <defs>
            <linearGradient id="novaBodyGrad" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7869DE" />
              <stop offset="0.6" stopColor="#54CFE0" />
              <stop offset="1" stopColor="#58B995" />
            </linearGradient>
            <linearGradient id="novaCoreGrad" x1="16" y1="13" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9B8FF3" />
              <stop offset="0.5" stopColor="#18213B" />
              <stop offset="1" stopColor="#0E1426" />
            </linearGradient>
            <linearGradient id="novaRingGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54CFE0" />
              <stop offset="0.5" stopColor="#F2BD58" />
              <stop offset="1" stopColor="#7869DE" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {message && (
        <div className="relative bg-white dark:bg-kingdom-navy-card px-3.5 py-2 rounded-2xl shadow-sm border border-kingdom-violet/20 text-xs font-medium text-slate-800 dark:text-slate-100 max-w-xs">
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-kingdom-navy-card rotate-45 border-l border-b border-kingdom-violet/20" />
          <p className="relative z-10 leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
};
