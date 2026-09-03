import React, { useState } from 'react';
import { 
  Home, Star, Users, Award, Gift, History, Menu, X, Cloud, LogOut, Database, RefreshCw, Volume2, VolumeX, GraduationCap,
  Sparkles, CheckCircle2, BookmarkCheck, FileText, Monitor, Github
} from 'lucide-react';
import { TabType } from '../types';
import { useStudents } from '../context/StudentContext';
import { logoutUser } from '../lib/firebase';
import { sounds } from '../lib/audio';
import { AuthModal } from './AuthModal';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab, onOpenBackup }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
                className="w-full flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-2xl hover:border-purple-300 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="relative shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-7 h-7 rounded-full object-cover" alt="profile" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {user.providerData.some(p => p.providerId === 'github.com') && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-900 rounded-full flex items-center justify-center border border-white">
                        <Github className="w-2 h-2 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{user.displayName || user.email}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>ซิงค์คลาวด์แล้ว</span>
                    </div>
                  </div>
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                   <div className="px-3 py-2 text-[11px] text-slate-500 border-b border-slate-100 mb-1 truncate">
                     {user.email || user.displayName}
                   </div>
                   <button
                     onClick={() => { logoutUser(); setUserMenuOpen(false); }}
                     className="w-full flex items-center space-x-2 p-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                   >
                     <LogOut className="w-4 h-4" />
                     <span>ออกจากระบบ</span>
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 bg-[#24292e] hover:bg-[#1b1f23] active:scale-98 text-white p-2.5 rounded-2xl text-xs font-black transition-all shadow-sm cursor-pointer"
              >
                <Github className="w-4 h-4 fill-white shrink-0" />
                <span>เข้าสู่ระบบ GitHub</span>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 p-2 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-purple-600" />
                <span>หรือเข้าสู่ระบบ Google</span>
              </button>
            </div>
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
            className="p-2 text-slate-600 bg-slate-50 rounded-xl cursor-pointer"
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
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>โหมดจอใหญ่ฉายห้อง 🖥️</span>
              </button>

              {/* Mobile Auth button */}
              <div className="pt-2 border-t border-slate-200">
                {user ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center space-x-2">
                      {user.photoURL ? (
                        <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="profile" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                          {user.email?.[0].toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-700">{user.displayName || user.email}</span>
                    </div>
                    <button
                      onClick={() => { logoutUser(); setMobileMenuOpen(false); }}
                      className="text-xs font-bold text-rose-600 px-2.5 py-1 bg-rose-50 rounded-lg hover:bg-rose-100 cursor-pointer"
                    >
                      ออก
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-[#24292e] text-white p-3 rounded-2xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Github className="w-4 h-4 fill-white" />
                    <span>เข้าสู่ระบบด้วย GitHub / Google</span>
                  </button>
                )}
              </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
