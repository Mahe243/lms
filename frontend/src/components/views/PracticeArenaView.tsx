import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { mockExamData } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { quizzesApi } from '../../api';

interface ExamQuestion {
  id: string | number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty?: string;
}

export const PracticeArenaView: React.FC = () => {
  const { user, updateUser, setCurrentPath } = useApp();
  const [examState, setExamState] = useState<'intro' | 'active' | 'evaluated'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, number>>({});
  const [flagged, setFlagged] = useState<Record<string | number, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);

  // Question state loaded from backend or mock fallback
  const [questions, setQuestions] = useState<ExamQuestion[]>(mockExamData.sections[0].questions);
  const [activeBankId, setActiveBankId] = useState<string | null>(null);
  const [isSavingAttempt, setIsSavingAttempt] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

  const hasSubmittedRef = useRef(false);

  // Load real question bank questions on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBankQuestions() {
      try {
        const banks = await quizzesApi.getBanks('monetary-policy');
        if (!isMounted) return;
        const targetBank = banks && banks.length > 0 ? banks[0] : null;
        if (targetBank) {
          setActiveBankId(targetBank.id);
          const qList = await quizzesApi.getQuestions(targetBank.id);
          if (isMounted && qList && qList.length > 0) {
            const mapped = qList.map((q) => {
              let correctIdx = 0;
              if (typeof q.correct_answer === 'number') {
                correctIdx = q.correct_answer;
              } else if (!isNaN(Number(q.correct_answer))) {
                correctIdx = Number(q.correct_answer);
              } else if (Array.isArray(q.options)) {
                const idx = q.options.indexOf(q.correct_answer);
                if (idx !== -1) correctIdx = idx;
              }
              return {
                id: q.id,
                text: q.question_text,
                options: Array.isArray(q.options) ? q.options : [],
                correctAnswer: correctIdx,
                explanation: q.explanation || '',
                topic: q.difficulty ? `${q.difficulty.toUpperCase()} • RBI Diagnostics` : 'Macroeconomics',
                difficulty: q.difficulty || 'Moderate',
              };
            });
            setQuestions(mapped);
          }
        }
      } catch (e) {
        console.log('Loaded local fallback mock exam:', e);
      }
    }
    loadBankQuestions();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentQ = questions[currentQuestionIdx] || questions[0];

  const submitAttemptToBackend = useCallback(async (answersMap: Record<string | number, number>, durationSecs: number) => {
    setIsSavingAttempt(true);
    setSaveError(null);
    try {
      const responsesPayload: Record<string, any> = {};
      questions.forEach((q) => {
        if (answersMap[q.id] !== undefined) {
          responsesPayload[String(q.id)] = answersMap[q.id];
        }
      });

      const result: any = await quizzesApi.submitQuiz({
        quiz_title: mockExamData.title,
        responses: responsesPayload,
        course_id: 'monetary-policy',
        bank_id: activeBankId || undefined,
        mode: 'exam',
        time_spent_secs: durationSecs,
      });

      if (result && typeof result.percentage === 'number') {
        const pct = result.percentage;
        const estCohort = Math.min(99.4, Math.max(12, Math.round(pct * 0.95 + 4.5)));
        setPercentile(estCohort);
      }
    } catch (err: any) {
      console.error('Quiz submit failed:', err);
      setSaveError(err.message || 'Unable to store exam attempt on server.');
    } finally {
      setIsSavingAttempt(false);
    }
  }, [questions, activeBankId]);

  const handleFinishExam = useCallback(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setExamState('evaluated');

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const earnedXP = correct * 35;
    updateUser({
      weeklyXP: user.weeklyXP + earnedXP,
    });

    const durationSecs = Math.max(1, 45 * 60 - secondsLeft);
    submitAttemptToBackend(answers, durationSecs);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [questions, answers, user.weeklyXP, updateUser, secondsLeft, submitAttemptToBackend]);

  // Exam Timer Countdown - strictly decrements without side-effects in state updater
  useEffect(() => {
    let timer: any = null;
    if (examState === 'active' && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, secondsLeft]);

  // Separate guarded effect to trigger finish when timer hits zero
  useEffect(() => {
    if (examState === 'active' && secondsLeft === 0 && !hasSubmittedRef.current) {
      handleFinishExam();
    }
  }, [secondsLeft, examState, handleFinishExam]);

  const handleStartExam = () => {
    hasSubmittedRef.current = false;
    setExamState('active');
    setSecondsLeft(45 * 60);
    setAnswers({});
    setFlagged({});
    setCurrentQuestionIdx(0);
    setSaveError(null);
    setPercentile(null);
  };

  const handleSelectOption = (optIdx: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  };

  return (
    <div className="relative w-full px-space-lg lg:px-space-2xl pt-space-lg pb-space-3xl flex flex-col gap-space-lg">
      {/* INTRO VIEW */}
      {examState === 'intro' && (
        <div className="flex flex-col gap-space-lg">
          <div className="flex flex-col gap-1 border-b border-surface-variant/40 dark:border-dark-border pb-4">
            <div className="flex items-center gap-2 text-primary font-code-sm text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              <span>Timed Diagnostic Evaluation Suite</span>
            </div>
            <h1 className="font-headline-lg text-2xl lg:text-3xl font-serif font-bold text-on-surface dark:text-dark-text">
              Practice Arena: RBI Grade B & FinTech Systems
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant dark:text-dark-text-muted">
              Standardized timed mock simulation testing Macroeconomic Policy, Option Greeks, and Distributed Architecture under strict examination conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
            {/* Main Exam Card */}
            <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed dark:bg-primary/20 text-primary dark:text-inverse-primary text-xs font-bold font-code-sm">
                    PHASE II FULL MOCK #04
                  </span>
                  <span className="text-xs font-code-sm text-on-surface-variant">45 MINS • 5 SCENARIO QUESTIONS</span>
                </div>
                <h2 className="font-headline-md text-xl font-bold font-serif text-on-surface dark:text-dark-text">
                  {mockExamData.title}
                </h2>
                <p className="text-sm text-on-surface-variant dark:text-dark-text-muted mt-2 leading-relaxed">
                  Rigorous multi-discipline examination assessing Flexible Inflation Targeting, Black-Scholes Greeks, 2-stage RAG latency optimization, Enterprise Value accounting, and Apache Flink Chandy-Lamport state snapshots.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-6 text-center text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
                    <span className="block font-code-sm text-lg font-bold text-primary">5 Qs</span>
                    <span className="text-on-surface-variant">Target Benchmark</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
                    <span className="block font-code-sm text-lg font-bold text-amber-600">45 Min</span>
                    <span className="text-on-surface-variant">Countdown Limit</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40">
                    <span className="block font-code-sm text-lg font-bold text-emerald-600">+175 XP</span>
                    <span className="text-on-surface-variant">Knowledge Yield</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartExam}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Begin Timed Mock Examination</span>
              </button>
            </div>

            {/* Daily Cognitive Drill / Rapid Fire */}
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Daily Rapid-Fire Drills</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-dark-text">
                  60-Second Flash Recall
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
                  Keep synaptic decay at bay with 5 rapid questions before your main deep work session.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/40 text-xs">
                  <span className="font-bold text-primary block mb-1">Today's Focus:</span>
                  <span className="text-on-surface-variant">Macro Liquidity & Derivatives Greeks</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentPath('my-library')}
                className="py-2.5 rounded-xl bg-surface-container-high dark:bg-dark-surface-2 hover:bg-primary hover:text-white transition-all text-xs font-bold text-on-surface dark:text-dark-text cursor-pointer"
              >
                Review Flashcard Decks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE EXAM VIEW */}
      {examState === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Question Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm justify-between gap-6 min-h-[560px]">
            <div>
              {/* Question Top Header */}
              <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-code-sm">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <span className="text-xs font-code-sm text-on-surface-variant">
                    {currentQ.topic}
                  </span>
                </div>

                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {flagged[currentQ.id] ? 'flag' : 'outlined_flag'}
                  </span>
                  <span>{flagged[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="font-headline-sm text-lg font-bold text-on-surface dark:text-dark-text leading-relaxed">
                {currentQ.text}
              </h3>

              {/* Options List */}
              <div className="space-y-3 mt-6">
                {currentQ.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary dark:text-inverse-primary font-bold shadow-sm'
                          : 'border-surface-variant/50 dark:border-dark-border hover:bg-surface-container-high dark:hover:bg-dark-surface-2 text-on-surface dark:text-dark-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-variant/30">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExam}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Submit Exam & Evaluate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Palette & Timer (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            {/* Live Countdown Card */}
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-code-sm uppercase font-bold text-on-surface-variant block">
                  Time Remaining
                </span>
                <span className="font-code-sm text-2xl font-bold text-primary dark:text-inverse-primary">
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <button
                onClick={handleFinishExam}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                End Exam
              </button>
            </div>

            {/* Question Palette */}
            <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-dark-text">
                Question Palette
              </span>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged[q.id];
                  const isCurrent = idx === currentQuestionIdx;

                  let btnBg = 'bg-surface-container-high text-on-surface-variant';
                  if (isCurrent) btnBg = 'ring-2 ring-primary bg-primary text-white font-bold';
                  else if (isFlagged) btnBg = 'bg-amber-100 text-amber-900 border border-amber-400 font-bold';
                  else if (isAnswered) btnBg = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 rounded-lg text-xs font-code-sm transition-all flex items-center justify-center cursor-pointer ${btnBg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant dark:text-dark-text-muted pt-2 border-t border-surface-variant/30">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Answered ({Object.keys(answers).length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Flagged ({Object.values(flagged).filter(Boolean).length})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION REPORT VIEW */}
      {examState === 'evaluated' && (
        <div className="flex flex-col gap-space-lg animate-fadeIn">
          {/* Top Score Banner */}
          <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-xl rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center font-bold">
                <span className="text-3xl font-code-sm leading-none">{calculateScore().correct}</span>
                <span className="text-[11px] text-on-surface-variant font-normal">/{calculateScore().total} Correct</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-2xl font-serif font-bold text-on-surface dark:text-dark-text">
                    Diagnostic Score: {calculateScore().percentage}%
                  </h2>
                  {percentile !== null ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-code-sm text-xs font-bold">
                      TOP {(100 - percentile).toFixed(1)}% COHORT
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-code-sm text-xs font-bold">
                      EVALUATION COMPLETE
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant dark:text-dark-text-muted mt-1">
                  Mastery validated across Macroeconomics, Black-Scholes Greeks, and Distributed Stream Engines.
                </p>
                {isSavingAttempt && (
                  <p className="text-xs text-primary mt-1 animate-pulse flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    Saving attempt to official learning record...
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setExamState('intro')}
                className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold transition-all cursor-pointer"
              >
                Back to Arena
              </button>
              <button
                onClick={handleStartExam}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Retake Exam
              </button>
            </div>
          </div>

          {/* Failure Notice with Retry */}
          {saveError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-[20px]">cloud_off</span>
                <span>
                  <strong>Server Sync Notice:</strong> {saveError}
                </span>
              </div>
              <button
                onClick={() => submitAttemptToBackend(answers, Math.max(1, 45 * 60 - secondsLeft))}
                disabled={isSavingAttempt}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isSavingAttempt ? 'Retrying...' : 'Retry Save'}
              </button>
            </div>
          )}

          {/* Vulnerability Taxonomy & Solutions Breakdown */}
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-serif font-bold text-on-surface dark:text-dark-text">
              Question-by-Question Solution Analysis & Rubric
            </h3>

            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-space-lg rounded-2xl border text-xs flex flex-col gap-3 ${
                    isCorrect
                      ? 'bg-surface-container-lowest dark:bg-dark-surface border-emerald-500/30'
                      : 'bg-surface-container-lowest dark:bg-dark-surface border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800'
                      }`}>
                        Question {idx + 1}: {isCorrect ? 'Correct (+35 XP)' : 'Missed'}
                      </span>
                      <span className="font-code-sm text-on-surface-variant">{q.topic}</span>
                    </div>
                  </div>

                  <p className="font-bold text-sm text-on-surface dark:text-dark-text">
                    {q.text}
                  </p>

                  <div className="space-y-1.5">
                    {q.options.map((opt: string, oIdx: number) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          oIdx === q.correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                            : userAnswer === oIdx
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900'
                            : 'border-surface-variant/40 text-on-surface-variant'
                        }`}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {oIdx === q.correctAnswer && (
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-on-surface-variant dark:text-dark-text-muted leading-relaxed">
                    <strong className="text-on-surface dark:text-dark-text block mb-1">Official Solution Rubric:</strong>
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
