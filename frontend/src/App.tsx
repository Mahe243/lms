import React, { useState, useEffect, useRef } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { StudySessionModal } from './components/StudySessionModal';
import { NotificationsModal } from './components/NotificationsModal';
import { DistractionFreeStudy } from './components/DistractionFreeStudy';

import { DashboardView } from './views/DashboardView';
import { CoursesView } from './views/CoursesView';
import { NotesView } from './views/NotesView';
import { ResourcesView } from './views/ResourcesView';
import { VideoLearningView } from './views/VideoLearningView';
import { AITutorView } from './views/AITutorView';
import { FlashcardsView } from './views/FlashcardsView';
import { QuizzesView } from './views/QuizzesView';
import { ActiveLearningView } from './views/ActiveLearningView';
import { StudyPlannerView } from './views/StudyPlannerView';
import { TasksView } from './views/TasksView';
import { RevisionView } from './views/RevisionView';
import { GoalsView } from './views/GoalsView';
import { DoubtsView } from './views/DoubtsView';
import { AnalyticsView } from './views/AnalyticsView';
import { JournalView } from './views/JournalView';
import { SettingsView } from './views/SettingsView';

import { api } from './api';
import {
  User, Course, Task, TopicRevisionQueueItem, Comment,
  FlashcardDeck, AnalyticsData, StudySession, Notification
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || false;
  });

  // Global Data
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [revisionQueue, setRevisionQueue] = useState<TopicRevisionQueueItem[]>([]);
  const [unresolvedDoubts, setUnresolvedDoubts] = useState<Comment[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals & Navigation Metadata
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [distractionFreeMode, setDistractionFreeMode] = useState(false);
  const [navMeta, setNavMeta] = useState<any>(null);

  // Focus Timer Session State
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [sessionTimerSeconds, setSessionTimerSeconds] = useState(0);

  // Session visit tracking ID
  const sessionVisitIdRef = useRef<string>(`session-${Date.now()}`);

  // Dark Mode application
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Global Keyboard Shortcuts (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all core workspace data
  const loadWorkspaceData = async () => {
    try {
      const [u, c, tk, rq, dbts, dk, notifs, an] = await Promise.all([
        api.getUser().catch(() => null),
        api.getCourses().catch(() => []),
        api.getTasks().catch(() => []),
        api.getRevisionQueue().catch(() => []),
        api.getComments({ doubts_only: true, is_resolved: false }).catch(() => []),
        api.getDecks().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getAnalytics().catch(() => null),
      ]);

      if (u) setUser(u);
      setCourses(c);
      setTasks(tk);
      setRevisionQueue(rq);
      setUnresolvedDoubts(dbts);
      setDecks(dk);
      setNotifications(notifs);
      if (an) setAnalytics(an);

      // Query active study session for persistence
      const active = await api.getActiveSession().catch(() => null);
      if (active) {
        setActiveSession(active);
        const elapsed = Math.floor((Date.now() - new Date(active.start_time).getTime()) / 1000);
        setSessionTimerSeconds(Math.max(active.actual_duration_secs || 0, elapsed));
      }
    } catch (err) {
      console.error('Failed to load workspace data', err);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
    // Record platform visit on load with 30-minute deduplication
    api.recordPlatformVisit(sessionVisitIdRef.current).catch(console.error);
  }, []);

  // Focus Timer interval ticker
  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status === 'running') {
      interval = setInterval(() => {
        setSessionTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  // Active Tab Heartbeat (Only runs when document is visible and focused to exclude idle background tabs)
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !document.hidden) {
        api.recordHeartbeat(30, activeSession?.course_id || undefined, sessionVisitIdRef.current).catch(() => {});
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [activeSession]);

  const handleToggleTimerPause = async () => {
    if (!activeSession) return;
    const newStatus = activeSession.status === 'running' ? 'paused' : 'running';
    try {
      const updated = await api.updateSession(activeSession.id, {
        status: newStatus,
        actual_duration_secs: sessionTimerSeconds,
      });
      setActiveSession(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (tab: string, meta?: any) => {
    setNavMeta(meta || null);
    setCurrentTab(tab as NavTab);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;
  const totalCardsDue = decks.reduce((acc, d) => acc + (d.due_count || 0), 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fcfbf9] text-[#1c1917] dark:bg-[#121214] dark:text-[#f4f4f5] font-sans antialiased">
      {/* Distraction Free Focus Overlay */}
      {distractionFreeMode && (
        <DistractionFreeStudy
          activeSession={activeSession}
          sessionTimerSeconds={sessionTimerSeconds}
          onToggleTimerPause={handleToggleTimerPause}
          onOpenSessionModal={() => setSessionModalOpen(true)}
          onExit={() => setDistractionFreeMode(false)}
        />
      )}

      {/* Left Collapsible Navigation Sidebar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setNavMeta(null);
          setCurrentTab(tab);
        }}
        collapsed={navCollapsed}
        onToggleCollapse={() => setNavCollapsed(!navCollapsed)}
        dueFlashcardsCount={totalCardsDue}
        unresolvedDoubtsCount={unresolvedDoubts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar
          currentTabName={currentTab.replace('-', ' ')}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickCapture={() => setQuickCaptureOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          activeSession={activeSession}
          sessionTimerSeconds={sessionTimerSeconds}
          onToggleTimerPause={handleToggleTimerPause}
          onOpenSessionModal={() => setSessionModalOpen(true)}
          onEnterDistractionFree={() => setDistractionFreeMode(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          streakDays={analytics?.streak_days || 0}
        />

        {/* View Router Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              courses={courses}
              tasks={tasks}
              revisionQueue={revisionQueue}
              unresolvedDoubts={unresolvedDoubts}
              decks={decks}
              analytics={analytics}
              onNavigate={handleNavigate}
              onOpenQuickCapture={() => setQuickCaptureOpen(true)}
              onOpenSessionModal={() => setSessionModalOpen(true)}
              onRefreshData={loadWorkspaceData}
            />
          )}

          {currentTab === 'courses' && (
            <CoursesView
              courses={courses}
              selectedCourseId={navMeta?.courseId}
              onRefreshCourses={loadWorkspaceData}
              onNavigate={handleNavigate}
              onStartFocusSession={(cId, tId) => {
                api.startSession({ course_id: cId, topic_id: tId }).then((s) => {
                  setActiveSession(s);
                  setSessionTimerSeconds(0);
                  loadWorkspaceData();
                });
              }}
            />
          )}

          {currentTab === 'notes' && (
            <NotesView
              courses={courses}
              initialCourseId={navMeta?.courseId}
              initialTopicId={navMeta?.topicId}
              onNavigate={handleNavigate}
              onRefreshNotes={loadWorkspaceData}
            />
          )}

          {currentTab === 'resources' && (
            <ResourcesView
              courses={courses}
              initialCourseId={navMeta?.courseId}
              onNavigate={handleNavigate}
              onRefreshResources={loadWorkspaceData}
            />
          )}

          {currentTab === 'videos' && (
            <VideoLearningView
              courses={courses}
              initialResourceId={navMeta?.resourceId}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'ai-tutor' && (
            <AITutorView
              courses={courses}
              initialCourseId={navMeta?.courseId}
              initialTopicId={navMeta?.topicId}
              initialResourceId={navMeta?.resourceId}
              selectedPassage={navMeta?.selectedPassage}
              initialMessage={navMeta?.initialMessage}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              courses={courses}
              initialMode={navMeta?.mode}
              initialDraftCards={navMeta?.draftCards}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'quizzes' && (
            <QuizzesView
              courses={courses}
              initialDraftQuestions={navMeta?.draftQuestions}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'active-learning' && (
            <ActiveLearningView
              courses={courses}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'planner' && (
            <StudyPlannerView
              courses={courses}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              courses={courses}
              onRefreshTasks={loadWorkspaceData}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'revision' && (
            <RevisionView onNavigate={handleNavigate} />
          )}

          {currentTab === 'goals' && (
            <GoalsView courses={courses} />
          )}

          {currentTab === 'doubts' && (
            <DoubtsView courses={courses} onNavigate={handleNavigate} />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView courses={courses} />
          )}

          {currentTab === 'journal' && (
            <JournalView courses={courses} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onRefreshUser={loadWorkspaceData}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(type, id, url) => {
          if (type === 'course') handleNavigate('courses', { courseId: id });
          else if (type === 'note') handleNavigate('notes', { noteId: id });
          else if (type === 'resource') handleNavigate('resources', { resourceId: id });
          else if (type === 'doubt') handleNavigate('doubts', { doubtId: id });
          else if (type === 'flashcard') handleNavigate('flashcards', { cardId: id });
          else if (type === 'task') handleNavigate('tasks', { taskId: id });
        }}
      />

      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        courses={courses}
        onSuccess={loadWorkspaceData}
      />

      <StudySessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        activeSession={activeSession}
        courses={courses}
        sessionTimerSeconds={sessionTimerSeconds}
        onSessionUpdated={async () => {
          const act = await api.getActiveSession().catch(() => null);
          setActiveSession(act);
          loadWorkspaceData();
        }}
      />

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={loadWorkspaceData}
        onNavigate={(url) => {
          if (url.includes('flashcards')) handleNavigate('flashcards');
          else if (url.includes('tasks')) handleNavigate('tasks');
          else if (url.includes('revision')) handleNavigate('revision');
        }}
      />
    </div>
  );
}

export default App;
