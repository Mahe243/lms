import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { mockExamData } from '../../data/mockData';
import { KingdomTrialsRunner } from '../kingdom/KingdomTrialsRunner';
import { quizzesApi, type QuestionResponse } from '../../api/quizzes';
import confetti from 'canvas-confetti';

export const PracticeArenaView: React.FC = () => {
  const { refreshWallet } = useApp();
  const [activeMode, setActiveMode] = useState<'standard' | 'trials'>('standard');
  const [examState, setExamState] = useState<'intro' | 'active' | 'evaluated' | 'trials_running'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    timeSpent: number;
  } | null>(null);

  const [loadedQuestions, setLoadedQuestions] = useState<QuestionResponse[]>([]);

  useEffect(() => {
    quizzesApi.listQuestions()
      .then((data) => {
        if (data && data.length > 0) {
          setLoadedQuestions(data);
        }
      })
      .catch(() => {});
  }, []);

  const fallbackQuestions = mockExamData.sections[0].questions;

  // Use loaded questions if available, else fallback
  const trialsQuestions: QuestionResponse[] = loadedQuestions.length > 0
    ? loadedQuestions
    : fallbackQuestions.map((q) => ({
        id: `q-${q.id}`,
        bank_id: 'bank-cs',
        question_type: 'mcq',
        question_text: q.text,
        options: q.options,
        numerical_tolerance: 0,
        explanation: q.explanation,
        difficulty: q.difficulty === 'Challenging' ? 'hard' : q.difficulty === 'Moderate' ? 'medium' : 'easy',
        tags: [q.topic],
      }));

  const questions = fallbackQuestions;
  const currentQ = questions[currentQuestionIdx];

  // Exam Timer Countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (examState === 'active' && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, secondsLeft]);

  const handleStartExam = () => {
    if (activeMode === 'trials') {
      setExamState('trials_running');
    } else {
      setExamState('active');
      setSecondsLeft(45 * 60);
      setAnswers({});
      setFlagged({});
      setCurrentQuestionIdx(0);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleFinishExam = async () => {
    setIsSubmitting(true);
    let correct = 0;
    const formattedResponses: Record<string, any> = {};

    questions.forEach((q) => {
      const userAnsIdx = answers[q.id];
      const isCorrect = userAnsIdx === q.correctAnswer;
      if (isCorrect) correct++;
      formattedResponses[`q-${q.id}`] = userAnsIdx !== undefined ? q.options[userAnsIdx] : null;
    });

    const pct = Math.round((correct / questions.length) * 100);
    const timeSpent = 45 * 60 - secondsLeft;

    setEvaluationResult({
      score: correct,
      total: questions.length,
      percentage: pct,
      timeSpent,
    });

    try {
      // Authoritative grading & reward submission on backend
      await quizzesApi.submitAttempt({
        quiz_title: 'Timed Diagnostic Evaluation Suite',
        mode: 'exam',
        responses: formattedResponses,
        time_spent_secs: timeSpent,
      });
      await refreshWallet();
    } catch {
      // Offline fallback
    } finally {
      setIsSubmitting(false);
      setExamState('evaluated');
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    }
  };

  const handleTrialsComplete = async (trialsScore: number, totalQ: number) => {
    const pct = Math.round((trialsScore / totalQ) * 100);
    setEvaluationResult({
      score: trialsScore,
      total: totalQ,
      percentage: pct,
      timeSpent: 120,
    });

    try {
      await quizzesApi.submitAttempt({
        quiz_title: 'Kingdom Trials 3-Lane Challenge',
        mode: 'practice',
        responses: {},
        time_spent_secs: 120,
      });
      await refreshWallet();
    } catch {
      // Offline fallback
    } finally {
      setExamState('evaluated');
      confetti({ particleCount: 90, spread: 65 });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* INTRO VIEW */}
      {examState === 'intro' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-kingdom-coral font-mono text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              <span>The Challenge Arena</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 dark:text-white">
              Evaluation & Practice Proving Grounds
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verify your mastery through strict timed diagnostic exams or train reflexes with Kingdom Trials.
            </p>
          </div>

          {/* Mode Switcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Standard Exam Mode Card */}
            <div
              onClick={() => setActiveMode('standard')}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeMode === 'standard'
                  ? 'border-kingdom-coral bg-kingdom-coral/5 shadow-md ring-1 ring-kingdom-coral/30'
                  : 'bg-white dark:bg-kingdom-navy-card border-slate-200 dark:border-slate-800 hover:border-kingdom-coral/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Standard Academic Mode
                  </span>
                  <span className="text-xs font-mono text-slate-400">45 Minutes • 5 Questions</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Full Timed Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Strict exam simulator with question flagging palette, countdown timer, and comprehensive post-exam rubrics. Authoritatively graded by backend.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-kingdom-coral">
                  {activeMode === 'standard' ? 'Selected Mode ✓' : 'Select Mode'}
                </span>
                <span className="text-xs font-mono font-bold text-kingdom-gold">+40 XP / +20 Coins</span>
              </div>
            </div>

            {/* Kingdom Trials Card */}
            <div
              onClick={() => setActiveMode('trials')}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeMode === 'trials'
                  ? 'border-kingdom-cyan bg-kingdom-cyan/5 shadow-md ring-1 ring-kingdom-cyan/30'
                  : 'bg-white dark:bg-kingdom-navy-card border-slate-200 dark:border-slate-800 hover:border-kingdom-cyan/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-kingdom-cyan/15 text-kingdom-cyan border border-kingdom-cyan/30">
                    Interactive Mini-Game
                  </span>
                  <span className="text-xs font-mono text-slate-400">3 Lanes • 3 Lives</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Kingdom Trials (Runner Mode)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fast-paced 3-lane knowledge runner. Steer your knowledge runner through correct answer gates with keyboard or touch, consult Socratic hints, and clear checkpoints.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-kingdom-cyan">
                  {activeMode === 'trials' ? 'Selected Mode ✓' : 'Select Mode'}
                </span>
                <span className="text-xs font-mono font-bold text-kingdom-gold">+40 XP / +20 Coins</span>
              </div>
            </div>
          </div>

          {/* Start Action */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleStartExam}
              className="px-8 py-3 rounded-xl bg-kingdom-coral hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-98"
            >
              {activeMode === 'trials' ? 'Launch Kingdom Trials' : 'Begin Standard Exam'}
            </button>
          </div>
        </div>
      )}

      {/* KINGDOM TRIALS ACTIVE VIEW */}
      {examState === 'trials_running' && (
        <KingdomTrialsRunner
          questions={trialsQuestions}
          onComplete={handleTrialsComplete}
          onExit={() => setExamState('intro')}
        />
      )}

      {/* STANDARD EXAM ACTIVE VIEW */}
      {examState === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Panel (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-kingdom-navy-card rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-500">
                  Question {currentQuestionIdx + 1} of {questions.length} • {currentQ.topic}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {flagged[currentQ.id] ? 'flag' : 'outlined_flag'}
                  </span>
                  <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                {currentQ.text}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-kingdom-coral bg-kingdom-coral/10 text-kingdom-coral font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-kingdom-coral text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-kingdom-coral text-[20px]">
                          check_circle
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-kingdom-violet text-white text-xs font-bold hover:bg-kingdom-violet-light transition-all"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExam}
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Submit & Evaluate'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Palette & Timer (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Countdown Card */}
            <div className="bg-white dark:bg-kingdom-navy-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Time Remaining
                </span>
                <span className="font-mono text-2xl font-extrabold text-kingdom-coral">
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <button
                onClick={handleFinishExam}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs"
              >
                End Exam
              </button>
            </div>

            {/* Question Palette */}
            <div className="bg-white dark:bg-kingdom-navy-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Question Palette
              </span>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged[q.id];
                  const isCurrent = idx === currentQuestionIdx;

                  let btnBg = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                  if (isCurrent) btnBg = 'ring-2 ring-kingdom-coral bg-kingdom-coral text-white font-bold';
                  else if (isFlagged) btnBg = 'bg-amber-100 text-amber-900 border border-amber-400 font-bold';
                  else if (isAnswered) btnBg = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 rounded-xl text-xs font-mono transition-all flex items-center justify-center ${btnBg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Answered ({Object.keys(answers).length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Flagged ({Object.values(flagged).filter(Boolean).length})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION REPORT VIEW */}
      {examState === 'evaluated' && evaluationResult && (
        <div className="flex flex-col gap-6">
          {/* Top Score Banner */}
          <div className="bg-white dark:bg-kingdom-navy-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center font-bold p-3">
                <span className="text-3xl font-mono leading-none">{evaluationResult.score}</span>
                <span className="text-[11px] text-slate-500 font-normal">/{evaluationResult.total} Correct</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">
                    Diagnostic Score: {evaluationResult.percentage}%
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                    VALIDATED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Time Spent: {Math.floor(evaluationResult.timeSpent / 60)}m {evaluationResult.timeSpent % 60}s • Results saved to your permanent learning record.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setExamState('intro')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                Back to Arena
              </button>
              <button
                onClick={handleStartExam}
                className="px-5 py-2 rounded-xl bg-kingdom-coral text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
              >
                Retake Session
              </button>
            </div>
          </div>

          {/* Solutions Breakdown */}
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
              Official Rubric & Conceptual Breakdown
            </h3>

            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border text-xs flex flex-col gap-3 ${
                    isCorrect
                      ? 'bg-white dark:bg-kingdom-navy-card border-emerald-500/30'
                      : 'bg-white dark:bg-kingdom-navy-card border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Question {idx + 1}: {isCorrect ? 'Correct (+40 XP)' : 'Missed'}
                      </span>
                      <span className="font-mono text-slate-400">{q.topic}</span>
                    </div>
                  </div>

                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {q.text}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-kingdom-navy-dark border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white block mb-1">Official Solution Rubric:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
