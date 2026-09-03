import React, { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { FloatingParticles } from './components/FloatingParticles';
import { HomeView } from './components/HomeView';

function MainAppContent() {
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 selection:bg-purple-200 selection:text-purple-900 flex flex-col">
      <main className="flex-1 w-full flex flex-col">
        <HomeView onOpenBackup={() => setIsBackupOpen(true)} />
      </main>

      {/* Backup & Restore Modal */}
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
