import React from 'react';
import {
  LayoutDashboard, BookOpen, FileText, Folder as FolderIcon,
  Video, Sparkles, Layers, CheckSquare, BrainCircuit, Calendar,
  CheckCircle2, RotateCcw, Target, HelpCircle, BarChart3, BookMarked,
  Settings, ChevronLeft, ChevronRight, Play, Moon, Sun, Search, Plus
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'courses'
  | 'notes'
  | 'resources'
  | 'videos'
  | 'ai-tutor'
  | 'flashcards'
  | 'quizzes'
  | 'active-learning'
  | 'planner'
  | 'tasks'
  | 'revision'
  | 'goals'
  | 'doubts'
  | 'analytics'
  | 'journal'
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  dueFlashcardsCount?: number;
  unresolvedDoubtsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  dueFlashcardsCount = 0,
  unresolvedDoubtsCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'resources', label: 'Resource Library', icon: FolderIcon },
    { id: 'videos', label: 'Video Learning', icon: Video },
    { id: 'ai-tutor', label: 'AI Tutor', icon: Sparkles, badge: 'AI' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, badgeCount: dueFlashcardsCount },
    { id: 'quizzes', label: 'Practice & Quizzes', icon: CheckSquare },
    { id: 'active-learning', label: 'Active Learning', icon: BrainCircuit },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'tasks', label: 'Tasks & Assignments', icon: CheckCircle2 },
    { id: 'revision', label: 'Topic Revision', icon: RotateCcw },
    { id: 'goals', label: 'Goals & Habits', icon: Target },
    { id: 'doubts', label: 'Doubt Inbox', icon: HelpCircle, badgeCount: unresolvedDoubtsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'journal', label: 'Learning Journal', icon: BookMarked },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen border-r border-[#e8e2d7]/80 dark:border-neutral-800/80 bg-[#f7f5f0]/90 dark:bg-[#18181b]/90 backdrop-blur-xl flex flex-col transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#e8e2d7] dark:border-neutral-800">
        {!collapsed && (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              LMS
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Personal LMS
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Independent Workspace
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm mx-auto">
            L
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg px-2.5 py-2 text-xs font-medium transition group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Icon
                size={16}
                className={`flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100'
                }`}
              />
              {!collapsed && (
                <span className="ml-3 truncate text-left flex-1">{item.label}</span>
              )}

              {!collapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold tracking-wider ml-1 uppercase ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User / Workspace Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[#e8e2d7] dark:border-neutral-800 bg-[#f4f1eb]/50 dark:bg-[#151517]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold">
              ME
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                Private Learner
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                Offline Local SQLite
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
