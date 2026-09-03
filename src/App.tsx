import React, { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import { TabType } from './types';
import { Navbar } from './components/Navbar';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { FloatingParticles } from './components/FloatingParticles';
import { HomeView } from './components/HomeView';
import { StudentsView } from './components/StudentsView';
import { AddStarView } from './components/AddStarView';
import { LeaderboardView } from './components/LeaderboardView';
import { RewardsView } from './components/RewardsView';
import { HistoryView } from './components/HistoryView';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 selection:bg-orange-200 selection:text-orange-900 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          {currentTab === 'dashboard' && (
            <HomeView onOpenBackup={() => setIsBackupOpen(true)} />
          )}
          {currentTab === 'students' && <StudentsView />}
          {currentTab === 'add-star' && <AddStarView />}
          {currentTab === 'leaderboard' && <LeaderboardView />}
          {currentTab === 'rewards' && <RewardsView />}
          {currentTab === 'history' && <HistoryView />}
        </main>
      </div>

      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
      <FloatingParticles />
    </div>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <MainAppContent />
    </StudentProvider>
  );
}
