import React from 'react';
import { useStudents } from '../context/StudentContext';
import { TabType } from '../types';
import { 
  Sparkles, 
  Trophy, 
  Users, 
  Star, 
  TrendingUp, 
  PlusCircle, 
  Gift, 
  History, 
  ArrowRight,
  Clock,
  Award,
  Medal,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { students, activeClassroom, getAllStarLogs, rewards, categories } = useStudents();

  // Filter students based on active classroom
  const filteredStudents = activeClassroom === 'all' 
    ? students 
    : students.filter((s) => s.classroom === activeClassroom);

  // Sort by stars descending for leaderboard
  const sortedStudents = [...filteredStudents].sort((a, b) => b.stars - a.stars);
  const topThree = sortedStudents.slice(0, 3);

  // Statistics calculation
  const totalStudentsCount = filteredStudents.length;
  const totalStars = filteredStudents.reduce((acc, curr) => acc + curr.stars, 0);
  const highestStars = sortedStudents.length > 0 ? sortedStudents[0].stars : 0;
  const avgStars = totalStudentsCount > 0 ? (totalStars / totalStudentsCount).toFixed(1) : '0';

  // Recent activity logs
  const allLogs = getAllStarLogs();
  const recentLogs = (activeClassroom === 'all' 
    ? allLogs 
    : allLogs.filter((l) => l.classroom === activeClassroom)
  ).slice(0, 6);

  // Category stats
  const categoryStats = categories.map((cat) => {
    const logs = allLogs.filter((l) => l.category === cat.name);
    const starSum = logs.reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0);
    return {
      name: cat.name,
      count: logs.length,
      stars: starSum,
    };
  }).sort((a, b) => b.stars - a.stars);

  const formatThaiTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'เมื่อสักครู่';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} นาทีที่แล้ว`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ชั่วโมงที่แล้ว`;
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-600 via-indigo-600 to-pink-500 text-white shadow-xl shadow-purple-500/15 p-6 sm:p-8 md:p-10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>ระบบเก็บคะแนนความดีและเสริมสร้างวินัยเชิงบวก</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading tracking-tight leading-tight">
            ยินดีต้อนรับคุณครู! 🌟
          </h2>
          <p className="mt-2 text-purple-100 text-sm sm:text-base leading-relaxed">
            {activeClassroom === 'all' 
              ? 'จัดการและมอบคะแนนดาวความดีให้นักเรียนทุกห้องเรียน สร้างแรงบันดาลใจในการทำความดี'
              : `กำลังแสดงข้อมูลห้องเรียน ${activeClassroom} มอบดาว บันทึกความดี และส่งเสริมความก้าวหน้า`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              id="btn-hero-add-star"
              onClick={() => onNavigate('add-star')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-semibold text-sm shadow-lg shadow-amber-400/30 transition-all transform hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ให้ดาวนักเรียนตอนนี้</span>
            </button>
            <button
              id="btn-hero-leaderboard"
              onClick={() => onNavigate('leaderboard')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-medium text-sm border border-white/20 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>ดูกระดานเกียรติยศ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics 4-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">นักเรียนทั้งหมด</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
              {totalStudentsCount}
            </span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {activeClassroom === 'all' ? 'รวมทุกห้องเรียน' : `ห้อง ${activeClassroom}`}
          </div>
        </div>

        {/* Total Stars */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">ดาวสะสมรวม</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-amber-600">
              {totalStars}
            </span>
            <span className="text-xs text-slate-500">ดวง</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> ความดีสะสมต่อเนื่อง
          </div>
        </div>

        {/* Highest Stars */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">ดาวสูงสุด</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-indigo-600">
              {highestStars}
            </span>
            <span className="text-xs text-slate-500">ดวง</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {sortedStudents[0]?.name ? `${sortedStudents[0].name.split(' ')[0]}` : 'ยังไม่มีข้อมูล'}
          </div>
        </div>

        {/* Average Stars */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">ดาวเฉลี่ย / คน</span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-pink-600">
              {avgStars}
            </span>
            <span className="text-xs text-slate-500">ดวง/คน</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            เกณฑ์เฉลี่ยห้องเรียน
          </div>
        </div>

      </div>

      {/* Main Grid: Top 3 Podium & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 3 Leaderboard Podium */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  ผู้นำสะสมดาวความดี (Top 3)
                </h3>
                <p className="text-xs text-slate-500">อันดับสูงสุดประจำห้องเรียน</p>
              </div>
            </div>
            <button
              id="btn-goto-leaderboard-all"
              onClick={() => onNavigate('leaderboard')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <span>ดูอันดับทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topThree.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>ยังไม่มีข้อมูลนักเรียนในห้องนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
              
              {/* 2nd Place (Silver) */}
              <div className="flex flex-col items-center">
                {topThree[1] ? (
                  <>
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-slate-200 to-slate-400 p-0.5 shadow-md flex items-center justify-center">
                        <div className="w-full h-full bg-slate-50 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                          {topThree[1].avatar}
                        </div>
                      </div>
                      <span className="absolute -top-2 -right-1 bg-slate-400 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                        2
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 text-center line-clamp-1 max-w-[90px] sm:max-w-[120px]">
                      {topThree[1].name.split(' ')[0]}
                    </span>
                    <span className="text-[11px] text-slate-400 mb-1">{topThree[1].classroom}</span>
                    <div className="w-full bg-linear-to-t from-slate-100 to-slate-200/60 rounded-t-2xl pt-4 pb-3 flex flex-col items-center border-t-2 border-slate-300">
                      <div className="flex items-center space-x-1 text-slate-700 font-bold text-sm sm:text-base font-heading">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{topThree[1].stars}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">เหรียญเงิน 🥈</span>
                    </div>
                  </>
                ) : (
                  <div className="h-28 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-300">
                    ไม่มีอันดับ 2
                  </div>
                )}
              </div>

              {/* 1st Place (Gold) */}
              <div className="flex flex-col items-center -mt-4">
                {topThree[0] ? (
                  <>
                    <div className="text-xl sm:text-2xl animate-bounce mb-1">👑</div>
                    <div className="relative mb-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-lg shadow-amber-500/25 flex items-center justify-center">
                        <div className="w-full h-full bg-amber-50 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl">
                          {topThree[0].avatar}
                        </div>
                      </div>
                      <span className="absolute -top-2 -right-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-white">
                        1
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 text-center line-clamp-1 max-w-[100px] sm:max-w-[140px]">
                      {topThree[0].name.split(' ')[0]}
                    </span>
                    <span className="text-[11px] text-amber-600 font-medium mb-1">{topThree[0].classroom}</span>
                    <div className="w-full bg-linear-to-t from-amber-100 to-amber-200/70 rounded-t-2xl pt-6 pb-4 flex flex-col items-center border-t-3 border-amber-400 shadow-inner">
                      <div className="flex items-center space-x-1 text-amber-900 font-extrabold text-base sm:text-lg font-heading">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{topThree[0].stars}</span>
                      </div>
                      <span className="text-[11px] text-amber-800 font-bold">เหรียญทอง 🥇</span>
                    </div>
                  </>
                ) : null}
              </div>

              {/* 3rd Place (Bronze) */}
              <div className="flex flex-col items-center">
                {topThree[2] ? (
                  <>
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-amber-700 to-amber-900 p-0.5 shadow-md flex items-center justify-center">
                        <div className="w-full h-full bg-amber-50/50 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                          {topThree[2].avatar}
                        </div>
                      </div>
                      <span className="absolute -top-2 -right-1 bg-amber-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                        3
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 text-center line-clamp-1 max-w-[90px] sm:max-w-[120px]">
                      {topThree[2].name.split(' ')[0]}
                    </span>
                    <span className="text-[11px] text-slate-400 mb-1">{topThree[2].classroom}</span>
                    <div className="w-full bg-linear-to-t from-amber-50 to-orange-100/60 rounded-t-2xl pt-3 pb-3 flex flex-col items-center border-t-2 border-amber-600">
                      <div className="flex items-center space-x-1 text-amber-900 font-bold text-sm sm:text-base font-heading">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{topThree[2].stars}</span>
                      </div>
                      <span className="text-[10px] text-amber-800 font-medium">ทองแดง 🥉</span>
                    </div>
                  </>
                ) : (
                  <div className="h-24 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-300">
                    ไม่มีอันดับ 3
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
              <span>เมนูด่วน</span>
              <span className="text-xs font-normal text-slate-400">Quick Actions</span>
            </h3>

            <div className="space-y-2.5">
              <button
                id="btn-quick-add-star"
                onClick={() => onNavigate('add-star')}
                className="w-full p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-100/80 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-heading">ให้ดาวนักเรียน</div>
                    <div className="text-xs text-purple-600">เพิ่ม +1 หรือ +½ ดาวตามหมวดหมู่</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-quick-manage-students"
                onClick={() => onNavigate('students')}
                className="w-full p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-100/80 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-heading">จัดการรายชื่อนักเรียน</div>
                    <div className="text-xs text-blue-600">เพิ่ม ลบ แก้ไขชื่อ หรือนำเข้ารายชื่อ</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-quick-claim-reward"
                onClick={() => onNavigate('rewards')}
                className="w-full p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-100/80 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-xs">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-heading">แลกของรางวัล</div>
                    <div className="text-xs text-pink-600">ตรวจสอบเป้าหมายและแลกของขวัญ</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              id="btn-quick-history"
              onClick={() => onNavigate('history')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>ดูบันทึกและสถิติประวัติการให้ดาวทั้งหมด</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Recent Activity Feed & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                กิจกรรมความดีล่าสุด
              </h3>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              ดูทั้งหมด
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              ยังไม่มีประวัติการให้ดาว เริ่มให้ดาวความดีแก่นักเรียนเลย!
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const isPositive = log.amount > 0;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-purple-50/50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isPositive ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isPositive ? '⭐' : '🔻'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">
                            {log.studentName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium">
                            {log.classroom}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-slate-700">{log.category}</span>
                          {log.note && <span className="text-slate-400">• {log.note}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-bold font-heading ${
                        isPositive ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? `+${log.amount}` : log.amount} ดาว
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatThaiTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Stats Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                สถิติการให้ดาวตามหมวดหมู่
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {categoryStats.slice(0, 5).map((cat) => {
              const maxStars = categoryStats[0]?.stars || 1;
              const percent = Math.min(100, Math.round((cat.stars / (maxStars || 1)) * 100));

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="font-bold text-purple-700">
                      {cat.stars} ดาว <span className="text-slate-400 font-normal">({cat.count} ครั้ง)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
