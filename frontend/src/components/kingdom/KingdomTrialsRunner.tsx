import React, { useState, useEffect, useCallback } from 'react';
import { quizzesApi, type QuestionResponse } from '../../api/quizzes';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface KingdomTrialsRunnerProps {
  questions: QuestionResponse[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

export const KingdomTrialsRunner: React.FC<KingdomTrialsRunnerProps> = ({
  questions,
  onComplete,
  onExit,
}) => {
  const { gameWallet, refreshWallet } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [runnerLane, setRunnerLane] = useState<0 | 1 | 2>(1); // 0: Left, 1: Center, 2: Right
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const currentQ = questions[currentIdx] || {
    id: 'q-demo',
    question_text: 'Which consensus protocol uses randomized election timeouts to prevent split votes?',
    options: ['Paxos', 'Raft Protocol', 'Two-Phase Commit (2PC)'],
    explanation: 'Raft uses randomized election timeouts to ensure only one candidate generally splits votes.',
  };

  // 3 choices corresponding to 3 lanes
  const laneOptions = currentQ.options.slice(0, 3);
  while (laneOptions.length < 3) {
    laneOptions.push(`Option ${laneOptions.length + 1}`);
  }

  // Handle Lane Movement
  const moveLane = useCallback((direction: 'left' | 'right') => {
    if (isValidating || feedback) return;
    setRunnerLane((prev) => {
      if (direction === 'left') return Math.max(0, prev - 1) as 0 | 1 | 2;
      return Math.min(2, prev + 1) as 0 | 1 | 2;
    });
  }, [isValidating, feedback]);

  // Handle Run through Lane Gate (Submit Answer)
  const handlePassGate = useCallback(async (selectedLaneIndex?: number) => {
    if (isValidating || feedback) return;
    const lane = selectedLaneIndex !== undefined ? selectedLaneIndex : runnerLane;
    setRunnerLane(lane as 0 | 1 | 2);

    const chosenAnswer = laneOptions[lane];
    setIsValidating(true);

    try {
      // Validate securely on the server without answer exposure
      const res = await quizzesApi.checkSingleAnswer(currentQ.id, chosenAnswer);
      const isCorrect = res.is_correct;
      setFeedback({ isCorrect, explanation: res.explanation || currentQ.explanation || '' });

      if (isCorrect) {
        setScore((s) => s + 1);
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
      } else {
        setLives((l) => Math.max(0, l - 1));
      }
    } catch {
      // Honest offline/local evaluation - NEVER fake win on lane 1
      let isCorrect = false;
      const qAny = currentQ as any;
      if (qAny.correct_answer !== undefined && qAny.correct_answer !== null) {
        isCorrect = String(qAny.correct_answer).trim().toLowerCase() === String(chosenAnswer).trim().toLowerCase();
      } else if (qAny.correctOptionIndex !== undefined) {
        isCorrect = qAny.correctOptionIndex === lane;
      } else {
        setFeedback({
          isCorrect: false,
          explanation: 'Could not connect to the Challenge Arena grading server. Please check your network and try again.',
        });
        setIsValidating(false);
        return;
      }
      setFeedback({ isCorrect, explanation: currentQ.explanation || (isCorrect ? 'Correct analysis!' : 'Incorrect choice.') });
      if (isCorrect) {
        setScore((s) => s + 1);
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
      } else {
        setLives((l) => Math.max(0, l - 1));
      }
    } finally {
      setIsValidating(false);
    }
  }, [currentQ, isValidating, feedback, laneOptions, runnerLane]);

  // Next Question or End
  const handleNext = () => {
    setFeedback(null);
    setHint(null);
    if (currentIdx + 1 >= questions.length || lives <= 0) {
      onComplete(score, questions.length);
    } else {
      setCurrentIdx((i) => i + 1);
      setRunnerLane(1); // reset to center lane
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        moveLane('left');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        moveLane('right');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (feedback) {
          handleNext();
        } else {
          handlePassGate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLane, handlePassGate, feedback]);

  // Request Socratic Hint (10 coins)
  const handleRequestHint = async () => {
    if (hintLoading || hint) return;
    if (gameWallet.coin_balance < 10) {
      alert('You need at least 10 coins for a Socratic Hint. Earn coins by completing lessons or flashcards!');
      return;
    }
    setHintLoading(true);
    try {
      const res = await quizzesApi.getSocraticHint(currentQ.id);
      setHint(res.hint);
      await refreshWallet();
    } catch {
      setHint('Focus on the randomized nature of election timeouts in state machine consensus.');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-950 text-white rounded-3xl p-6 border border-kingdom-violet/30 shadow-2xl flex flex-col gap-6 overflow-hidden select-none">
      {/* Top Status Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-kingdom-coral">
            Kingdom Trials Runner
          </span>
          <span className="text-xs font-mono text-slate-400">
            Node {currentIdx + 1} / {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Visual Lives */}
          <div className="flex items-center gap-1" title={`${lives} Lives Remaining`}>
            {[1, 2, 3].map((heart) => (
              <span
                key={heart}
                className={`text-lg transition-transform ${
                  heart <= lives ? 'text-red-500 scale-100' : 'text-slate-700 scale-90'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-kingdom-gold">
            <span>Score:</span>
            <span className="text-white text-sm">{score}</span>
          </div>

          <button
            onClick={onExit}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Exit Trials"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Question Header Card */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase text-kingdom-cyan font-bold tracking-wider">
            Checkpoint Challenge
          </span>
          <button
            onClick={handleRequestHint}
            disabled={hintLoading || !!hint}
            className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
              hint
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-kingdom-violet/20 hover:bg-kingdom-violet/30 text-kingdom-violet-light border border-kingdom-violet/40'
            }`}
            title="Socratic Hint costs 10 coins"
          >
            <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
            <span>{hint ? 'Hint Revealed' : 'Ask Socratic Hint (10 🪙)'}</span>
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {currentQ.question_text}
        </h2>

        {hint && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
            💡 <strong>Coach Clue:</strong> {hint}
          </div>
        )}
      </div>

      {/* 3-LANE RUNNER PERSPECTIVE TRACK */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-[#18213B] via-[#0E1528] to-[#0A0E1A] border border-kingdom-violet/20 overflow-hidden flex flex-col justify-between p-4">
        {/* Subtle Perspective Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#7869de20_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Lane Gate Options at the Top/Horizon */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-2">
          {laneOptions.map((opt, lIdx) => {
            const isRunnerTarget = runnerLane === lIdx;
            return (
              <div
                key={lIdx}
                onClick={() => handlePassGate(lIdx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-center flex flex-col justify-center min-h-[75px] ${
                  isRunnerTarget
                    ? 'bg-kingdom-violet/30 border-kingdom-cyan shadow-lg shadow-kingdom-cyan/20 scale-102 ring-1 ring-kingdom-cyan'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Lane {lIdx === 0 ? 'Left' : lIdx === 1 ? 'Center' : 'Right'}
                </span>
                <p className="text-xs font-bold text-white line-clamp-2">
                  {opt}
                </p>
              </div>
            );
          })}
        </div>

        {/* 3 Lane Track Roadways */}
        <div className="relative z-10 w-full flex-1 grid grid-cols-3 gap-3 my-2 items-end">
          {[0, 1, 2].map((laneIndex) => (
            <div
              key={laneIndex}
              onClick={() => handlePassGate(laneIndex)}
              className="relative h-full flex flex-col items-center justify-end border-x border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
            >
              {/* Runway Dash Marks */}
              <div className="absolute inset-y-0 w-0.5 border-l border-dashed border-white/15" />

              {/* Active Runner Sprite */}
              {runnerLane === laneIndex && (
                <div className="relative z-20 mb-2 transition-transform duration-200 transform animate-kingdom-float">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-kingdom-violet to-kingdom-cyan flex items-center justify-center text-white shadow-xl shadow-kingdom-cyan/30 border border-white/30">
                    <span className="material-symbols-outlined text-[28px]">
                      directions_run
                    </span>
                  </div>
                  <div className="w-10 h-2 bg-black/50 rounded-full mx-auto blur-xs mt-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Lane Control Arrows */}
        <div className="relative z-20 flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            onClick={() => moveLane('left')}
            disabled={runnerLane === 0}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold font-mono transition-all flex items-center gap-1"
          >
            <span>&larr; Left (A)</span>
          </button>

          <button
            onClick={() => handlePassGate()}
            disabled={isValidating}
            className="flex-1 py-2 rounded-xl bg-kingdom-cyan text-slate-950 text-xs font-extrabold shadow-md hover:bg-kingdom-cyan-light transition-all text-center"
          >
            {isValidating ? 'Grading...' : 'Enter Selected Gate (Enter / Space)'}
          </button>

          <button
            onClick={() => moveLane('right')}
            disabled={runnerLane === 2}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold font-mono transition-all flex items-center gap-1"
          >
            <span>Right (D) &rarr;</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK OVERLAY AFTER GATE PASS */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed flex flex-col gap-2 ${
            feedback.isCorrect
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/60 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">
              {feedback.isCorrect ? '✓ Gate Cleared! Correct Answer' : '✗ Obstacle Hit! Incorrect Option'}
            </span>
            <button
              onClick={handleNext}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs ${
                feedback.isCorrect ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Next Gate (Enter) &rarr;
            </button>
          </div>
          {feedback.explanation && (
            <p className="opacity-90">{feedback.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
};
