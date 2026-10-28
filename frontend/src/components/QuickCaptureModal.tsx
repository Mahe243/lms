import React, { useState } from 'react';
import { X, Link2, FileText, HelpCircle, CheckSquare, Layers, Sparkles } from 'lucide-react';
import { api } from '../api';
import { Course } from '../types';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSuccess: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSuccess,
}) => {
  const [captureType, setCaptureType] = useState<'link' | 'note' | 'doubt' | 'task' | 'flashcard'>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !url.trim()) return;
    setLoading(true);
    setError('');

    try {
      await api.quickCapture({
        capture_type: captureType,
        title: title || url,
        content,
        url: url || undefined,
        course_id: courseId || undefined,
      });
      setTitle('');
      setContent('');
      setUrl('');
      setCourseId('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to capture item');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'note', label: 'Note', icon: FileText, color: 'text-amber-500' },
    { id: 'link', label: 'Link / Resource', icon: Link2, color: 'text-blue-500' },
    { id: 'doubt', label: 'Doubt / Question', icon: HelpCircle, color: 'text-rose-500' },
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-purple-500' },
    { id: 'flashcard', label: 'Draft Card', icon: Layers, color: 'text-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-indigo-600" />
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Quick Capture to Workspace
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={18} />
          </button>
        </div>

        {/* Capture Type Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 p-1.5 space-x-1">
          {types.map((t) => {
            const Icon = t.icon;
            const isSel = captureType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCaptureType(t.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSel
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Icon size={14} className={t.color} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded">{error}</div>}

          {captureType === 'link' && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Resource URL (Video, Article, Website)
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://arxiv.org/..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {captureType === 'link' ? 'Title (Optional)' : captureType === 'doubt' ? 'What is your doubt or question?' : 'Title'}
            </label>
            <input
              type="text"
              required={captureType !== 'link'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                captureType === 'doubt'
                  ? 'e.g. Why does Raft use randomized election timeouts?'
                  : captureType === 'flashcard'
                  ? 'Front of card (Question)'
                  : 'Title or concept'
              }
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {captureType === 'flashcard' ? 'Back of card (Answer & Explanation)' : 'Additional Notes / Context'}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={captureType === 'flashcard' ? 'Answer...' : 'Write quick details...'}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Associate with Course (Optional)
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500"
            >
              <option value="">Uncategorised Inbox</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save to Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
