import React, { useState } from 'react';
import { 
  Home, Star, Users, Award, Gift, History, Menu, X, Database, Volume2, VolumeX, GraduationCap,
  Sparkles, CheckCircle2, BookmarkCheck, FileText, Monitor, DownloadCloud
} from 'lucide-react';
import { TabType } from '../types';
import { useStudents } from '../context/StudentContext';
import { sounds } from '../lib/audio';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab, onOpenBackup }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeClassroom, setActiveClassroom, classrooms, setIsProjectorOpen, isSyncing } = useStudents();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    sounds.toggleMute();
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'หน้าแรก', icon: <Home className="w-5 h-5" /> },
    { id: 'add-star', label: 'ให้ดาว', icon: <Star className="w-5 h-5" /> },
    { id: 'activities', label: 'กิจกรรม / สุ่มชื่อ', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'attendance', label: 'เช็คชื่อมาเรียน', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'students', label: 'นักเรียน', icon: <Users className="w-5 h-5" /> },
    { id: 'classrooms', label: 'ห้องเรียน', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'สรุปอันดับ', icon: <Award className="w-5 h-5" /> },
    { id: 'rewards', label: 'แลกรางวัล', icon: <Gift className="w-5 h-5" /> },
    { id: 'badges', label: 'เกณฑ์ความดี', icon: <BookmarkCheck className="w-5 h-5" /> },
    { id: 'reports', label: 'รายงาน & พิมพ์', icon: <FileText className="w-5 h-5" /> },
    { id: 'history', label: 'ประวัติ', icon: <History className="w-5 h-5" /> },
  ];

  const handleTabClick = (id: TabType) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-40 shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-amber-500">
            <Star className="w-8 h-8 fill-amber-500" />
            <span className="text-xl font-black font-heading tracking-wide">ดาวเด็กดี</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-1 font-medium">ระบบสะสมดาว & ความดี</p>
        </div>

        <div className="px-4 pb-4">
          <div className="mb-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เลือกห้องเรียน</label>
              <button
                onClick={() => handleTabClick('classrooms')}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
              >
                จัดการห้อง
              </button>
            </div>
            <select
              value={activeClassroom}
              onChange={(e) => setActiveClassroom(e.target.value)}
              className="mt-1 w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent cursor-pointer"
            >
              <option value="all">ทุกห้องเรียน ({classrooms.length} ห้อง)</option>
              {classrooms.map((c) => (
                <option key={c} value={c}>ห้อง {c}</option>
              ))}
            </select>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2 mt-4">เมนูหลัก</div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-2">
          <button
            onClick={() => setIsProjectorOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
          >
            <Monitor className="w-4 h-4" />
            <span>โหมดจอใหญ่ฉายห้อง 🖥️</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2.5">
          {/* Sound toggle & quick actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                soundEnabled ? 'bg-white text-amber-500 shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
              <span className="font-semibold text-slate-600">{isSyncing ? 'กำลังบันทึก...' : 'เชื่อมโยงข้อมูลแล้ว'}</span>
            </div>
          </div>
          
          {/* Backup / Restore Button */}
          <button
            onClick={onOpenBackup}
            className="w-full flex items-center justify-between p-2.5 bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-2xl transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-800">สำรอง / ย้ายเครื่อง</div>
                <div className="text-[10px] text-purple-600 font-semibold">Backup & Restore</div>
              </div>
            </div>
            <DownloadCloud className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-500">
            <Star className="w-6 h-6 fill-amber-500" />
            <span className="text-lg font-black font-heading">ดาวเด็กดี</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenBackup}
              className="p-2 text-purple-600 bg-purple-50 rounded-xl cursor-pointer"
              title="สำรองข้อมูล"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 bg-slate-50 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="p-4 bg-white border-t border-slate-100 space-y-3 animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="mb-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">เลือกห้องเรียน</label>
              <select
                value={activeClassroom}
                onChange={(e) => setActiveClassroom(e.target.value)}
                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2"
              >
                <option value="all">ทุกห้องเรียน ({classrooms.length} ห้อง)</option>
                {classrooms.map((c) => (
                  <option key={c} value={c}>ห้อง {c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                    currentTab === item.id ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-purple-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={toggleSound}
                className="flex items-center space-x-2 text-xs font-bold text-slate-600 p-2 rounded-xl bg-slate-100"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>{soundEnabled ? 'เปิดเสียงอยู่' : 'ปิดเสียง'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBackup();
                }}
                className="flex items-center space-x-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-2 rounded-xl"
              >
                <Database className="w-4 h-4" />
                <span>สำรอง / กู้ข้อมูล</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
