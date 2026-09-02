import React, { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import { TabType } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AddStarView } from './components/AddStarView';
import { StudentsView } from './components/StudentsView';
import { LeaderboardView } from './components/LeaderboardView';
import { RewardsView } from './components/RewardsView';
import { HistoryView } from './components/HistoryView';
import { BackupRestoreModal } from './components/BackupRestoreModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 selection:bg-purple-200 selection:text-purple-900 flex flex-col">
      {/* Navigation (Sidebar on Desktop, TopBar on all screens) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar width on lg screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'add-star' && <AddStarView />}
          {currentTab === 'students' && <StudentsView />}
          {currentTab === 'leaderboard' && <LeaderboardView />}
          {currentTab === 'rewards' && <RewardsView />}
          {currentTab === 'history' && <HistoryView />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center space-x-2">
              <span className="text-amber-500 font-bold font-heading">⭐ Star Good Deeds</span>
              <span>— ระบบสะสมดาวความดีสำหรับห้องเรียนประถมศึกษา</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <span>ระบบออฟไลน์พร้อมซิงค์ Firestore Cloud</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
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
