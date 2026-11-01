import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Lesson } from '../../types';

interface ClassroomQuizProps {
  lesson: Lesson;
  onCompleteLesson: () => void;
}

export const ClassroomQuiz: React.FC<ClassroomQuizProps> = ({ lesson, onCompleteLesson }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const quiz = lesson.quiz || [];

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });
    setScore(correct);
    setIsSubmitted(true);

    if (correct === quiz.length) {
      confetti({ particleCount: 90, spread: 70 });
      onCompleteLesson();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };

  if (!quiz || quiz.length === 0) {
    return (
      <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border text-center text-xs text-on-surface-variant dark:text-dark-text-muted">
        No active quiz items for this lesson. Review the Deep-Dive Reader or test your recall with Flashcards.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
        <div className="flex items-center gap-2 text-xs font-code-sm text-primary dark:text-inverse-primary font-bold">
          <span className="material-symbols-outlined text-[16px]">quiz</span>
          <span>Knowledge Check — {quiz.length} Question{quiz.length > 1 ? 's' : ''}</span>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-inverse-primary">
              Score: {score} / {quiz.length} ({Math.round(((score || 0) / quiz.length) * 100)}%)
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-on-surface-variant hover:text-primary underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {quiz.map((q, qIdx) => {
          const userAns = selectedAnswers[qIdx];
          const isCorrect = userAns === q.correctIndex;

          return (
            <div key={qIdx} className="flex flex-col gap-3">
              <h4 className="font-semibold text-xs text-on-surface dark:text-dark-text leading-snug">
                {qIdx + 1}. {q.question}
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIdx) => {
                  let btnStyle = 'border-surface-variant/40 hover:bg-surface-container-low dark:border-dark-border dark:hover:bg-dark-surface-2';
                  if (userAns === optIdx) {
                    btnStyle = 'border-primary bg-primary/5 dark:bg-primary/20 text-primary dark:text-inverse-primary font-semibold';
                  }
                  if (isSubmitted) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold';
                    } else if (userAns === optIdx && !isCorrect) {
                      btnStyle = 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isSubmitted && q.explanation && (
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20'
                }`}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 transition-all"
          >
            <span>Submit Knowledge Check</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
};
