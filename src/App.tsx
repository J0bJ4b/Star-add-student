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
import { ClassroomsView } from './components/ClassroomsView';
import { ActivitiesView } from './components/ActivitiesView';
import { AttendanceView } from './components/AttendanceView';
import { BadgesView } from './components/BadgesView';
import { ReportsView } from './components/ReportsView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { ProjectorModal } from './components/ProjectorModal';
import { ChangelogModal } from './components/ChangelogModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 selection:bg-purple-200 selection:text-purple-900 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          {currentTab === 'dashboard' && (
            <HomeView 
              onOpenBackup={() => setIsBackupOpen(true)} 
              onSelectTab={(tab) => setCurrentTab(tab)}
            />
          )}
          {currentTab === 'activities' && <ActivitiesView />}
          {currentTab === 'attendance' && <AttendanceView />}
          {currentTab === 'students' && <StudentsView />}
          {currentTab === 'classrooms' && (
            <ClassroomsView onNavigateTab={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'add-star' && <AddStarView />}
          {currentTab === 'leaderboard' && <LeaderboardView />}
          {currentTab === 'rewards' && <RewardsView />}
          {currentTab === 'badges' && <BadgesView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'sheets' && <GoogleSheetsView />}
          {currentTab === 'history' && <HistoryView />}
        </main>
      </div>

      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
      <ProjectorModal />
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
