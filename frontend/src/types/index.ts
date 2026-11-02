export type NavigationPath = 
  | 'home'
  | 'my-learning'
  | 'classroom'
  | 'ai-tutor'
  | 'practice-arena'
  | 'study-room'
  | 'my-library'
  | 'projects'
  | 'goals-and-progress'
  | 'settings'
  | 'market';

export interface UserProfile {
  name: string;
  avatar: string;
  program: string;
  cohort: string;
  term: string;
  week: string;
  streakDays: number;
  streakTopPercent?: number;
  deepWorkHoursToday: number;
  deepWorkTargetToday: number;
  weeklyXP: number;
  retainedNodes: number;
  level: number;
  coins?: number;
}

export interface Course {
  id: string;
  title: string;
  track: 'MBA' | 'CS' | 'Finance';
  code: string;
  instructor: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  currentLesson: string;
  timeLeft: string;
  image: string;
  accentColor: string;
  description: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  moduleTitle: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  keyTakeaways: string[];
  markdownContent: string;
  codeSnippet?: {
    language: string;
    code: string;
    description: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  latex?: string[];
  code?: string;
  quizDrill?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  nextReview: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  year?: string;
  category: 'Book' | 'Research Paper' | 'Lecture Note' | 'Cheat Sheet' | 'Case Study' | 'Video Lecture';
  tags: string[];
  readTime: string;
  progress: number;
  rating: number;
  coverImage?: string;
  summary: string;
  fullNotes?: string;
  citation: string;
  bookmarked: boolean;
  fileUrl?: string;
  fileType?: string;
  fileSize?: string;
}

export interface MockExam {
  id: string;
  title: string;
  totalQuestions: number;
  durationMinutes: number;
  sections: {
    name: string;
    questions: {
      id: number;
      text: string;
      options: string[];
      correctAnswer?: number;
      explanation: string;
      topic: string;
      difficulty: 'Easy' | 'Moderate' | 'Challenging';
    }[];
  }[];
}

export interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  completionPercent: number;
  prdContent: {
    overview: string;
    problemStatement: string;
    architectureOverview: string;
    slaSpecs: string[];
    mermaidDiagram?: string;
  };
  pythonCode: string;
  simulationConfig: {
    applicantName: string;
    monthlyIncome: number;
    creditScore: number;
    existingDebt: number;
    requestedLoan: number;
  };
  investmentMemo: {
    executiveSummary: string;
    marketOpportunity: string;
    riskMitigation: string[];
    score: number;
  };
}

export interface FastRecallEntry {
  id: string;
  text: string;
  topic: string;
  timestamp: string;
}
