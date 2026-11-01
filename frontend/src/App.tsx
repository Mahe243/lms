import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickRecallModal } from './components/layout/QuickRecallModal';
import { UploadModal } from './components/layout/UploadModal';
import { StudyBotWidget } from './components/layout/StudyBotWidget';
import { HomeDashboard } from './components/views/HomeDashboard';
import { ClassroomView } from './components/views/ClassroomView';
import { AITutorView } from './components/views/AITutorView';
import { PracticeArenaView } from './components/views/PracticeArenaView';
import { StudyRoomView } from './components/views/StudyRoomView';
import { ProjectsView } from './components/views/ProjectsView';
import { LibraryView } from './components/views/LibraryView';
import { GoalsProgressView } from './components/views/GoalsProgressView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const { currentPath } = useApp();

  const renderActiveView = () => {
    switch (currentPath) {
      case 'home':
        return <HomeDashboard />;
      case 'my-learning':
      case 'classroom':
        return <ClassroomView />;
      case 'ai-tutor':
        return <AITutorView />;
      case 'practice-arena':
        return <PracticeArenaView />;
      case 'study-room':
        return <StudyRoomView />;
      case 'projects':
        return <ProjectsView />;
      case 'my-library':
        return <LibraryView />;
      case 'goals-and-progress':
        return <GoalsProgressView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-canvas text-on-surface dark:text-dark-text transition-colors duration-200">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <Header />

        {/* Dynamic Canvas View */}
        <main className="relative pt-16 flex-1 w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <QuickRecallModal />
      <UploadModal />
      <StudyBotWidget />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
