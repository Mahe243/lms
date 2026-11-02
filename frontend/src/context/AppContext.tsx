import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  NavigationPath,
  UserProfile,
  Course,
  Lesson,
  LibraryItem,
  Flashcard,
  FastRecallEntry,
} from '../types';
import {
  initialUser,
  coursesData,
  currentClassroomLesson,
  libraryItemsData,
  flashcardsData,
} from '../data/mockData';
import { soundscapeEngine } from '../utils/soundscapes';
import type { SoundscapeType } from '../utils/soundscapes';

export interface GameWalletState {
  coin_balance: number;
  total_xp: number;
  level: number;
  next_level_xp: number;
  current_level_xp: number;
  streak_days: number;
  total_active_days: number;
}

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
  markLessonComplete: (lessonId: string) => void;

  // Video State
  activeVideoUrl: string;
  setActiveVideoUrl: (url: string) => void;

  // Timer State
  timerSeconds: number;
  timerRunning: boolean;
  timerMode: 'pomodoro' | 'deep_work' | 'flow';
  setTimerMode: (mode: 'pomodoro' | 'deep_work' | 'flow') => void;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Audio State (Default Sound is OFF)
  isSoundEnabled: boolean;
  toggleSound: () => void;
  activeSoundscape: SoundscapeType;
  setSoundscape: (type: SoundscapeType) => void;
  soundscapeVolume: number;
  setSoundscapeVolume: (vol: number) => void;

  // Game & Calm Mode
  isCalmMode: boolean;
  toggleCalmMode: () => void;
  reducedMotion: boolean;

  // Game Wallet & Real Stats
  gameWallet: GameWalletState;
  refreshWallet: () => Promise<void>;

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
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    currentClassroomLesson.videoUrl || 'https://www.youtube.com/watch?v=kCc8FmEb1nY'
  );

  // Focus Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerModeState] = useState<'pomodoro' | 'deep_work' | 'flow'>('pomodoro');

  // Sound Preferences (OFF by default)
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sound_enabled`);
    return saved ? JSON.parse(saved) : false;
  });
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('none');
  const [soundscapeVolume, setSoundscapeVolumeState] = useState<number>(0.4);

  // Game & Calm Mode
  const [isCalmMode, setIsCalmMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_calm_mode`);
    return saved ? JSON.parse(saved) : false;
  });

  // System Reduced Motion Preference
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Game Wallet & Real Stats
  const [gameWallet, setGameWallet] = useState<GameWalletState>({
    coin_balance: 0,
    total_xp: 0,
    level: 1,
    next_level_xp: 100,
    current_level_xp: 0,
    streak_days: 0,
    total_active_days: 0,
  });

  // Fast Recall
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
    return (
      localStorage.getItem(`${STORAGE_KEY}_thought_notes`) ||
      '- Investigate whether SPLADE v3 can be quantized with INT8 on ONNX Runtime.\n- Check if RBI changed SLR requirements in latest MPC meeting minutes.\n- Follow up on Stanford Guest Lecture regarding speculative decoding.'
    );
  });

  // UI Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFastRecallOpen, setIsFastRecallOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_gemini_key`) || '';
  });

  // Detect and listen to system prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync reduced-motion class on documentElement
  useEffect(() => {
    if (reducedMotion || isCalmMode) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion, isCalmMode]);

  // Sync calm-mode class on documentElement
  useEffect(() => {
    if (isCalmMode) {
      document.documentElement.classList.add('calm-mode');
    } else {
      document.documentElement.classList.remove('calm-mode');
    }
    localStorage.setItem(`${STORAGE_KEY}_calm_mode`, JSON.stringify(isCalmMode));
  }, [isCalmMode]);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sound_enabled`, JSON.stringify(isSoundEnabled));
    if (!isSoundEnabled) {
      soundscapeEngine.stop();
      setActiveSoundscape('none');
    }
  }, [isSoundEnabled]);

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

  // Fetch real game wallet & stats from backend
  const refreshWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/game/wallet');
      if (res.ok) {
        const data = await res.json();
        setGameWallet(data);
        setUser((prev) => ({
          ...prev,
          weeklyXP: data.total_xp,
          level: data.level,
          coins: data.coin_balance,
          streakDays: data.streak_days || prev.streakDays,
        }));
      }
    } catch {
      // Backend not yet available or offline; keep deterministic local values
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

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
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
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

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  const setSoundscape = (type: SoundscapeType) => {
    if (!isSoundEnabled && type !== 'none') {
      setIsSoundEnabled(true);
    }
    setActiveSoundscape(type);
    if (isSoundEnabled || type === 'none') {
      soundscapeEngine.play(type);
    }
  };

  const setSoundscapeVolume = (vol: number) => {
    setSoundscapeVolumeState(vol);
    soundscapeEngine.setVolume(vol);
  };

  const toggleCalmMode = () => {
    setIsCalmMode((prev) => !prev);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const markLessonComplete = (_lessonId: string) => {
    setActiveLesson((prev) => ({ ...prev, completed: true }));
  };

  const addFastRecall = (text: string, topic: string = 'General Mastery') => {
    const newEntry: FastRecallEntry = {
      id: `rec-${Date.now()}`,
      text,
      topic,
      timestamp: 'Just now',
    };
    setFastRecalls((prev) => [newEntry, ...prev]);
  };

  const toggleBookmark = (id: string) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
    );
  };

  const addLibraryItem = (newItem: Partial<LibraryItem>) => {
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
      citation: newItem.citation || `${newItem.author || user.name} (2026). ${newItem.title}.`,
      bookmarked: true,
      fileUrl: newItem.fileUrl,
      fileType: newItem.fileType,
      fileSize: newItem.fileSize,
      fullNotes: newItem.fullNotes,
    };
    setLibraryItems((prev) => [fullItem, ...prev]);
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
  };

  const toggleSprintTask = (id: string) => {
    setSprintTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const addSprintTask = (text: string) => {
    if (!text.trim()) return;
    setSprintTasks((prev) => [
      ...prev,
      { id: `task-${Date.now()}`, text: text.trim(), done: false },
    ]);
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
        setActiveLesson,
        markLessonComplete,
        activeVideoUrl,
        setActiveVideoUrl,
        timerSeconds,
        timerRunning,
        timerMode,
        setTimerMode,
        toggleTimer,
        resetTimer,
        isSoundEnabled,
        toggleSound,
        activeSoundscape,
        setSoundscape,
        soundscapeVolume,
        setSoundscapeVolume,
        isCalmMode,
        toggleCalmMode,
        reducedMotion,
        gameWallet,
        refreshWallet,
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
