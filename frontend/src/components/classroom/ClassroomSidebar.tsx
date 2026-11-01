import React, { useState } from 'react';
import type { Course, Lesson } from '../../types';

interface ClassroomSidebarProps {
  currentCourse: Course;
  courses: Course[];
  activeLesson: Lesson;
  availableLessons: Lesson[];
  onSelectCourse: (courseId: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export const ClassroomSidebar: React.FC<ClassroomSidebarProps> = ({
  currentCourse,
  courses,
  activeLesson,
  availableLessons,
  onSelectCourse,
  onSelectLesson,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  const filtered = availableLessons.filter((l) =>
    l.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    l.moduleTitle.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
      {/* Course Switcher Header */}
      <div className="flex flex-col gap-2 pb-2 border-b border-surface-variant/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-code-sm uppercase font-bold tracking-wider text-primary dark:text-inverse-primary">
            Curriculum Track
          </span>
          <button
            onClick={() => setShowCourseSelector(!showCourseSelector)}
            className="text-xs text-on-surface-variant dark:text-dark-text-muted hover:text-primary flex items-center gap-1 cursor-pointer"
          >
            <span>Switch</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
        </div>

        <div className="font-serif font-bold text-sm text-on-surface dark:text-dark-text line-clamp-1">
          {currentCourse.title}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant dark:text-dark-text-muted">
          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${currentCourse.progress}%` }}
            ></div>
          </div>
          <span className="font-code-sm font-bold text-primary dark:text-inverse-primary">
            {currentCourse.progress}%
          </span>
        </div>

        {/* Course Dropdown */}
        {showCourseSelector && (
          <div className="mt-1 p-2 rounded-xl bg-surface-container dark:bg-dark-surface-2 border border-surface-variant/40 flex flex-col gap-1 text-xs">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCourse(c.id);
                  setShowCourseSelector(false);
                }}
                className={`p-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                  c.id === currentCourse.id
                    ? 'bg-primary text-white font-bold'
                    : 'hover:bg-surface-container-highest text-on-surface dark:text-dark-text'
                }`}
              >
                <div className="truncate max-w-[200px]">
                  <span className="font-code-sm text-[10px] opacity-75 mr-1.5">{c.code}</span>
                  <span>{c.title}</span>
                </div>
                <span className="text-[10px]">{c.progress}%</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Filter Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-[16px]">
          search
        </span>
        <input
          type="text"
          placeholder="Filter modules & topics..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-xs text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Lessons List */}
      <div className="flex flex-col gap-1 max-h-[460px] overflow-y-auto pr-1">
        {filtered.map((lesson) => {
          const isActive = lesson.id === activeLesson.id;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer border ${
                isActive
                  ? 'bg-primary/10 border-primary/40 text-primary dark:text-inverse-primary shadow-xs'
                  : 'border-transparent hover:bg-surface-container-low dark:hover:bg-dark-surface-2 text-on-surface dark:text-dark-text'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                lesson.completed ? 'text-emerald-500' : isActive ? 'text-primary' : 'text-on-surface-variant/50'
              }`}>
                {lesson.completed ? 'check_circle' : isActive ? 'play_circle' : 'radio_button_unchecked'}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-code-sm text-on-surface-variant dark:text-dark-text-muted truncate">
                  {lesson.moduleTitle}
                </div>
                <div className="text-xs font-semibold leading-snug line-clamp-2">
                  {lesson.title}
                </div>
                <div className="text-[10px] text-on-surface-variant/70 mt-1 flex items-center gap-1.5 font-code-sm">
                  <span>{lesson.duration}</span>
                  {lesson.videoUrl && (
                    <span className="text-red-500 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      Video
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
