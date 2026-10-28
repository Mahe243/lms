import React, { useState } from 'react';
import {
  CheckSquare, Plus, CheckCircle2, Clock, AlertCircle,
  LayoutGrid, List, FileText, ExternalLink, Calendar, Award
} from 'lucide-react';
import { Task, Course } from '../types';
import { api } from '../api';

interface TasksViewProps {
  tasks: Task[];
  courses: Course[];
  onRefreshTasks: () => void;
  onNavigate: (tab: string, meta?: any) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  courses,
  onRefreshTasks,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterType, setFilterType] = useState('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'study' | 'assignment' | 'exam_prep' | 'revision'>('study');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newEstMinutes, setNewEstMinutes] = useState(30);

  // Assignment edit fields
  const [subLink, setSubLink] = useState('');
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createTask({
        title: newTitle,
        description: newDesc,
        task_type: newType,
        priority: newPriority,
        course_id: newCourseId || undefined,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined,
        estimated_minutes: newEstMinutes,
        status: 'todo',
      });
      setShowAddTaskModal(false);
      setNewTitle('');
      setNewDesc('');
      onRefreshTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: 'todo' | 'in_progress' | 'completed') => {
    try {
      await api.updateTask(task.id, { status: newStatus });
      onRefreshTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAssignmentDetails = async () => {
    if (!selectedTask) return;
    try {
      await api.updateTask(selectedTask.id, {
        submission_link: subLink,
        marks,
        feedback,
      });
      onRefreshTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tasks.filter((t) => (filterType === 'all' ? true : t.task_type === filterType));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Tasks & Assignments</h2>
          <p className="text-xs text-neutral-500">Track deadlines, course assignments, marks, and feedback</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 ${viewMode === 'board' ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-100'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-100'}`}
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Task / Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 text-xs">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'study', label: 'Study Tasks' },
          { id: 'assignment', label: 'Assignments' },
          { id: 'exam_prep', label: 'Exam Prep' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1 rounded-full font-medium transition ${
              filterType === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'in_progress', 'completed'] as const).map((col) => {
            const colTasks = filtered.filter((t) => t.status === col);
            const colLabel = col === 'todo' ? 'To Do' : col === 'in_progress' ? 'In Progress' : 'Completed';
            return (
              <div key={col} className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {colLabel}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{colTasks.length}</span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTask(t);
                        setSubLink(t.submission_link || '');
                        setMarks(t.marks || '');
                        setFeedback(t.feedback || '');
                      }}
                      className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:border-indigo-400 cursor-pointer transition text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                          {t.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            t.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-neutral-500 line-clamp-2 text-[11px] leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="capitalize">{t.task_type}</span>
                        {t.due_date && (
                          <span className="font-mono">
                            Due: {new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 text-xs overflow-hidden">
          {filtered.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={t.status === 'completed'}
                  onChange={() => handleUpdateStatus(t, t.status === 'completed' ? 'todo' : 'completed')}
                  className="rounded text-indigo-600"
                />
                <div>
                  <span className={`font-semibold ${t.status === 'completed' ? 'line-through text-neutral-400' : ''}`}>
                    {t.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 block">{t.task_type} • Priority: {t.priority}</span>
                </div>
              </div>
              {t.due_date && (
                <span className="text-[11px] font-mono text-neutral-400">
                  {new Date(t.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Task & Assignment Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {selectedTask.task_type}
                </span>
                <h3 className="font-bold text-base mt-1">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-neutral-400 hover:text-neutral-600 p-1">
                ✕
              </button>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{selectedTask.description}</p>

            {/* Status Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-neutral-500">Status:</span>
              <select
                value={selectedTask.status}
                onChange={(e) => handleUpdateStatus(selectedTask, e.target.value as any)}
                className="p-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Assignment Specific Fields */}
            {selectedTask.task_type === 'assignment' && (
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold block text-neutral-700 dark:text-neutral-300">
                  Assignment Submission & Feedback:
                </span>
                <div>
                  <label className="block text-neutral-500 mb-1">Submission URL (GitHub / Cloud Doc)</label>
                  <input
                    type="url"
                    value={subLink}
                    onChange={(e) => setSubLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-500 mb-1">Marks / Grade</label>
                    <input
                      type="text"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="e.g. 95/100"
                      className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">Feedback / Notes</label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Feedback..."
                      className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveAssignmentDetails}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                >
                  Save Submission Record
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <h3 className="font-semibold text-sm">Create Task or Assignment</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Raft Election Simulator"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                >
                  <option value="study">Study Task</option>
                  <option value="assignment">Assignment / Project</option>
                  <option value="exam_prep">Exam Preparation</option>
                  <option value="revision">Revision Task</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task scope..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
