import React, { useState, useEffect } from 'react';
import {
  HelpCircle, CheckCircle2, RotateCcw, Sparkles, Plus,
  MessageSquare, Trash2, ChevronRight, Pin
} from 'lucide-react';
import { Comment, Course } from '../types';
import { api } from '../api';

interface DoubtsViewProps {
  courses: Course[];
  onNavigate: (tab: string, meta?: any) => void;
}

export const DoubtsView: React.FC<DoubtsViewProps> = ({ courses, onNavigate }) => {
  const [doubts, setDoubts] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterResolved, setFilterResolved] = useState<boolean>(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Comment | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showAddDoubtModal, setShowAddDoubtModal] = useState(false);
  const [newDoubtText, setNewDoubtText] = useState('');
  const [newDoubtPriority, setNewDoubtPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCourseId, setNewCourseId] = useState('');

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const data = await api.getComments({
        doubts_only: true,
        is_resolved: filterResolved ? undefined : false,
      });
      setDoubts(data);
      if (data.length > 0 && !selectedDoubt) {
        setSelectedDoubt(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [filterResolved]);

  const handleToggleResolve = async (d: Comment) => {
    try {
      await api.updateComment(d.id, {
        is_resolved: !d.is_resolved,
        resolution_notes: resolutionNote || d.resolution_notes,
      });
      fetchDoubts();
      if (selectedDoubt && selectedDoubt.id === d.id) {
        setSelectedDoubt((prev: any) => ({ ...prev, is_resolved: !d.is_resolved }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtText.trim()) return;
    try {
      await api.createComment({
        target_type: 'course',
        target_id: newCourseId || 'general',
        course_id: newCourseId || undefined,
        text: newDoubtText,
        comment_type: 'doubt',
        priority: newDoubtPriority,
      });
      setShowAddDoubtModal(false);
      setNewDoubtText('');
      fetchDoubts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Central Doubt Inbox</h2>
          <p className="text-xs text-neutral-500">Track conceptual sticking points and clear doubts with grounded AI assistance</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterResolved(!filterResolved)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              filterResolved
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 border-neutral-300 dark:border-neutral-700'
            }`}
          >
            {filterResolved ? 'Showing All Doubts' : 'Showing Unresolved Only'}
          </button>
          <button
            onClick={() => setShowAddDoubtModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-xs"
          >
            <Plus size={14} />
            <span>Record Doubt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            Questions Feed
          </span>
          {doubts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
              No doubts recorded.
            </div>
          ) : (
            doubts.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedDoubt(d);
                  setResolutionNote(d.resolution_notes || '');
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-xs transition ${
                  selectedDoubt?.id === d.id
                    ? 'bg-white dark:bg-neutral-900 border-indigo-500 shadow-sm'
                    : 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      d.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {d.priority} Priority
                  </span>
                  {d.is_resolved ? (
                    <span className="text-emerald-600 font-bold text-[10px]">Resolved</span>
                  ) : (
                    <span className="text-rose-500 font-bold text-[10px]">Unresolved</span>
                  )}
                </div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-2 line-clamp-2">
                  {d.text}
                </p>
                <span className="text-[10px] text-neutral-400 mt-2 block">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right Detail & Solver */}
        {selectedDoubt && (
          <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                  {selectedDoubt.is_resolved ? 'Resolved Doubt' : 'Active Conceptual Inquiry'}
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-2 leading-relaxed">
                  {selectedDoubt.text}
                </h3>
              </div>
              <button
                onClick={() => handleToggleResolve(selectedDoubt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  selectedDoubt.is_resolved
                    ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>{selectedDoubt.is_resolved ? 'Reopen Doubt' : 'Mark Resolved'}</span>
              </button>
            </div>

            {/* AI Tutor Action */}
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-2">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block flex items-center space-x-1.5">
                <Sparkles size={14} />
                <span>Ask AI Tutor to Clear this Doubt:</span>
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                Sends this doubt into the AI tutor with your course notes and reference papers as grounded context.
              </p>
              <button
                onClick={() =>
                  onNavigate('ai-tutor', {
                    doubtId: selectedDoubt.id,
                    courseId: selectedDoubt.course_id,
                    initialMessage: `I need help clearing this doubt: "${selectedDoubt.text}". Can you explain step by step?`,
                  })
                }
                className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Launch AI Tutor for this Doubt →
              </button>
            </div>

            {/* Resolution Notes */}
            <div className="space-y-2 pt-2">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Personal Resolution Notes & Insights:
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="What was the key clarification or answer that solved this doubt?"
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleToggleResolve(selectedDoubt)}
                className="px-3 py-1 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded font-medium text-[11px]"
              >
                Save Resolution Notes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Doubt */}
      {showAddDoubtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <h3 className="font-semibold text-sm">Record Inquiry or Doubt</h3>
            <form onSubmit={handleCreateDoubt} className="space-y-3">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Doubt Statement</label>
                <textarea
                  rows={3}
                  required
                  value={newDoubtText}
                  onChange={(e) => setNewDoubtText(e.target.value)}
                  placeholder="e.g. Why does candidate RequestVote reject votes if last log term is smaller?"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Priority</label>
                <select
                  value={newDoubtPriority}
                  onChange={(e) => setNewDoubtPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoubtModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Save Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
