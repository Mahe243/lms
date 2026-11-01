import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassroomVideoPlayer } from '../classroom/ClassroomVideoPlayer';
import { ClassroomReader } from '../classroom/ClassroomReader';
import { ClassroomMatrix } from '../classroom/ClassroomMatrix';
import { ClassroomCodeSandbox } from '../classroom/ClassroomCodeSandbox';
import { ClassroomNotes } from '../classroom/ClassroomNotes';
import { ClassroomQuiz } from '../classroom/ClassroomQuiz';
import { ClassroomAITutor } from '../classroom/ClassroomAITutor';
import { ClassroomSidebar } from '../classroom/ClassroomSidebar';

export const ClassroomView: React.FC = () => {
  const {
    activeCourseId,
    courses,
    selectCourse,
    activeLesson,
    selectLesson,
    availableLessons,
    activeVideoUrl,
    setActiveVideoUrl,
    markLessonComplete,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reader' | 'matrix' | 'code' | 'quiz' | 'ai-bot'>('reader');

  const currentCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  return (
    <div className="flex flex-col gap-space-lg max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Lesson Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-inverse-primary text-[10px] font-code-sm font-bold uppercase">
            {currentCourse.code} • {currentCourse.track}
          </span>
          <span className="text-xs text-on-surface-variant dark:text-dark-text-muted">
            Instructor: {currentCourse.instructor}
          </span>
        </div>

        <h1 className="font-headline-lg text-2xl lg:text-3xl font-serif font-bold text-on-surface dark:text-dark-text tracking-tight">
          {activeLesson.title}
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant dark:text-dark-text-muted">
          {currentCourse.description}
        </p>
      </div>

      {/* Main Grid: Media & Study Tabs (8 cols) & Syllabus & Notes (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column (8 cols): Video Player + Tabbed Study Deck */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Working Media Player with YouTube & MP4 support */}
          <ClassroomVideoPlayer
            videoUrl={activeVideoUrl}
            lessonTitle={activeLesson.title}
            onVideoEnded={() => markLessonComplete(activeLesson.id)}
            onCustomUrlChange={(url) => setActiveVideoUrl(url)}
          />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low dark:bg-dark-surface-2 p-1 rounded-xl border border-surface-variant/40 dark:border-dark-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3.5 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Deep-Dive Reader</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>Trade-off Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Python Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-surface-container-lowest dark:bg-dark-surface text-primary dark:text-inverse-primary shadow-sm'
                  : 'text-on-surface-variant dark:text-dark-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Knowledge Check</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-bot')}
              className={`px-3.5 py-2 rounded-lg text-xs font-label-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'ai-bot'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary dark:text-inverse-primary hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span>Ask AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'reader' && <ClassroomReader lesson={activeLesson} />}
          {activeTab === 'matrix' && <ClassroomMatrix />}
          {activeTab === 'code' && <ClassroomCodeSandbox lesson={activeLesson} />}
          {activeTab === 'quiz' && (
            <ClassroomQuiz
              lesson={activeLesson}
              onCompleteLesson={() => markLessonComplete(activeLesson.id)}
            />
          )}
          {activeTab === 'ai-bot' && (
            <ClassroomAITutor courseId={activeCourseId} lesson={activeLesson} />
          )}
        </div>

        {/* Right Column (4 cols): Syllabus Navigation & Persistent Companion Notes */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <ClassroomSidebar
            currentCourse={currentCourse}
            courses={courses}
            activeLesson={activeLesson}
            availableLessons={availableLessons}
            onSelectCourse={selectCourse}
            onSelectLesson={selectLesson}
          />

          <ClassroomNotes
            courseId={activeCourseId}
            topicId={activeLesson.id}
            topicTitle={activeLesson.title}
          />
        </div>
      </div>
    </div>
  );
};
