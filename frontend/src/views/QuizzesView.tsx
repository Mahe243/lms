import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Play, RotateCcw, AlertTriangle, CheckCircle2,
  Clock, Award, BookOpen, ChevronRight, HelpCircle, Sparkles, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuestionBank, Question, QuizAttempt, Course } from '../types';
import { api } from '../api';

interface QuizzesViewProps {
  courses: Course[];
  initialDraftQuestions?: any[];
  onNavigate: (tab: string, meta?: any) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  courses,
  initialDraftQuestions,
  onNavigate,
}) => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);

  // Active Quiz Taker state
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizMode, setQuizMode] = useState<'practice' | 'exam'>('practice');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizTimerSeconds, setQuizTimerSeconds] = useState(0);
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null);

  // New question form modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('mcq');
  const [qOptions, setQOptions] = useState('Option A\nOption B\nOption C\nOption D');
  const [qCorrect, setQCorrect] = useState('Option A');
  const [qExplanation, setQExplanation] = useState('');

  const fetchBanksAndAttempts = async () => {
    try {
      const b = await api.getQuestionBanks();
      setBanks(b);
      if (b.length > 0 && !selectedBank) {
        setSelectedBank(b[0]);
      }
      const att = await api.getQuizAttempts();
      setAttempts(att);
      const m = await api.getMistakeLog();
      setMistakes(m);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBanksAndAttempts();
  }, []);

  useEffect(() => {
    if (selectedBank) {
      api.getQuestions({ bank_id: selectedBank.id }).then(setQuestions).catch(console.error);
    }
  }, [selectedBank]);

  // Quiz timer increment
  useEffect(() => {
    let interval: any;
    if (isTakingQuiz && !submittedAttempt) {
      interval = setInterval(() => setQuizTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTakingQuiz, submittedAttempt]);

  const handleStartQuiz = (mode: 'practice' | 'exam') => {
    if (questions.length === 0) {
      alert('Please add questions to this question bank first!');
      return;
    }
    setQuizMode(mode);
    setActiveQuestions(questions);
    setUserAnswers({});
    setCurrentQIndex(0);
    setQuizTimerSeconds(0);
    setSubmittedAttempt(null);
    setIsTakingQuiz(true);
  };

  const handleSelectAnswer = (qId: string, val: any) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedBank) return;
    try {
      const attempt = await api.submitQuiz({
        bank_id: selectedBank.id,
        course_id: selectedBank.course_id,
        quiz_title: `${selectedBank.name} (${quizMode.toUpperCase()})`,
        mode: quizMode,
        time_spent_secs: quizTimerSeconds,
        responses: userAnswers,
      });
      setSubmittedAttempt(attempt);
      if (attempt.percentage >= 70) {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      }
      fetchBanksAndAttempts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !qText.trim()) return;
    try {
      const opts = qType === 'mcq' ? qOptions.split('\n').filter(Boolean) : qType === 'true_false' ? ['True', 'False'] : [];
      await api.createQuestion({
        bank_id: selectedBank.id,
        question_text: qText,
        question_type: qType as any,
        options: opts,
        correct_answer: qCorrect,
        explanation: qExplanation,
      });
      setShowAddQuestionModal(false);
      setQText('');
      setQExplanation('');
      const qs = await api.getQuestions({ bank_id: selectedBank.id });
      setQuestions(qs);
    } catch (err) {
      console.error(err);
    }
  };

  const currentQ = activeQuestions[currentQIndex];

  return (
    <div className="space-y-6 pb-12">
      {isTakingQuiz ? (
        /* Quiz Taker Workspace */
        <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsTakingQuiz(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              ← Exit Quiz
            </button>
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                ⏱ {Math.floor(quizTimerSeconds / 60)}:{(quizTimerSeconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="font-semibold capitalize text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                {quizMode} Mode
              </span>
            </div>
          </div>

          {submittedAttempt ? (
            /* Attempt Results Screen */
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-2xl p-8 space-y-6 shadow-sm">
              <div className="text-center space-y-2">
                <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
                  {submittedAttempt.percentage}%
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Scored {submittedAttempt.score} of {submittedAttempt.max_score} points
                </h3>
                <p className="text-xs text-neutral-500">
                  Completed in {Math.floor(submittedAttempt.time_spent_secs / 60)}m {submittedAttempt.time_spent_secs % 60}s
                </p>
              </div>

              {/* Review Questions Breakdown */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs pt-4 space-y-3">
                {submittedAttempt.questions_snapshot.map((q, idx) => {
                  const resp = submittedAttempt.responses[q.id];
                  const isCorr = resp?.is_correct;
                  return (
                    <div key={q.id} className="pt-3 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {idx + 1}. {q.question_text}
                        </span>
                        <span className={`font-bold ml-2 ${isCorr ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isCorr ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400">
                        Your Answer: <span className="font-medium text-neutral-800 dark:text-neutral-200">{String(resp?.user_answer ?? 'None')}</span>
                      </div>
                      {!isCorr && (
                        <div className="text-emerald-700 dark:text-emerald-400">
                          Correct Answer: <span className="font-medium">{String(resp?.correct_answer)}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-neutral-500 italic bg-neutral-50 dark:bg-neutral-800 p-2 rounded">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setIsTakingQuiz(false)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  Return to Banks
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Card */
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-2xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Question {currentQIndex + 1} of {activeQuestions.length}</span>
                <span className="uppercase text-[10px] font-bold">{currentQ?.question_type}</span>
              </div>

              <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed">
                {currentQ?.question_text}
              </div>

              {/* Question Options */}
              <div className="space-y-2 text-xs">
                {currentQ?.options && currentQ.options.length > 0 ? (
                  currentQ.options.map((opt, i) => {
                    const isSelected = userAnswers[currentQ.id] === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQ.id, opt)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-medium'
                            : 'bg-neutral-50/50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:bg-white'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                      </button>
                    );
                  })
                ) : (
                  /* Numerical or short answer text input */
                  <div>
                    <input
                      type="text"
                      value={userAnswers[currentQ?.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Immediate practice mode feedback */}
              {quizMode === 'practice' && userAnswers[currentQ?.id] && currentQ?.explanation && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 animate-fade-in">
                  💡 Hint / Explanation: {currentQ.explanation}
                </div>
              )}

              {/* Question Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => i - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                >
                  Previous
                </button>

                {currentQIndex + 1 < activeQuestions.length ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((i) => i + 1)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                  >
                    Submit Quiz Attempt
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Question Banks & Mistake Log Overview */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Practice & Question Banks</h2>
              <p className="text-xs text-neutral-500">Test understanding with objective grading and attempt history snapshots</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Banks List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Question Banks
              </span>
              {banks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBank(b)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedBank?.id === b.id
                      ? 'bg-white dark:bg-neutral-900 border-indigo-500 shadow-sm'
                      : 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:bg-white'
                  }`}
                >
                  <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">{b.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{b.description}</p>
                  <span className="text-[10px] text-neutral-400 mt-2 block font-mono">
                    {b.question_count} questions
                  </span>
                </div>
              ))}
            </div>

            {/* Selected Bank Questions & Actions */}
            {selectedBank && (
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">{selectedBank.name}</h3>
                    <p className="text-xs text-neutral-500">{selectedBank.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStartQuiz('practice')}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Practice Mode
                    </button>
                    <button
                      onClick={() => handleStartQuiz('exam')}
                      className="px-3.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-semibold hover:opacity-90"
                    >
                      Exam Mode
                    </button>
                    <button
                      onClick={() => setShowAddQuestionModal(true)}
                      className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-50"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {questions.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400">No questions in this bank yet.</div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={q.id} className="p-3.5 flex items-start justify-between">
                        <div>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 block">
                            {idx + 1}. {q.question_text}
                          </span>
                          <span className="text-[11px] text-neutral-400 block mt-0.5 capitalize">
                            Type: {q.question_type} • Difficulty: {q.difficulty}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Mistake Log Section */}
                {mistakes.length > 0 && (
                  <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300">
                      <AlertTriangle size={16} />
                      <h4 className="font-bold text-xs uppercase tracking-wider">
                        Mistake Log (Past Incorrect Answers)
                      </h4>
                    </div>
                    <div className="divide-y divide-rose-100 dark:divide-rose-900/30 text-xs">
                      {mistakes.slice(0, 3).map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-start justify-between">
                          <div>
                            <span className="font-semibold block">{m.question_text}</span>
                            <span className="text-neutral-500">Your Answer: {String(m.user_answer)}</span>
                          </div>
                          <button
                            onClick={() =>
                              onNavigate('ai-tutor', {
                                initialMessage: `Can you explain why my answer "${m.user_answer}" was incorrect for the question: "${m.question_text}"? The correct answer is "${m.correct_answer}".`,
                              })
                            }
                            className="text-[11px] text-indigo-600 font-medium hover:underline flex items-center space-x-1"
                          >
                            <Sparkles size={12} />
                            <span>Ask AI Why</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Add Question to Bank</h3>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="true_false">True or False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="numerical">Numerical Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Question text..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              {qType === 'mcq' && (
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Options (One per line)</label>
                  <textarea
                    rows={4}
                    value={qOptions}
                    onChange={(e) => setQOptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Correct Answer</label>
                <input
                  type="text"
                  required
                  value={qCorrect}
                  onChange={(e) => setQCorrect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Explanation</label>
                <input
                  type="text"
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Rationale or proof..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
