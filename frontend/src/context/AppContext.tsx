import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NavigationPath, UserProfile, Course, Lesson, LibraryItem, Flashcard, FastRecallEntry } from '../types';
import { initialUser, coursesData, currentClassroomLesson, libraryItemsData, flashcardsData } from '../data/mockData';
import { soundscapeEngine } from '../utils/soundscapes';
import type { SoundscapeType } from '../utils/soundscapes';

interface AppContextType {
  currentPath: NavigationPath;
  setCurrentPath: (path: NavigationPath) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  courses: Course[];
  activeCourseId: string;
  setActiveCourseId: (id: string) => void;
  activeLesson: Lesson;
  markLessonComplete: (lessonId: string) => void;
  
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
  flashcards: Flashcard[];
  reviewFlashcard: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;

  // Modals & UI
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isFastRecallOpen: boolean;
  setIsFastRecallOpen: (open: boolean) => void;
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

const STORAGE_KEY = 'learnova_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<NavigationPath>('home');
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [courses] = useState<Course[]>(coursesData);
  const [activeCourseId, setActiveCourseId] = useState<string>('ai-pm-llm');
  const [activeLesson, setActiveLesson] = useState<Lesson>(currentClassroomLesson);

  // Focus Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerModeState] = useState<'pomodoro' | 'deep_work' | 'flow'>('pomodoro');

  // Soundscape
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('none');
  const [soundscapeVolume, setSoundscapeVolumeState] = useState<number>(0.4);

  // Fast Recall
  const [fastRecalls, setFastRecalls] = useState<FastRecallEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_recalls`);
    return saved ? JSON.parse(saved) : [
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

  // Library & Flashcards
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_library`);
    return saved ? JSON.parse(saved) : libraryItemsData;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_flashcards`);
    return saved ? JSON.parse(saved) : flashcardsData;
  });

  // Sprint Tasks & Thought Parker
  const [sprintTasks, setSprintTasks] = useState([
    { id: 'task-1', text: 'Derive Reciprocal Rank Fusion mathematical formula', done: true },
    { id: 'task-2', text: 'Analyze Hull chapter 14 Greek sensitivity graphs', done: true },
    { id: 'task-3', text: 'Run simulation on multi-agent credit risk engine', done: false },
    { id: 'task-4', text: 'Complete RBI Grade B Phase II ESI Mock Section A', done: false },
  ]);

  const [thoughtNotes, setThoughtNotes] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_thought_notes`) || 
      "- Investigate whether SPLADE v3 can be quantized with INT8 on ONNX Runtime.\n- Check if RBI changed SLR requirements in latest MPC meeting minutes.\n- Follow up on Stanford Guest Lecture regarding speculative decoding.";
  });

  // UI Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFastRecallOpen, setIsFastRecallOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_gemini_key`) || '';
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_recalls`, JSON.stringify(fastRecalls));
  }, [fastRecalls]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_library`, JSON.stringify(libraryItems));
  }, [libraryItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_flashcards`, JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_thought_notes`, thoughtNotes);
  }, [thoughtNotes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gemini_key`, geminiApiKey);
  }, [geminiApiKey]);

  // Dark Mode class toggle on <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global Keyboard shortcuts (⌘K or Ctrl+K for command palette)
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

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Award XP on timer completion
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

  const markLessonComplete = (_lessonId: string) => {
    setActiveLesson((prev) => ({ ...prev, completed: true }));
    updateUser({
      weeklyXP: user.weeklyXP + 120,
      retainedNodes: user.retainedNodes + 1,
    });
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

  const toggleBookmark = (id: string) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
    );
  };

  const reviewFlashcard = (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
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
  };

  const toggleSprintTask = (id: string) => {
    setSprintTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const addSprintTask = (text: string) => {
    if (!text.trim()) return;
    setSprintTasks((prev) => [...prev, { id: `task-${Date.now()}`, text: text.trim(), done: false }]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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
        markLessonComplete,
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
        flashcards,
        reviewFlashcard,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isFastRecallOpen,
        setIsFastRecallOpen,
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
