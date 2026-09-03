import React, { useState } from 'react';
import { 
  Home, Star, Users, Award, Gift, History, Menu, X, Cloud, LogOut, Database, RefreshCw, Volume2, VolumeX, GraduationCap,
  Sparkles, CheckCircle2, BookmarkCheck, FileText, Monitor
} from 'lucide-react';
import { TabType } from '../types';
import { useStudents } from '../context/StudentContext';
import { auth, loginWithGoogle, logoutUser } from '../lib/firebase';
import { sounds } from '../lib/audio';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab, onOpenBackup }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { activeClassroom, setActiveClassroom, classrooms, user, setIsProjectorOpen } = useStudents();
  
  // Assuming audio toggle is in a global state or just use a local one for UI
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
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

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl transition-colors ${
                soundEnabled ? 'bg-white text-amber-500 shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenBackup}
              className="p-2 bg-white text-slate-600 rounded-xl shadow-sm hover:text-purple-600 transition-colors"
              title="สำรองข้อมูล"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="profile" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700 truncate">{user.displayName || user.email}</span>
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50">
                   <button
                     onClick={() => { logoutUser(); setUserMenuOpen(false); }}
                     className="w-full flex items-center space-x-2 p-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                   >
                     <LogOut className="w-4 h-4" />
                     <span>ออกจากระบบ</span>
                   </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white p-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Cloud className="w-4 h-4" />
              <span>Login / Sync</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-500">
            <Star className="w-6 h-6 fill-amber-500" />
            <span className="text-lg font-black font-heading">ดาวเด็กดี</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 bg-slate-50 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="px-4 py-4 border-t border-slate-100 bg-slate-50 space-y-4">
             <select
                value={activeClassroom}
                onChange={(e) => setActiveClassroom(e.target.value)}
                className="w-full text-sm font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2"
              >
                <option value="all">ทุกห้องเรียน</option>
                {classrooms.map((c) => (
                  <option key={c} value={c}>ห้อง {c}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setIsProjectorOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/20"
              >
                <Monitor className="w-4 h-4" />
                <span>โหมดจอใหญ่ฉายห้อง 🖥️</span>
              </button>
          </div>
        )}
      </header>
    </>
  );
};
