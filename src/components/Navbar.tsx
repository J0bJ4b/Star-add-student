import React, { useState } from 'react';
import { TabType } from '../types';
import { useStudents } from '../context/StudentContext';
import { 
  Sparkles, 
  PlusCircle, 
  Users, 
  Trophy, 
  Gift, 
  History, 
  Volume2, 
  VolumeX, 
  Cloud, 
  RefreshCw,
  LogOut,
  Database,
  Menu,
  X,
  Star,
  ChevronRight,
  TrendingUp,
  School,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBackup: () => void;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenBackup,
}) => {
  const {
    students,
    activeClassroom,
    setActiveClassroom,
    classrooms,
    soundEnabled,
    toggleSound,
    user,
    loginWithGoogle,
    logout,
    isSyncing,
  } = useStudents();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Statistics calculation for Top Header
  const filteredStudents = activeClassroom === 'all'
    ? students
    : students.filter((s) => s.classroom === activeClassroom);

  const totalStars = filteredStudents.reduce((acc, curr) => acc + curr.stars, 0);
  const totalStudentsCount = filteredStudents.length;
  const avgStars = totalStudentsCount > 0 ? (totalStars / totalStudentsCount).toFixed(1) : '0';

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'add-star', label: 'มอบดาวความดี', icon: <PlusCircle className="w-4 h-4" />, badge: 'ด่วน' },
    { id: 'students', label: 'จัดการนักเรียน', icon: <Users className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'อันดับความดี', icon: <Trophy className="w-4 h-4" /> },
    { id: 'rewards', label: 'แลกของรางวัล', icon: <Gift className="w-4 h-4" /> },
    { id: 'history', label: 'ประวัติการให้ดาว', icon: <History className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: TabType) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const getPageTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard': return 'ภาพรวมระบบ (Dashboard)';
      case 'add-star': return 'มอบดาวความดี (Add Star)';
      case 'students': return 'จัดการข้อมูลนักเรียน (Students)';
      case 'leaderboard': return 'กระดานเกียรติยศ (Leaderboard)';
      case 'rewards': return 'ระบบแลกของรางวัล (Rewards)';
      case 'history': return 'บันทึกประวัติความดี (History & Logs)';
      default: return 'ระบบสะสมดาวความดี';
    }
  };

  return (
    <>
      {/* Sidebar for Desktop (High Density Gradient Theme) */}
      <aside className="hidden lg:flex flex-col w-64 bg-linear-to-b from-[#9333EA] via-purple-700 to-[#7E22CE] text-white fixed inset-y-0 left-0 z-40 shadow-xl border-r border-purple-800/40">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
          <div className="w-11 h-11 rounded-2xl bg-amber-400 p-0.5 shadow-lg shadow-amber-400/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-purple-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl animate-star-pulse">⭐</span>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white font-heading leading-tight truncate">
              Star Good Deeds
            </h1>
            <p className="text-[11px] text-purple-200 truncate font-medium">
              ระบบสะสมดาวความดี
            </p>
          </div>
        </div>

        {/* Classroom Quick Selector in Sidebar */}
        <div className="px-4 py-3 border-b border-white/10 bg-black/10">
          <div className="flex items-center justify-between text-xs text-purple-200 mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-amber-300" />
              <span>ห้องเรียนที่เลือก:</span>
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-white font-bold">
              {filteredStudents.length} คน
            </span>
          </div>
          <select
            id="classroom-filter-sidebar"
            value={activeClassroom}
            onChange={(e) => setActiveClassroom(e.target.value)}
            className="w-full text-xs font-semibold bg-white/15 hover:bg-white/20 border border-white/25 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer backdrop-blur-xs transition-colors"
          >
            <option value="all" className="text-slate-900 font-semibold">ทุกห้องเรียน (รวมทั้งหมด)</option>
            {classrooms.map((c) => (
              <option key={c} value={c} className="text-slate-900 font-semibold">
                ห้อง {c}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200/70 px-3 mb-2">
            เมนูหลัก
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white text-purple-900 shadow-md shadow-black/15 font-bold translate-x-1'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-xl ${
                    isActive ? 'bg-purple-100 text-purple-800' : 'bg-white/10 text-purple-200'
                  }`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-amber-400 text-purple-950' : 'bg-amber-400 text-purple-950'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-800" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Teacher Profile & Cloud Status in Sidebar Footer */}
        <div className="p-3 border-t border-white/10 bg-black/15">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="flex items-center space-x-2.5">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full ring-2 ring-amber-300 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center text-xs font-bold shrink-0">
                  {user ? (user.displayName || user.email || 'U')[0].toUpperCase() : 'ครู'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate font-heading">
                  {user ? (user.displayName || user.email?.split('@')[0]) : 'คุณครูประจำชั้น'}
                </p>
                <p className="text-[10px] text-purple-200 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {user ? 'เชื่อมต่อ Firebase แล้ว' : 'บันทึกข้อมูลในเครื่อง'}
                </p>
              </div>
            </div>

            {/* Sync bar */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-purple-200">
              <span>สถานะซิงค์คลาวด์</span>
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> กำลังซิงค์...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> พร้อมใช้งาน
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

      </aside>

      {/* Top Header Bar for Desktop and Mobile */}
      <header className="sticky top-0 z-30 lg:pl-64 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Breadcrumb / Page Title */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-mobile-sidebar-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2">
              <div className="lg:hidden flex items-center space-x-1.5 font-bold text-purple-700 font-heading text-sm mr-1">
                <span>⭐</span>
                <span className="hidden sm:inline">Star Good Deeds</span>
              </div>
              <div className="hidden md:block">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  ระบบสะสมดาวความดี
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 font-heading leading-tight">
                  {getPageTitle(currentTab)}
                </h2>
              </div>
            </div>
          </div>

          {/* Center: High Density Metric Cards */}
          <div className="hidden xl:flex items-center space-x-2.5">
            {/* Total Stars Pill */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-amber-50/80 border border-amber-200/70">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-star-pulse" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block leading-none">
                  ดาวสะสมรวม
                </span>
                <span className="text-sm font-black font-heading text-amber-700 leading-tight">
                  {totalStars} <span className="text-[10px] font-normal text-amber-600">ดวง</span>
                </span>
              </div>
            </div>

            {/* Students Count Pill */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-purple-50/80 border border-purple-100">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <span className="text-[10px] font-bold text-purple-800 uppercase block leading-none">
                  นักเรียนในห้อง
                </span>
                <span className="text-sm font-black font-heading text-purple-700 leading-tight">
                  {totalStudentsCount} <span className="text-[10px] font-normal text-purple-600">คน</span>
                </span>
              </div>
            </div>

            {/* Average Stars Pill */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block leading-none">
                  เฉลี่ย / คน
                </span>
                <span className="text-sm font-black font-heading text-emerald-700 leading-tight">
                  {avgStars} <span className="text-[10px] font-normal text-emerald-600">ดวง</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Quick Add Star Action Button */}
            {currentTab !== 'add-star' && (
              <button
                id="btn-header-quick-add"
                onClick={() => onSelectTab('add-star')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 text-xs font-bold font-heading shadow-sm shadow-amber-400/25 transition-all transform active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ มอบดาว</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={toggleSound}
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100'
                  : 'text-slate-400 border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Backup / Restore Modal Trigger */}
            <button
              id="btn-backup-modal"
              onClick={onOpenBackup}
              title="สำรองข้อมูล & กู้คืน"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Cloud & User Authentication */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    id="btn-user-profile"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full ring-1 ring-emerald-400"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                      {user.displayName || user.email?.split('@')[0] || 'ครูผู้สอน'}
                    </span>
                    {isSyncing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="เชื่อมต่อคลาวด์แล้ว" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">เข้าสู่ระบบด้วย</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user.email || user.displayName || 'บัญชีผู้ใช้งาน'}
                        </p>
                        <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> บันทึกบน Firestore คลาวด์
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-google-login"
                  onClick={() => loginWithGoogle()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ซิงค์ Google</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-purple-100 bg-white/95 px-4 pt-3 pb-4 space-y-2.5 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-600">เลือกห้องเรียน:</span>
              <select
                value={activeClassroom}
                onChange={(e) => setActiveClassroom(e.target.value)}
                className="text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-900 rounded-lg px-3 py-1"
              >
                <option value="all">ทุกห้องเรียน</option>
                {classrooms.map((c) => (
                  <option key={c} value={c}>
                    ห้อง {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
