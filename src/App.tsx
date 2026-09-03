import React, { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import { TabType } from './types';
import { Navbar } from './components/Navbar';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { FloatingParticles } from './components/FloatingParticles';
import { HomeView } from './components/HomeView';

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
          {currentTab !== 'dashboard' && (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm mt-10">
              <h2 className="text-2xl font-black text-slate-400 mb-2">อยู่ระหว่างการพัฒนา</h2>
              <p className="text-slate-500">
                คุณสามารถจัดการข้อมูลหลัก (มอบดาว จัดอันดับ เพิ่มนักเรียน) ได้ที่หน้า "หน้าแรก" ทั้งหมดแล้ว!
              </p>
              <button 
                onClick={() => setCurrentTab('dashboard')}
                className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors"
              >
                กลับไปหน้าแรก
              </button>
            </div>
          )}
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
