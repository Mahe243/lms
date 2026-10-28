import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Pin, Star, RotateCcw, Trash2, History,
  Search, Sparkles, BookOpen, Tag, Check, Eye, ChevronRight,
  Code, List, CheckSquare, Table, AlertCircle, Bookmark, Copy
} from 'lucide-react';
import { Note, Course, NoteVersion } from '../types';
import { api } from '../api';

interface NotesViewProps {
  courses: Course[];
  initialCourseId?: string;
  initialTopicId?: string;
  onNavigate: (tab: string, meta?: any) => void;
  onRefreshNotes: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  courses,
  initialCourseId,
  initialTopicId,
  onNavigate,
  onRefreshNotes,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(initialCourseId || '');
  const [viewingTrash, setViewingTrash] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Edit fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [needsRevision, setNeedsRevision] = useState(false);
  const [courseId, setCourseId] = useState<string>(initialCourseId || '');
  const [topicId, setTopicId] = useState<string>(initialTopicId || '');

  // Modals & Panels
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<NoteVersion[]>([]);

  // Text selection action popup state
  const [selectedText, setSelectedText] = useState('');
  const [selectionPopupPos, setSelectionPopupPos] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await api.getNotes({
        in_trash: viewingTrash,
        course_id: selectedCourseFilter || undefined,
      });
      setNotes(data);
      if (data.length > 0 && !selectedNote) {
        loadNoteIntoEditor(data[0]);
      } else if (data.length === 0) {
        setSelectedNote(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [viewingTrash, selectedCourseFilter]);

  useEffect(() => {
    api.getNoteTemplates().then(setTemplates).catch(console.error);
  }, []);

  const loadNoteIntoEditor = (n: Note) => {
    setSelectedNote(n);
    setTitle(n.title);
    setContent(n.content);
    setSummary(n.summary || '');
    setIsPinned(n.is_pinned);
    setIsFavorite(n.is_favorite);
    setNeedsRevision(n.needs_revision);
    setCourseId(n.course_id || '');
    setTopicId(n.topic_id || '');
    setSaveStatus('saved');
  };

  // Autosave debounce
  useEffect(() => {
    if (!selectedNote) return;
    if (
      title === selectedNote.title &&
      content === selectedNote.content &&
      summary === (selectedNote.summary || '') &&
      isPinned === selectedNote.is_pinned &&
      isFavorite === selectedNote.is_favorite &&
      needsRevision === selectedNote.needs_revision &&
      courseId === (selectedNote.course_id || '')
    ) {
      return;
    }

    setSaveStatus('dirty');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const updated = await api.updateNote(selectedNote.id, {
          title,
          content,
          summary,
          is_pinned: isPinned,
          is_favorite: isFavorite,
          needs_revision: needsRevision,
          course_id: courseId || undefined,
          topic_id: topicId || undefined,
        });
        setSelectedNote(updated);
        setSaveStatus('saved');
        onRefreshNotes();
      } catch (err) {
        console.error('Failed to autosave note', err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, content, summary, isPinned, isFavorite, needsRevision, courseId, topicId]);

  const handleCreateNote = async (templateContent?: string, templateType?: string) => {
    try {
      const newN = await api.createNote({
        title: 'Untitled Note',
        content: templateContent || '# Untitled Note\n\nWrite your concepts here...',
        summary: '',
        template_type: templateType || 'general',
        course_id: selectedCourseFilter || undefined,
      });
      setShowTemplatesModal(false);
      setNotes((prev) => [newN, ...prev]);
      loadNoteIntoEditor(newN);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCurrentNote = async () => {
    if (!selectedNote) return;
    try {
      await api.deleteNote(selectedNote.id, viewingTrash);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreCurrentNote = async () => {
    if (!selectedNote) return;
    try {
      await api.restoreNote(selectedNote.id);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenVersions = async () => {
    if (!selectedNote) return;
    try {
      const v = await api.getNoteVersions(selectedNote.id);
      setVersions(v);
      setShowVersionHistory(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Text Selection detection in textarea
  const handleTextSelect = () => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end && end - start > 3) {
      const text = el.value.substring(start, end);
      setSelectedText(text);
      // Rough position
      setSelectionPopupPos({ x: 200, y: 120 });
    } else {
      setSelectedText('');
      setSelectionPopupPos(null);
    }
  };

  // Selection actions
  const handleAskAIAboutSelection = (promptType: string = 'explain_simply') => {
    if (!selectedText) return;
    onNavigate('ai-tutor', {
      selectedPassage: selectedText,
      initialMessage: `Please explain this concept from my notes:\n"${selectedText}"`,
      promptType,
      courseId,
    });
    setSelectionPopupPos(null);
  };

  const handleDraftFlashcardFromSelection = async () => {
    if (!selectedText) return;
    try {
      const res = await api.generateDrafts(selectedText, 'flashcards');
      onNavigate('flashcards', { draftCards: res.items, openDrafts: true });
      setSelectionPopupPos(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDraftQuizFromSelection = async () => {
    if (!selectedText) return;
    try {
      const res = await api.generateDrafts(selectedText, 'quiz');
      onNavigate('quizzes', { draftQuestions: res.items, openDrafts: true });
      setSelectionPopupPos(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-[#e8e2d7] dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
      {/* Sidebar: Notes List */}
      <div className="w-72 border-r border-[#e8e2d7] dark:border-neutral-800 flex flex-col bg-[#faf8f5]/60 dark:bg-neutral-900/60">
        <div className="p-3 border-b border-[#e8e2d7] dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              {viewingTrash ? 'Trash Bin' : 'Notes'}
            </span>
            <div className="flex items-center space-x-1">
              {!viewingTrash && (
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  title="Create new note"
                >
                  <Plus size={14} />
                </button>
              )}
              <button
                onClick={() => setViewingTrash(!viewingTrash)}
                className={`p-1 rounded text-neutral-500 hover:text-neutral-800 transition ${
                  viewingTrash ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60' : ''
                }`}
                title={viewingTrash ? 'View active notes' : 'View trash'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Search within notes */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
            />
          </div>

          {/* Course Filter Dropdown */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full text-[11px] px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 p-1.5 space-y-0.5">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">No notes found</div>
          ) : (
            filteredNotes.map((n) => {
              const isSel = selectedNote?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => loadNoteIntoEditor(n)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    isSel
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60'
                      : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {n.title || 'Untitled'}
                    </span>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {n.is_pinned && <Pin size={11} className="text-indigo-600 fill-indigo-600" />}
                      {n.is_favorite && <Star size={11} className="text-amber-500 fill-amber-500" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">
                    {n.summary || n.content.replace(/^#+\s+/gm, '') || 'Empty note'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2">
                    <span className="uppercase font-mono">{n.template_type}</span>
                    <span>{new Date(n.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Note Editor */}
      {!selectedNote ? (
        <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
          Select or create a note to start writing
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Note Top Toolbar */}
          <div className="h-12 border-b border-[#e8e2d7] dark:border-neutral-800 px-5 flex items-center justify-between bg-white dark:bg-neutral-900">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-neutral-400 font-mono">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'dirty' ? 'Unsaved edits' : 'Saved'}
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1 rounded hover:bg-neutral-100 ${isPinned ? 'text-indigo-600' : 'text-neutral-400'}`}
                title="Pin note"
              >
                <Pin size={14} className={isPinned ? 'fill-indigo-600' : ''} />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-1 rounded hover:bg-neutral-100 ${isFavorite ? 'text-amber-500' : 'text-neutral-400'}`}
                title="Favorite"
              >
                <Star size={14} className={isFavorite ? 'fill-amber-500' : ''} />
              </button>
              <button
                onClick={() => setNeedsRevision(!needsRevision)}
                className={`p-1 rounded hover:bg-neutral-100 ${needsRevision ? 'text-rose-500' : 'text-neutral-400'}`}
                title="Flag for revision"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenVersions}
                className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-neutral-100"
                title="Version history"
              >
                <History size={13} />
                <span>History</span>
              </button>
              {viewingTrash ? (
                <button
                  onClick={handleRestoreCurrentNote}
                  className="text-xs text-emerald-600 hover:underline px-2 py-1"
                >
                  Restore Note
                </button>
              ) : (
                <button
                  onClick={handleDeleteCurrentNote}
                  className="text-neutral-400 hover:text-rose-600 p-1 rounded hover:bg-neutral-100"
                  title="Move to trash"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Text Selection Actions Popup (Ask AI, Draft Card, Quiz, Doubt) */}
          {selectedText && selectionPopupPos && (
            <div className="absolute top-16 left-12 z-40 bg-neutral-900 text-white rounded-xl shadow-xl p-1.5 flex items-center space-x-1 text-xs border border-neutral-700 animate-fade-in">
              <button
                onClick={() => handleAskAIAboutSelection('explain_simply')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md hover:bg-neutral-800 text-indigo-300 hover:text-white"
              >
                <Sparkles size={12} />
                <span>Explain</span>
              </button>
              <button
                onClick={() => handleAskAIAboutSelection('example')}
                className="px-2.5 py-1 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white"
              >
                Example
              </button>
              <button
                onClick={handleDraftFlashcardFromSelection}
                className="px-2.5 py-1 rounded-md hover:bg-neutral-800 text-emerald-300 hover:text-white"
              >
                Draft Card
              </button>
              <button
                onClick={handleDraftQuizFromSelection}
                className="px-2.5 py-1 rounded-md hover:bg-neutral-800 text-amber-300 hover:text-white"
              >
                Draft Quiz
              </button>
            </div>
          )}

          {/* Note Editor Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Workspace */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="text-xl font-bold text-neutral-900 dark:text-neutral-100 bg-transparent border-none outline-none placeholder-neutral-400"
              />

              {/* Course association badge */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-neutral-400">Course:</span>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="text-xs p-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <option value="">Standalone / None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Markdown Content Textarea */}
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleTextSelect}
                placeholder="Write formatted markdown notes here (supports headings, code blocks, lists, equations)... Select any passage to ask the AI tutor or create flashcards directly!"
                className="flex-1 min-h-[350px] text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 bg-transparent border-none outline-none resize-none font-mono placeholder-neutral-400"
              />

              {/* Backlinks Footer */}
              {selectedNote.backlinks && selectedNote.backlinks.length > 0 && (
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    Linked from other notes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNote.backlinks.map((bl, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        [[{bl}]]
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary & Meta Drawer */}
            <div className="w-64 border-l border-[#e8e2d7] dark:border-neutral-800 bg-[#faf8f5]/50 dark:bg-neutral-900/50 p-4 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Key 2-3 sentence takeaways..."
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Text Selection Tips
                </span>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Highlight any word or explanation in the editor to pop up AI explanations, worked examples, draft flashcards, or practice quiz questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm">Choose Note Template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleCreateNote(tpl.content, tpl.id)}
                  className="p-3 text-left rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-neutral-50 dark:bg-neutral-800/60 transition group"
                >
                  <span className="font-semibold block text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600">
                    {tpl.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    {tpl.description}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
            <h3 className="font-semibold text-sm">Note Version History</h3>
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {versions.map((ver) => (
                <div key={ver.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">Version {ver.version_number}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(ver.created_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setContent(ver.content);
                      setTitle(ver.title);
                      setSummary(ver.summary);
                      setShowVersionHistory(false);
                    }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Rollback
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
