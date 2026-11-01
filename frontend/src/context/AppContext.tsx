import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NavigationPath, UserProfile, Course, Lesson, LibraryItem, Flashcard, FastRecallEntry } from '../types';
import { initialUser, coursesData, currentClassroomLesson, libraryItemsData, flashcardsData, courseLessonsMap } from '../data/mockData';
import { soundscapeEngine } from '../utils/soundscapes';
import type { SoundscapeType } from '../utils/soundscapes';
import { coursesApi, userApi, activityApi, resourcesApi, flashcardsApi, tasksApi } from '../api';

interface AppContextType {
  currentPath: NavigationPath;
  setCurrentPath: (path: NavigationPath) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  courses: Course[];
  activeCourseId: string;
  setActiveCourseId: (id: string) => void;
  activeLesson: Lesson;
  setActiveLesson: (lesson: Lesson) => void;
  availableLessons: Lesson[];
  selectCourse: (courseId: string) => void;
  selectLesson: (lesson: Lesson) => void;
  activeVideoUrl: string;
  setActiveVideoUrl: (url: string) => void;
  markLessonComplete: (lessonId: string) => void;

  // Sync & Connection status
  isOnline: boolean;
  isSyncing: boolean;
  syncError: string | null;
  refreshBackendData: () => Promise<void>;

  // Timer State
  timerSeconds: number;
  timerRunning: boolean;
  timerMode: 'pomodoro' | 'deep_work' | 'flow';
  setTimerMode: (mode: 'pomodoro' | 'deep_work' | 'flow') => void;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Audio State
  activeSoundscape: SoundscapeType;
  setSoundscape: (type: SoundscapeType) => void;
  soundscapeVolume: number;
  setSoundscapeVolume: (vol: number) => void;

  // Fast Recall Log
  fastRecalls: FastRecallEntry[];
  addFastRecall: (text: string, topic?: string) => void;

  // Library & Flashcards
  libraryItems: LibraryItem[];
  toggleBookmark: (id: string) => void;
  addLibraryItem: (item: Partial<LibraryItem>) => void;
  flashcards: Flashcard[];
  reviewFlashcard: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;

  // Modals & UI
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isFastRecallOpen: boolean;
  setIsFastRecallOpen: (open: boolean) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;

  // Study Room scratchpad & tasks
  sprintTasks: { id: string; text: string; done: boolean }[];
  toggleSprintTask: (id: string) => void;
  addSprintTask: (text: string) => void;
  thoughtNotes: string;
  setThoughtNotes: (notes: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'learnova_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation with URL Hash synchronization
  const [currentPath, setCurrentPathState] = useState<NavigationPath>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validPaths: NavigationPath[] = [
        'home', 'my-learning', 'classroom', 'ai-tutor', 'practice-arena',
        'study-room', 'my-library', 'projects', 'goals-and-progress', 'settings'
      ];
      if (validPaths.includes(hash as NavigationPath)) {
        return hash as NavigationPath;
      }
    }
    return 'home';
  });

  const setCurrentPath = (path: NavigationPath) => {
    setCurrentPathState(path);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${path}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validPaths: NavigationPath[] = [
        'home', 'my-learning', 'classroom', 'ai-tutor', 'practice-arena',
        'study-room', 'my-library', 'projects', 'goals-and-progress', 'settings'
      ];
      if (validPaths.includes(hash as NavigationPath)) {
        setCurrentPathState(hash as NavigationPath);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. User State (Default Maheswar)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : initialUser;
  });

  // 3. Courses & Lessons State
  const [courses, setCourses] = useState<Course[]>(coursesData);
  const [dynamicLessonsMap, setDynamicLessonsMap] = useState<Record<string, Lesson[]>>(courseLessonsMap);
  const [activeCourseId, setActiveCourseId] = useState<string>('ai-pm-llm');
  const [activeLesson, setActiveLesson] = useState<Lesson>(currentClassroomLesson);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    currentClassroomLesson.videoUrl || 'https://www.youtube.com/watch?v=zjkBMFhNj_g'
  );

  // 4. Modals & UI
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFastRecallOpen, setIsFastRecallOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // 5. Connection and Sync Status
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // 6. Sprint Tasks & Focus
  const [sprintTasks, setSprintTasks] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: 'task-1', text: 'Derive Reciprocal Rank Fusion mathematical formula', done: true },
    { id: 'task-2', text: 'Analyze Hull chapter 14 Greek sensitivity graphs', done: true },
    { id: 'task-3', text: 'Run simulation on multi-agent credit risk engine', done: false },
    { id: 'task-4', text: 'Complete RBI Grade B Phase II ESI Mock Section A', done: false },
  ]);

  const [thoughtNotes, setThoughtNotes] = useState<string>(() => {
    return (
      localStorage.getItem(`${STORAGE_KEY}_thought_notes`) ||
      '- Investigate whether SPLADE v3 can be quantized with INT8 on ONNX Runtime.\n- Check if RBI changed SLR requirements in latest MPC meeting minutes.\n- Follow up on Stanford Guest Lecture regarding speculative decoding.'
    );
  });

  // 7. Focus Timer & Audio
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerModeState] = useState<'pomodoro' | 'deep_work' | 'flow'>('pomodoro');
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('none');
  const [soundscapeVolume, setSoundscapeVolumeState] = useState<number>(0.4);

  // 8. Fast Recall Log
  const [fastRecalls, setFastRecalls] = useState<FastRecallEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_recalls`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'rec-1',
            text: 'BM25 + Dense vector Reciprocal Rank Fusion avoids calibration issues across arbitrary distance metrics.',
            topic: 'AI Systems',
            timestamp: 'Today at 18:30',
          },
          {
            id: 'rec-2',
            text: 'Short gamma near expiry creates asymptotic pin risk for market makers forcing pro-cyclical hedging.',
            topic: 'Quant Finance',
            timestamp: 'Yesterday at 21:15',
          },
        ];
  });

  // 9. Library Items
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_library`);
    return saved ? JSON.parse(saved) : libraryItemsData;
  });

  // 10. Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_flashcards`);
    return saved ? JSON.parse(saved) : flashcardsData;
  });

  // Available lessons for active course
  const availableLessons = dynamicLessonsMap[activeCourseId] || [currentClassroomLesson];

  // Refresh backend data function
  const refreshBackendData = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // 1. Fetch courses from backend
      const backendCourses = await coursesApi.getCourses();
      if (backendCourses && backendCourses.length > 0) {
        const mappedCourses: Course[] = backendCourses.map((c) => ({
          id: c.id,
          title: c.title || c.name || '',
          code: c.code || '',
          category: c.category || 'Engineering',
          track: (c.track as any) || (c.category === 'Finance' ? 'Finance' : 'CS'),
          instructor: c.instructor || 'Prof. Learnova',
          description: c.description || '',
          credits: c.credits || 4,
          semester: c.semester || 'Fall 2026',
          accentColor: c.accentColor || '#6366F1',
          progress: c.progress_percentage || 0,
          totalModules: c.modules?.length || 1,
          completedModules: 0,
          currentLesson: c.modules?.[0]?.topics?.[0]?.title || 'Introduction',
          timeLeft: '4h remaining',
          image: '',
        }));
        setCourses(mappedCourses);

        // Build lesson map from modules and topics
        const newLessonMap: Record<string, Lesson[]> = {};
        backendCourses.forEach((c) => {
          const lessonsList: Lesson[] = [];
          if (c.modules) {
            c.modules.forEach((m) => {
              if (m.topics) {
                m.topics.forEach((t) => {
                  lessonsList.push({
                    id: t.id,
                    courseId: c.id,
                    title: t.title,
                    moduleTitle: m.title,
                    duration: `${t.estimated_minutes || 30} min`,
                    completed: t.is_completed || t.status === 'completed',
                    videoUrl: t.video_url || t.videoUrl,
                    keyTakeaways: Array.isArray(t.key_takeaways) ? t.key_takeaways : [],
                    markdownContent: t.markdown_content || t.description || '',
                    quiz: Array.isArray(t.quiz_data) ? t.quiz_data : [],
                  });
                });
              }
            });
          }
          if (lessonsList.length > 0) {
            newLessonMap[c.id] = lessonsList;
          }
        });

        if (Object.keys(newLessonMap).length > 0) {
          setDynamicLessonsMap((prev) => ({ ...prev, ...newLessonMap }));
        }
      }

      // 2. Fetch user profile
      try {
        const profile = await userApi.getCurrentUser();
        if (profile) {
          setUser((prev) => ({
            ...prev,
            name: profile.name || 'Maheswar',
          }));
        }
      } catch (e) {
        console.log('Profile note:', e);
      }

      // 3. Fetch real analytics & streaks
      try {
        const analytics = await activityApi.getAnalytics();
        if (analytics) {
          setUser((prev) => ({
            ...prev,
            streakDays: analytics.streak_days || prev.streakDays,
            deepWorkHoursToday: Number((analytics.study_time_today_minutes / 60).toFixed(1)),
          }));
        }
      } catch (e) {
        console.log('Analytics note:', e);
      }

      // 4. Fetch persistent sprint tasks
      try {
        const bTasks = await tasksApi.getTasks();
        if (bTasks && bTasks.length > 0) {
          setSprintTasks(
            bTasks.map((t) => ({
              id: t.id,
              text: t.title,
              done: t.status === 'completed',
            }))
          );
        }
      } catch (e) {
        console.log('Tasks note:', e);
      }

      // 5. Fetch library resources
      try {
        const bResources = await resourcesApi.getResources();
        if (bResources && bResources.length > 0) {
          const mappedResources: LibraryItem[] = bResources.map((r) => ({
            id: r.id,
            title: r.title,
            author: r.author || 'Prof. Learnova',
            year: '2026',
            category: (r.type === 'video' ? 'Video Lecture' : 'Lecture Note') as any,
            tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : ['Course Material'],
            readTime: `${r.estimated_duration_mins || 20}m`,
            progress: 0,
            rating: 5,
            summary: r.description || '',
            citation: `${r.author || 'Learnova'} (2026). ${r.title}.`,
            bookmarked: !!r.is_favorite,
            fileUrl: r.url || r.file_path,
          }));
          setLibraryItems(mappedResources);
        }
      } catch (e) {
        console.log('Resources note:', e);
      }

      // 6. Fetch FSRS flashcards
      try {
        const bCards = await flashcardsApi.getCards();
        if (bCards && bCards.length > 0) {
          const mappedCards: Flashcard[] = bCards.map((c) => ({
            id: c.id,
            front: c.front,
            back: c.back,
            category: 'Course Review',
            tags: ['FSRS', c.state],
            difficulty: c.stability < 3 ? 'hard' : c.stability > 5 ? 'easy' : 'medium',
            reviewCount: c.reps || 0,
            nextReview: c.interval_days ? `In ${c.interval_days}d` : 'Tomorrow',
          }));
          setFlashcards(mappedCards);
        }
      } catch (e) {
        console.log('Flashcards note:', e);
      }

      setIsOnline(true);
    } catch (err: any) {
      console.log('Backend sync status:', err.message);
      setIsOnline(false);
      setSyncError(err.message || 'Offline mode active');
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial mount load
  useEffect(() => {
    refreshBackendData();
    // Record platform visit
    activityApi.recordVisit(`sess-${Date.now()}`).catch(() => {});
  }, []);

  // Periodic heartbeat every 60 seconds to accurately record active study minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activityApi.sendHeartbeat({ duration_secs: 60, course_id: activeCourseId }).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeCourseId]);

  // Select Course Handler
  const selectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const lessons = dynamicLessonsMap[courseId] || courseLessonsMap[courseId] || [currentClassroomLesson];
    const first = lessons[0];
    if (first) {
      setActiveLesson(first);
      if (first.videoUrl) {
        setActiveVideoUrl(first.videoUrl);
      }
    }
    setCurrentPath('classroom');
  };

  // Select Lesson Handler
  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    if (lesson.videoUrl) {
      setActiveVideoUrl(lesson.videoUrl);
    }
  };

  // Mark Lesson Complete Handler
  const markLessonComplete = async (lessonId: string) => {
    setActiveLesson((prev) => ({ ...prev, completed: true }));
    setUser((prev) => ({
      ...prev,
      weeklyXP: prev.weeklyXP + 120,
      retainedNodes: prev.retainedNodes + 1,
    }));

    try {
      await coursesApi.markLessonComplete(lessonId);
    } catch (e) {
      console.log('Completed locally (offline):', e);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setUser((u) => ({
              ...u,
              weeklyXP: u.weeklyXP + 50,
              deepWorkHoursToday: Number((u.deepWorkHoursToday + 0.4).toFixed(1)),
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const toggleTimer = () => setTimerRunning((prev) => !prev);

  const resetTimer = () => {
    setTimerRunning(false);
    if (timerMode === 'pomodoro') setTimerSeconds(25 * 60);
    else if (timerMode === 'deep_work') setTimerSeconds(50 * 60);
    else setTimerSeconds(90 * 60);
  };

  const setTimerMode = (mode: 'pomodoro' | 'deep_work' | 'flow') => {
    setTimerModeState(mode);
    setTimerRunning(false);
    if (mode === 'pomodoro') setTimerSeconds(25 * 60);
    else if (mode === 'deep_work') setTimerSeconds(50 * 60);
    else setTimerSeconds(90 * 60);
  };

  const setSoundscape = (type: SoundscapeType) => {
    setActiveSoundscape(type);
    soundscapeEngine.play(type);
  };

  const setSoundscapeVolume = (vol: number) => {
    setSoundscapeVolumeState(vol);
    soundscapeEngine.setVolume(vol);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addFastRecall = (text: string, topic: string = 'General Mastery') => {
    const newEntry: FastRecallEntry = {
      id: `rec-${Date.now()}`,
      text,
      topic,
      timestamp: 'Just now',
    };
    setFastRecalls((prev) => [newEntry, ...prev]);
    updateUser({ weeklyXP: user.weeklyXP + 25 });
  };

  const addLibraryItem = async (newItem: Partial<LibraryItem>) => {
    const fullItem: LibraryItem = {
      id: `lib-${Date.now()}`,
      title: newItem.title || 'Untitled Document',
      author: newItem.author || user.name,
      year: newItem.year || '2026',
      category: newItem.category || 'Lecture Note',
      tags: newItem.tags && newItem.tags.length > 0 ? newItem.tags : ['Study Material'],
      readTime: newItem.readTime || '15m',
      progress: 0,
      rating: 5,
      summary: newItem.summary || 'Uploaded learning artifact saved in Second Brain vault.',
      citation: newItem.citation || `${newItem.author || user.name} (2026). ${newItem.title}. Personal LMS Repository.`,
      bookmarked: true,
      fileUrl: newItem.fileUrl,
      fileType: newItem.fileType,
      fileSize: newItem.fileSize,
      fullNotes: newItem.fullNotes || `# ${newItem.title}\nUploaded: ${new Date().toLocaleDateString()}\n\n${newItem.summary || ''}`,
    };
    setLibraryItems((prev) => [fullItem, ...prev]);
    updateUser({ weeklyXP: user.weeklyXP + 50, retainedNodes: user.retainedNodes + 1 });

    try {
      await resourcesApi.createResource({
        title: fullItem.title,
        type: fullItem.category === 'Video Lecture' ? 'video' : 'pdf',
        url: fullItem.fileUrl,
        description: fullItem.summary,
        author: fullItem.author,
        tags: fullItem.tags,
      });
    } catch (e) {
      console.log('Saved resource locally:', e);
    }
  };

  const toggleBookmark = async (id: string) => {
    let newFav = false;
    setLibraryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          newFav = !item.bookmarked;
          return { ...item, bookmarked: newFav };
        }
        return item;
      })
    );
    try {
      await resourcesApi.toggleFavorite(id, newFav);
    } catch {}
  };

  const reviewFlashcard = async (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const ratingMap: Record<string, 1 | 2 | 3 | 4> = {
      again: 1,
      hard: 2,
      good: 3,
      easy: 4,
    };
    const ratingNum = ratingMap[rating] || 3;

    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id === id) {
          const nextInterval =
            rating === 'easy' ? 'In 7 days' : rating === 'good' ? 'In 3 days' : 'Tomorrow';
          return {
            ...card,
            reviewCount: card.reviewCount + 1,
            nextReview: nextInterval,
          };
        }
        return card;
      })
    );
    updateUser({ weeklyXP: user.weeklyXP + (rating === 'again' ? 5 : 20) });

    try {
      await flashcardsApi.reviewCard(id, ratingNum);
    } catch (e) {
      console.log('Reviewed card offline:', e);
    }
  };

  const toggleSprintTask = async (id: string) => {
    let nextStatus = false;
    setSprintTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          nextStatus = !task.done;
          return { ...task, done: nextStatus };
        }
        return task;
      })
    );
    try {
      await tasksApi.updateTask(id, { status: nextStatus ? 'completed' : 'todo' });
    } catch {}
  };

  const addSprintTask = async (text: string) => {
    if (!text.trim()) return;
    const tempId = `task-${Date.now()}`;
    setSprintTasks((prev) => [...prev, { id: tempId, text: text.trim(), done: false }]);
    try {
      const created = await tasksApi.createTask({
        title: text.trim(),
        priority: 'medium',
        status: 'todo',
      });
      if (created.id) {
        setSprintTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: created.id } : t))
        );
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        user,
        updateUser,
        courses,
        activeCourseId,
        setActiveCourseId,
        activeLesson,
        setActiveLesson,
        availableLessons,
        selectCourse,
        selectLesson,
        activeVideoUrl,
        setActiveVideoUrl,
        markLessonComplete,
        isOnline,
        isSyncing,
        syncError,
        refreshBackendData,
        timerSeconds,
        timerRunning,
        timerMode,
        setTimerMode,
        toggleTimer,
        resetTimer,
        activeSoundscape,
        setSoundscape,
        soundscapeVolume,
        setSoundscapeVolume,
        fastRecalls,
        addFastRecall,
        libraryItems,
        toggleBookmark,
        addLibraryItem,
        flashcards,
        reviewFlashcard,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isFastRecallOpen,
        setIsFastRecallOpen,
        isUploadModalOpen,
        setIsUploadModalOpen,
        theme,
        toggleTheme,
        geminiApiKey,
        setGeminiApiKey,
        sprintTasks,
        toggleSprintTask,
        addSprintTask,
        thoughtNotes,
        setThoughtNotes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
