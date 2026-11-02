import React, { useState, useEffect } from 'react';
import { flashcardsApi } from '../../api/flashcards';
import { NovaCompanion } from './NovaCompanion';
import type { Flashcard } from '../../types';

interface KnowledgeTrailRunnerProps {
  cards: Flashcard[];
  onFinish?: () => void;
  onRefreshWallet?: () => void;
}

export const KnowledgeTrailRunner: React.FC<KnowledgeTrailRunnerProps> = ({
  cards,
  onFinish,
  onRefreshWallet,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewsHistory, setReviewsHistory] = useState<Array<{ id: string; rating: number; front: string }>>([]);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    setStartTime(Date.now());
    setIsFlipped(false);
  }, [currentIndex]);

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard || isSubmitting) return;
    setIsSubmitting(true);
    const elapsedMs = Date.now() - startTime;

    // Calculate combo
    let nextCombo = combo;
    if (rating >= 3) {
      nextCombo += 1;
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
    } else {
      nextCombo = 0;
    }
    setCombo(nextCombo);

    // Track reviews
    setReviewsHistory((prev) => [
      ...prev,
      { id: currentCard.id, rating, front: currentCard.front },
    ]);

    try {
      // Backend authoritative review submission & rewards
      const res = await flashcardsApi.reviewCard(currentCard.id, rating, elapsedMs);
      if (res && (res as any).reward && (res as any).reward.success) {
        setEarnedXp((prev) => prev + ((res as any).reward.awarded_xp || 0));
        setEarnedCoins((prev) => prev + ((res as any).reward.awarded_coins || 0));
      }
      if (onRefreshWallet) onRefreshWallet();
    } catch {
      // If card is offline or local fallback, still trigger wallet sync
      if (onRefreshWallet) onRefreshWallet();
    } finally {
      setIsSubmitting(false);
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  // Keyboard navigation: Space to flip, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped && ['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const rating = parseInt(e.code.replace('Digit', '')) as 1 | 2 | 3 | 4;
        handleRate(rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, isFinished, isSubmitting, combo]);

  if (isFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-surface-container-lowest dark:bg-dark-surface border border-kingdom-gold/40 shadow-2xl text-center space-y-6 animate-fadeIn">
        <div className="flex justify-center">
          <NovaCompanion expression="celebrate" size="lg" message="Archive Trail Conquered!" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-kingdom-gold font-code-sm">
            Archive Trail Expedition Complete
          </span>
          <h2 className="text-2xl font-bold font-serif text-on-surface dark:text-dark-text">
            Knowledge Crystal Absorbed!
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-dark-text-muted max-w-md mx-auto">
            You reviewed all {cards.length} cards along the Archive Tower's Knowledge Trail with a peak combo of {maxCombo}x.
          </p>
        </div>

        {/* Rewards summary */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant">XP Earned</span>
            <span className="text-xl font-bold text-kingdom-violet">+{earnedXp} XP</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant">Coins Minted</span>
            <span className="text-xl font-bold text-kingdom-gold">+{earnedCoins} 🟡</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant">Peak Combo</span>
            <span className="text-xl font-bold text-kingdom-cyan">{maxCombo}x Flow</span>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="flex justify-center gap-4 text-xs font-code-sm">
          <span className="text-red-500 font-bold">
            Again: {reviewsHistory.filter((r) => r.rating === 1).length}
          </span>
          <span className="text-amber-500 font-bold">
            Hard: {reviewsHistory.filter((r) => r.rating === 2).length}
          </span>
          <span className="text-blue-500 font-bold">
            Good: {reviewsHistory.filter((r) => r.rating === 3).length}
          </span>
          <span className="text-emerald-500 font-bold">
            Easy: {reviewsHistory.filter((r) => r.rating === 4).length}
          </span>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFinished(false);
              setCombo(0);
              setReviewsHistory([]);
            }}
            className="px-6 py-2.5 rounded-xl border border-surface-variant text-xs font-bold text-on-surface dark:text-dark-text hover:bg-surface-container transition-all"
          >
            Review Trail Again
          </button>
          {onFinish && (
            <button
              onClick={onFinish}
              className="px-6 py-2.5 rounded-xl bg-kingdom-gold text-kingdom-navy text-xs font-bold shadow-md hover:bg-kingdom-gold/90 transition-all"
            >
              Back to Archive Vault
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Knowledge Trail Header & Progress Stepping Stones */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-dark-surface border border-surface-variant/40 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-code-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-kingdom-cyan animate-pulse"></span>
            <span className="font-bold text-kingdom-cyan uppercase tracking-wider">
              Archive Knowledge Trail
            </span>
          </div>
          <div className="flex items-center gap-3">
            {combo > 1 && (
              <span className="px-2.5 py-0.5 rounded-full bg-kingdom-cyan/15 text-kingdom-cyan text-[11px] font-bold border border-kingdom-cyan/30 animate-kingdom-pulse">
                🔥 {combo}x Synergy
              </span>
            )}
            <span className="text-on-surface-variant">
              Waypoint {currentIndex + 1} of {cards.length}
            </span>
          </div>
        </div>

        {/* Trail Stepping Stones UI */}
        <div className="relative flex items-center justify-between px-2 pt-2">
          {/* Connector Path Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-surface-container-high dark:bg-dark-border rounded-full z-0">
            <div
              className="h-full bg-gradient-to-r from-kingdom-cyan to-kingdom-violet rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / Math.max(1, cards.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Individual Waypoint Nodes */}
          {cards.map((c, i) => {
            const isPassed = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div
                key={c.id || i}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-kingdom-cyan text-kingdom-navy ring-4 ring-kingdom-cyan/30 scale-110 shadow-md'
                      : isPassed
                      ? 'bg-kingdom-emerald text-white'
                      : 'bg-surface-container-high dark:bg-dark-surface-2 text-on-surface-variant/60'
                  }`}
                >
                  {isPassed ? '✓' : i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Trail Card Surface */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[340px] rounded-3xl bg-surface-container-lowest dark:bg-dark-surface border-2 border-surface-variant/60 dark:border-dark-border p-8 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all relative select-none group"
      >
        <div className="flex items-center justify-between text-xs font-code-sm text-on-surface-variant">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary font-bold uppercase">
            {currentCard?.category || 'General Knowledge'}
          </span>
          <span className="text-[11px] flex items-center gap-1 group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[15px]">sync_alt</span>
            <span>{isFlipped ? 'Revealed' : 'Click card or press Space to reveal'}</span>
          </span>
        </div>

        {/* Card Content Area */}
        <div className="my-auto py-8 text-center px-4">
          <p
            className={`font-serif leading-relaxed text-on-surface dark:text-dark-text whitespace-pre-line ${
              isFlipped ? 'text-sm md:text-base font-normal text-left md:text-center' : 'text-lg md:text-2xl font-bold'
            }`}
          >
            {isFlipped ? currentCard?.back : currentCard?.front}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-code-sm text-on-surface-variant/70 border-t border-surface-variant/30 pt-3">
          <span>Reviewed {currentCard?.reviewCount || 0} times</span>
          <span className="text-kingdom-violet font-semibold">
            {isFlipped ? 'Select memory retention rate below' : 'Flip to inspect insight'}
          </span>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-3 w-full animate-fadeIn">
          <button
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(1);
            }}
            className="py-3.5 px-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold transition-all flex flex-col items-center cursor-pointer shadow-sm active:scale-95"
          >
            <span className="font-bold flex items-center gap-1">
              <span>Again</span>
              <span className="text-[10px] opacity-60">(1)</span>
            </span>
            <span className="text-[10px] opacity-75 mt-0.5">&lt; 1 min</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(2);
            }}
            className="py-3.5 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex flex-col items-center cursor-pointer shadow-sm active:scale-95"
          >
            <span className="font-bold flex items-center gap-1">
              <span>Hard</span>
              <span className="text-[10px] opacity-60">(2)</span>
            </span>
            <span className="text-[10px] opacity-75 mt-0.5">1 day</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(3);
            }}
            className="py-3.5 px-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold transition-all flex flex-col items-center cursor-pointer shadow-sm active:scale-95"
          >
            <span className="font-bold flex items-center gap-1">
              <span>Good</span>
              <span className="text-[10px] opacity-60">(3)</span>
            </span>
            <span className="text-[10px] opacity-75 mt-0.5">3 days</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(4);
            }}
            className="py-3.5 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex flex-col items-center cursor-pointer shadow-sm active:scale-95"
          >
            <span className="font-bold flex items-center gap-1">
              <span>Easy</span>
              <span className="text-[10px] opacity-60">(4)</span>
            </span>
            <span className="text-[10px] opacity-75 mt-0.5">7 days</span>
          </button>
        </div>
      ) : (
        <div className="p-3 text-center rounded-2xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-xs text-on-surface-variant">
          Press <kbd className="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px] border border-surface-variant">Space</kbd> or click the card to flip and activate memory evaluation.
        </div>
      )}
    </div>
  );
};
