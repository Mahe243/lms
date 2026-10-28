import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Flame, Heart, RefreshCw, Zap } from 'lucide-react';
import {
  triggerFirecrackerCelebration,
  triggerChristmasCelebration,
  startAmbientStudySound,
  stopAmbientStudySound,
  getCurrentStudySound
} from '../utils/audioCelebration';
import { FestiveTheme } from './FestiveBackground';

interface LoveToStudyBannerProps {
  theme: FestiveTheme;
  streakDays: number;
}

const INSPIRATIONAL_STUDY_QUOTES = [
  {
    quote: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
    vibe: "Spark of Curiosity"
  },
  {
    quote: "Fall in love with the process of becoming who you want to be. Every concept mastered is a superpower unlocked.",
    author: "Daily Motivation",
    vibe: "Power & Growth"
  },
  {
    quote: "Study not to pass an exam, but to understand the world and craft your own future.",
    author: "Learner's Creed",
    vibe: "Purpose & Vision"
  },
  {
    quote: "Curiosity is an ember; when you feed it with focus, it bursts into brilliant fireworks of understanding.",
    author: "Festive Wisdom",
    vibe: "Festival of Knowledge"
  },
  {
    quote: "Small consistent daily efforts create astronomical long-term leaps. Celebrate every little insight!",
    author: "Spaced Growth",
    vibe: "Consistency"
  }
];

export const LoveToStudyBanner: React.FC<LoveToStudyBannerProps> = ({ theme, streakDays }) => {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * INSPIRATIONAL_STUDY_QUOTES.length));
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);
  const [studyMood, setStudyMood] = useState<'curious' | 'energized' | 'calm' | 'unstoppable'>('curious');

  useEffect(() => {
    setActiveSound(getCurrentStudySound());
  }, []);

  const handleNextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % INSPIRATIONAL_STUDY_QUOTES.length);
  };

  const handleCelebration = () => {
    if (theme === 'christmas') {
      triggerChristmasCelebration();
    } else {
      triggerFirecrackerCelebration();
    }
  };

  const handleToggleSound = (type: 'lofi' | 'rain' | 'fire') => {
    if (activeSound === type) {
      stopAmbientStudySound();
      setActiveSound(null);
    } else {
      startAmbientStudySound(type);
      setActiveSound(type);
    }
  };

  const current = INSPIRATIONAL_STUDY_QUOTES[quoteIdx];

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 shadow-md border ${
      theme === 'diwali'
        ? 'bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-rose-950/80 border-amber-500/30 text-white backdrop-blur-xl'
        : theme === 'christmas'
        ? 'bg-gradient-to-r from-emerald-950/80 via-neutral-900/80 to-red-950/80 border-emerald-500/30 text-white backdrop-blur-xl'
        : theme === 'cosmic'
        ? 'bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900/80 border-indigo-500/30 text-white backdrop-blur-xl'
        : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 border-indigo-700/50 text-white'
    }`}>
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-40 h-40 bg-rose-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Study Love Quote & Affirmation */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles size={12} className="animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
              <span>{theme === 'diwali' ? 'Diwali Festival of Knowledge' : theme === 'christmas' ? 'Holiday Joy of Learning' : 'Spark of Learning'}</span>
            </span>
            <span className="text-xs text-neutral-300/80 font-medium">
              &bull; {current.vibe}
            </span>
          </div>

          <p className="text-base sm:text-lg font-medium tracking-tight text-white/95 italic leading-snug">
            "{current.quote}"
          </p>

          <div className="flex items-center space-x-4 text-xs text-neutral-300/80">
            <span>&mdash; {current.author}</span>
            <button
              onClick={handleNextQuote}
              className="inline-flex items-center space-x-1 text-xs text-amber-300 hover:text-amber-200 transition font-medium hover:underline"
              title="Show another study inspiration"
            >
              <RefreshCw size={11} />
              <span>New Affirmation</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Celebrations & Ambient Focus Audio */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Firecracker Burst Celebration Button */}
          <button
            onClick={handleCelebration}
            className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg active:scale-95 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white border border-amber-300/40"
            title="Burst celebratory festive firecrackers!"
          >
            <span className="text-sm group-hover:scale-125 transition-transform">
              {theme === 'diwali' ? '🪔 🎆' : theme === 'christmas' ? '🎄 ✨' : '🚀 💫'}
            </span>
            <span>{theme === 'diwali' ? 'Burst Firecrackers!' : 'Celebrate Learning!'}</span>
          </button>

          {/* Ambient Study Beats / Focus Sounds */}
          <div className="relative">
            <button
              onClick={() => setSoundMenuOpen(!soundMenuOpen)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                activeSound
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-200 shadow-sm'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
              }`}
              title="Listen to soothing background study sounds"
            >
              {activeSound ? (
                <>
                  <Volume2 size={14} className="text-amber-400 animate-pulse" />
                  <span className="capitalize">{activeSound === 'lofi' ? 'Lofi Alpha' : activeSound === 'rain' ? 'Rain' : 'Hearth'}</span>
                </>
              ) : (
                <>
                  <VolumeX size={14} className="text-neutral-400" />
                  <span>Study Sounds</span>
                </>
              )}
            </button>

            {/* Sound menu dropdown */}
            {soundMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-2 shadow-2xl z-30 backdrop-blur-xl text-xs space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Ambient Study Vibes
                </div>
                <button
                  onClick={() => { handleToggleSound('lofi'); setSoundMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    activeSound === 'lofi' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <span>🎧 Lofi Alpha Waves</span>
                  {activeSound === 'lofi' && <Zap size={12} />}
                </button>
                <button
                  onClick={() => { handleToggleSound('rain'); setSoundMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    activeSound === 'rain' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <span>🌧️ Gentle Study Rain</span>
                  {activeSound === 'rain' && <Zap size={12} />}
                </button>
                <button
                  onClick={() => { handleToggleSound('fire'); setSoundMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    activeSound === 'fire' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <span>🔥 Cozy Hearthfire</span>
                  {activeSound === 'fire' && <Zap size={12} />}
                </button>

                {activeSound && (
                  <button
                    onClick={() => { stopAmbientStudySound(); setActiveSound(null); setSoundMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 border-t border-neutral-800 mt-1"
                  >
                    ⏹️ Stop Ambient Sound
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
