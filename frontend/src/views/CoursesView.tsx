import React, { useState } from 'react';
import {
  BookOpen, Plus, ChevronDown, ChevronRight, CheckCircle2, Clock,
  Sparkles, Layers, CheckSquare, Folder, FileText, RotateCcw,
  Target, Calendar, Tag, Trash2, Edit3, ArrowLeft, BarChart2
} from 'lucide-react';
import { Course, Module, Topic, Subtopic } from '../types';
import { api } from '../api';

interface CoursesViewProps {
  courses: Course[];
  selectedCourseId?: string;
  onRefreshCourses: () => void;
  onNavigate: (tab: string, meta?: any) => void;
  onStartFocusSession: (courseId: string, topicId?: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  selectedCourseId,
  onRefreshCourses,
  onNavigate,
  onStartFocusSession,
}) => {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(selectedCourseId || null);
  const [courseTab, setCourseTab] = useState<'overview' | 'syllabus' | 'resources' | 'notes' | 'flashcards' | 'practice' | 'tasks'>('overview');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Modals
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);

  // Form states
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Computer Science');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicMinutes, setNewTopicMinutes] = useState(30);
  const [targetModuleId, setTargetModuleId] = useState('');

  const currentCourse = courses.find((c) => c.id === activeCourseId);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleSubtopicToggle = async (subtopicId: string, currentStatus: boolean) => {
    try {
      await api.updateSubtopic(subtopicId, !currentStatus);
      onRefreshCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopicStatusChange = async (topicId: string, newStatus: string) => {
    try {
      await api.updateTopic(topicId, { status: newStatus });
      onRefreshCourses();
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopicLevelChange = async (topicId: string, newLevel: string) => {
    try {
      await api.updateTopic(topicId, { understanding_level: newLevel });
      onRefreshCourses();
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic((prev: any) => ({ ...prev, understanding_level: newLevel }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    try {
      const res = await api.createCourse({
        name: newCourseName,
        category: newCourseCategory,
        description: newCourseDesc,
        status: 'active',
      });
      setShowCreateCourseModal(false);
      setNewCourseName('');
      setNewCourseDesc('');
      onRefreshCourses();
      setActiveCourseId(res.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseId || !newModuleName.trim()) return;
    try {
      await api.createModule(activeCourseId, newModuleName);
      setShowCreateModuleModal(false);
      setNewModuleName('');
      onRefreshCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !newTopicTitle.trim()) return;
    try {
      await api.createTopic(targetModuleId, {
        title: newTopicTitle,
        description: newTopicDesc,
        estimated_minutes: newTopicMinutes,
      });
      setShowCreateTopicModal(false);
      setNewTopicTitle('');
      setNewTopicDesc('');
      onRefreshCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {!currentCourse ? (
        /* Course Grid View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">My Learning Courses</h2>
              <p className="text-xs text-neutral-500">Moodle-inspired topic organization for focused independent study</p>
            </div>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
            >
              <Plus size={14} />
              <span>Create Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => {
              const pct = c.progress?.completion_percentage || 0;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCourseId(c.id)}
                  className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                        {pct}%
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-2.5">
                      {c.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {c.description || 'No course overview provided'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{c.modules.length} Modules</span>
                      <span>
                        {c.modules.reduce((acc, m) => acc + m.topics.length, 0)} Topics
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Course Detail Workspace */
        <div className="space-y-5">
          {/* Back button & Course Banner */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveCourseId(null);
                setSelectedTopic(null);
              }}
              className="flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition"
            >
              <ArrowLeft size={14} />
              <span>Back to All Courses</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStartFocusSession(currentCourse.id, selectedTopic?.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 shadow-xs"
              >
                <Clock size={14} />
                <span>Focus on This Course</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  {currentCourse.category}
                </span>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {currentCourse.name}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  {currentCourse.description}
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center space-x-4 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <div className="text-center">
                  <span className="text-[10px] text-neutral-400 block uppercase">Progress</span>
                  <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {currentCourse.progress?.completion_percentage || 0}%
                  </span>
                </div>
                <div className="text-center border-l border-neutral-200 dark:border-neutral-700 pl-3">
                  <span className="text-[10px] text-neutral-400 block uppercase">Quiz Avg</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {currentCourse.progress?.quiz_average_percentage || 0}%
                  </span>
                </div>
                <div className="text-center border-l border-neutral-200 dark:border-neutral-700 pl-3">
                  <span className="text-[10px] text-neutral-400 block uppercase">Revision</span>
                  <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                    {currentCourse.progress?.revision_readiness_score || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Course Tabs Navigation */}
            <div className="flex items-center space-x-1 border-t border-neutral-100 dark:border-neutral-800 mt-5 pt-3 overflow-x-auto text-xs">
              {[
                { id: 'overview', label: 'Curriculum & Topics', icon: BookOpen },
                { id: 'syllabus', label: 'Syllabus', icon: FileText },
                { id: 'resources', label: 'Materials', icon: Folder },
                { id: 'notes', label: 'Notes', icon: Edit3 },
                { id: 'flashcards', label: 'Flashcards', icon: Layers },
                { id: 'practice', label: 'Practice & Quizzes', icon: CheckSquare },
                { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSel = courseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCourseTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      isSel
                        ? 'bg-indigo-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {courseTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Modules & Topics Tree */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Course Units & Modules
                  </h3>
                  <button
                    onClick={() => setShowCreateModuleModal(true)}
                    className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    <Plus size={13} />
                    <span>Add Module</span>
                  </button>
                </div>

                {currentCourse.modules.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
                    No modules yet. Click "Add Module" to start structuring your units.
                  </div>
                ) : (
                  currentCourse.modules.map((m) => {
                    const isExpanded = expandedModules[m.id] !== false; // default open
                    return (
                      <div
                        key={m.id}
                        className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs"
                      >
                        {/* Module Header */}
                        <div
                          onClick={() => toggleModule(m.id)}
                          className="px-4 py-3 bg-neutral-50/70 dark:bg-neutral-800/40 flex items-center justify-between cursor-pointer border-b border-neutral-100 dark:border-neutral-800"
                        >
                          <div className="flex items-center space-x-2">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                              {m.title}
                            </span>
                            <span className="text-[11px] text-neutral-400">({m.topics.length} topics)</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetModuleId(m.id);
                              setShowCreateTopicModal(true);
                            }}
                            className="text-[11px] text-indigo-600 hover:underline flex items-center space-x-1 font-medium"
                          >
                            <Plus size={12} />
                            <span>Add Topic</span>
                          </button>
                        </div>

                        {/* Topics List */}
                        {isExpanded && (
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 p-2">
                            {m.topics.map((t) => {
                              const isSelected = selectedTopic?.id === t.id;
                              return (
                                <div
                                  key={t.id}
                                  onClick={() => setSelectedTopic(t)}
                                  className={`p-3 rounded-lg cursor-pointer transition ${
                                    isSelected
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60'
                                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-2.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTopicStatusChange(
                                            t.id,
                                            t.status === 'completed' ? 'in_progress' : 'completed'
                                          );
                                        }}
                                        className={`mt-0.5 ${
                                          t.status === 'completed'
                                            ? 'text-emerald-600'
                                            : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
                                        }`}
                                      >
                                        <CheckCircle2 size={16} />
                                      </button>
                                      <div>
                                        <span
                                          className={`text-xs font-semibold block ${
                                            t.status === 'completed'
                                              ? 'line-through text-neutral-400'
                                              : 'text-neutral-900 dark:text-neutral-100'
                                          }`}
                                        >
                                          {t.title}
                                        </span>
                                        <span className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                                          {t.description || 'No description'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Topic Meta Badges */}
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize ${
                                          t.understanding_level === 'confident'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                            : t.understanding_level === 'comfortable'
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                        }`}
                                      >
                                        {t.understanding_level}
                                      </span>
                                      <span className="text-[10px] font-mono text-neutral-400">
                                        ~{t.estimated_minutes}m
                                      </span>
                                    </div>
                                  </div>

                                  {/* Subtopics Checklist Preview */}
                                  {t.subtopics && t.subtopics.length > 0 && (
                                    <div className="mt-2.5 ml-6 space-y-1 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                                      {t.subtopics.map((st) => (
                                        <div
                                          key={st.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubtopicToggle(st.id, st.is_completed);
                                          }}
                                          className="flex items-center space-x-2 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={st.is_completed}
                                            readOnly
                                            className="rounded text-indigo-600"
                                          />
                                          <span className={st.is_completed ? 'line-through text-neutral-400' : ''}>
                                            {st.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Topic Detail Inspector Drawer */}
              <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs h-fit space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    Topic Inspector
                  </h4>
                  {selectedTopic && (
                    <button
                      onClick={() => onStartFocusSession(currentCourse.id, selectedTopic.id)}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Start Session →
                    </button>
                  )}
                </div>

                {!selectedTopic ? (
                  <p className="text-xs text-neutral-400 text-center py-10">
                    Select any topic from the curriculum to inspect objectives, status, and linked study tools.
                  </p>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedTopic.title}
                      </h4>
                      <p className="text-neutral-500 mt-1 leading-relaxed">
                        {selectedTopic.description}
                      </p>
                    </div>

                    {/* Status & Understanding Control */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-neutral-500 block mb-1">Status</label>
                        <select
                          value={selectedTopic.status}
                          onChange={(e) => handleTopicStatusChange(selectedTopic.id, e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="needs_revision">Needs Revision</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-500 block mb-1">Understanding Level</label>
                        <select
                          value={selectedTopic.understanding_level}
                          onChange={(e) => handleTopicLevelChange(selectedTopic.id, e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                        >
                          <option value="unfamiliar">Unfamiliar</option>
                          <option value="basic">Basic</option>
                          <option value="comfortable">Comfortable</option>
                          <option value="confident">Confident</option>
                        </select>
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    {selectedTopic.learning_objectives && selectedTopic.learning_objectives.length > 0 && (
                      <div>
                        <span className="font-semibold block mb-1 text-neutral-700 dark:text-neutral-300">
                          Learning Objectives:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                          {selectedTopic.learning_objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions on Topic */}
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col space-y-1.5">
                      <button
                        onClick={() => onNavigate('notes', { courseId: currentCourse.id, topicId: selectedTopic.id })}
                        className="w-full text-left p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="flex items-center space-x-2">
                          <FileText size={14} className="text-amber-500" />
                          <span>View Topic Notes</span>
                        </span>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => onNavigate('ai-tutor', { courseId: currentCourse.id, topicId: selectedTopic.id })}
                        className="w-full text-left p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="flex items-center space-x-2">
                          <Sparkles size={14} className="text-indigo-500" />
                          <span>Ask AI Tutor about Topic</span>
                        </span>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => onNavigate('revision')}
                        className="w-full text-left p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="flex items-center space-x-2">
                          <RotateCcw size={14} className="text-emerald-500" />
                          <span>Revision Interval: {selectedTopic.revision_interval_days}d</span>
                        </span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {courseTab === 'syllabus' && (
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-semibold mb-2">Syllabus & Course Scope</h3>
              <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed font-mono">
                {currentCourse.syllabus || 'No syllabus provided yet.'}
              </div>
            </div>
          )}

          {courseTab === 'resources' && (
            <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Course Learning Materials</h3>
                <button
                  onClick={() => onNavigate('resources', { courseId: currentCourse.id })}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Manage in Resource Library →
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Switch to the Resource Library tab to view and preview videos, PDFs, and articles filtered by this course.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Course */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Create New Learning Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud Computing"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Category</label>
                <input
                  type="text"
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Course goals and focus..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Module */}
      {showCreateModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Add Module / Unit</h3>
            <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="e.g. Unit 2: Consensus & Fault Tolerance"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModuleModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Topic */}
      {showCreateTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Add Topic to Module</h3>
            <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Raft Consensus Algorithm"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="Key concepts to cover..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Estimated Study Minutes</label>
                <input
                  type="number"
                  min={10}
                  value={newTopicMinutes}
                  onChange={(e) => setNewTopicMinutes(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTopicModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
