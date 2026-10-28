import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Plus, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight, BookOpen, Layers, CheckSquare
} from 'lucide-react';
import { CalendarEvent, Course } from '../types';
import { api } from '../api';

interface StudyPlannerViewProps {
  courses: Course[];
  onNavigate: (tab: string, meta?: any) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  courses,
  onNavigate,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Event Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('session');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');

  const fetchEvents = async () => {
    try {
      const ev = await api.getCalendarEvents();
      setEvents(ev);
      const conf = await fetch('/api/planner/conflicts').then((r) => r.json());
      setConflicts(conf);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const startIso = new Date(`${newDate}T${newStartTime}:00Z`).toISOString();
      const endIso = new Date(`${newDate}T${newEndTime}:00Z`).toISOString();

      await api.createCalendarEvent({
        title: newTitle,
        event_type: newType as any,
        course_id: newCourseId || undefined,
        start_time: startIso,
        end_time: endIso,
      });

      setShowAddEventModal(false);
      setNewTitle('');
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'session': return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200';
      case 'exam': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200';
      case 'revision': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200';
      case 'flashcard': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200';
      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Study Planner & Calendar</h2>
          <p className="text-xs text-neutral-500">Schedule deep focus sessions, revisions, exam prep, and prevent burnout</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
            {(['month', 'week', 'day'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded capitalize font-medium transition ${
                  viewMode === m
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-xs"
          >
            <Plus size={14} />
            <span>Schedule Block</span>
          </button>
        </div>
      </div>

      {/* Workload Conflict Warnings */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1 text-xs">
          <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle size={15} />
            <span>Workload Scheduling Conflict Detected</span>
          </div>
          {conflicts.map((c, i) => (
            <p key={i} className="text-amber-700 dark:text-amber-400 pl-6">
              • {c.warning}
            </p>
          ))}
        </div>
      )}

      {/* Events Agenda / Schedule List */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e8e2d7] dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-semibold text-sm">Upcoming Scheduled Study Blocks</h3>
        {events.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">No events scheduled.</div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {events.map((ev) => (
              <div key={ev.id} className="py-3 flex items-start justify-between text-xs">
                <div className="flex items-start space-x-3">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getEventBadgeClass(ev.event_type)}`}>
                    {ev.event_type}
                  </span>
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      {ev.title}
                    </span>
                    <span className="text-[11px] text-neutral-400 flex items-center space-x-1 mt-0.5 font-mono">
                      <Clock size={11} />
                      <span>
                        {new Date(ev.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Schedule Event */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs">
            <h3 className="font-semibold text-sm">Schedule Learning Block</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Block Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Deep Work: Raft Coding"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  >
                    <option value="session">Study Session</option>
                    <option value="revision">Topic Revision</option>
                    <option value="flashcard">Flashcards</option>
                    <option value="exam">Exam Date</option>
                    <option value="assignment">Assignment Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Save Schedule Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
