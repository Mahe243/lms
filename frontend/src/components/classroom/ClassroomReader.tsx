import React from 'react';
import type { Lesson } from '../../types';

interface ClassroomReaderProps {
  lesson: Lesson;
}

export const ClassroomReader: React.FC<ClassroomReaderProps> = ({ lesson }) => {
  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-lg rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-4 leading-relaxed font-body-md text-on-surface dark:text-dark-text">
      <div className="flex items-center gap-2 text-xs font-code-sm text-primary dark:text-inverse-primary font-bold uppercase tracking-wider">
        <span className="material-symbols-outlined text-[16px]">psychology</span>
        <span>Foundational Theory & Deep-Dive Analysis</span>
      </div>

      <h3 className="font-headline-sm text-xl font-serif font-bold text-on-surface dark:text-dark-text">
        {lesson.title}
      </h3>

      <div className="prose dark:prose-invert max-w-none text-xs text-on-surface-variant dark:text-dark-text-muted whitespace-pre-line leading-relaxed">
        {lesson.markdownContent}
      </div>

      {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
        <div className="pt-4 border-t border-surface-variant/30 dark:border-dark-border flex flex-col gap-2">
          <h4 className="font-headline-sm text-sm font-bold text-on-surface dark:text-dark-text flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>Key Takeaways & Invariant Principles</span>
          </h4>
          <ul className="space-y-2 text-xs text-on-surface-variant dark:text-dark-text-muted">
            {lesson.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
