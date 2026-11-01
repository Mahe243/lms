import React, { useState, useEffect, useRef } from 'react';
import { notesApi } from '../../api/notesApi';

interface ClassroomNotesProps {
  courseId: string;
  topicId: string;
  topicTitle: string;
}

export const ClassroomNotes: React.FC<ClassroomNotesProps> = ({ courseId, topicId, topicTitle }) => {
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceRef = useRef<any>(null);

  // Load note for this topic
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const local = localStorage.getItem(`learnova_notes_${topicId}`);
        if (local) setContent(local);

        const notes = await notesApi.getNotes({ course_id: courseId, topic_id: topicId });
        if (isMounted && notes && notes.length > 0) {
          setContent(notes[0].content);
          setNoteId(notes[0].id);
        }
      } catch (e) {
        console.log('Using offline cached note:', e);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [courseId, topicId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus('saving');
    localStorage.setItem(`learnova_notes_${topicId}`, val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        if (noteId) {
          await notesApi.updateNote(noteId, { content: val });
        } else {
          const created = await notesApi.createNote({
            course_id: courseId,
            topic_id: topicId,
            title: `${topicTitle} Lecture Notes`,
            content: val,
            template_type: 'lecture',
          });
          setNoteId(created.id);
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch {
        setSaveStatus('error');
      }
    }, 900);
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface p-space-md rounded-2xl border border-surface-variant/40 dark:border-dark-border shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface dark:text-dark-text">
          <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
          <span>Companion Lecture Notes</span>
        </div>

        <div className="text-[11px] font-code-sm">
          {saveStatus === 'saving' && (
            <span className="text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 flex items-center gap-1">
              Saved locally
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-on-surface-variant/60 dark:text-dark-text-muted text-[10px]">Autosave active</span>
          )}
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type companion notes, mathematical derivations, or key insights here... (auto-saved)"
        rows={6}
        className="w-full p-3 rounded-xl bg-surface-container-low dark:bg-dark-surface-2 border border-surface-variant/30 text-xs font-mono text-on-surface dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary resize-y leading-relaxed"
      />
    </div>
  );
};
