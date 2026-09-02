import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { Student } from '../types';
import { 
  Trophy, 
  Search, 
  Star, 
  Award, 
  Printer, 
  X, 
  Sparkles, 
  Medal,
  Crown
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { students, classrooms, activeClassroom } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(activeClassroom || 'all');
  const [certificateStudent, setCertificateStudent] = useState<Student | null>(null);

  // Filter & rank students
  const filteredStudents = students
    .filter((s) => {
      if (selectedClassFilter !== 'all' && s.classroom !== selectedClassFilter) return false;
      if (searchTerm.trim() && !s.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.stars - a.stars);

  const topThree = filteredStudents.slice(0, 3);
  const maxStarsInList = filteredStudents[0]?.stars || 1;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: 'เหรียญทอง 🥇', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (rank === 2) return { label: 'เหรียญเงิน 🥈', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    if (rank === 3) return { label: 'ทองแดง 🥉', bg: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (rank <= 5) return { label: 'ยอดเยี่ยม ⭐', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
    return { label: 'คนเก่ง 🌟', bg: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-amber-500 via-yellow-500 to-orange-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/15 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-200" />
              <span>ทำเนียบคนเก่งสะสมดาวความดี</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              กระดานเกียรติยศ (Leaderboard) 🏆
            </h2>
            <p className="text-xs sm:text-sm text-yellow-100 mt-1 max-w-xl">
              ประกาศเกียรติคุณนักเรียนที่มีคะแนนสะสมดาวความดีสูงสุดประจำห้องเรียน
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-amber-100">เลือกห้อง:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกห้องเรียน (รวมทั้งหมด)</option>
              {classrooms.map((c) => (
                <option key={c} value={c}>
                  ห้อง {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          
          {/* 1st Place (Center / Main) */}
          <div className="order-1 md:order-2 bg-linear-to-b from-amber-100 via-amber-50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-lg shadow-amber-500/15 flex flex-col items-center text-center relative transform md:-translate-y-2">
            <div className="absolute -top-4 bg-linear-to-r from-amber-500 to-yellow-400 text-purple-950 text-xs font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-purple-950" />
              <span>อันดับที่ 1 เหรียญทอง</span>
            </div>

            <div className="mt-3 w-20 h-20 rounded-3xl bg-amber-200 p-1 shadow-inner flex items-center justify-center text-4xl mb-3">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                {topThree[0].avatar || '👑'}
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading line-clamp-1">
              {topThree[0].name}
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-md mt-1">
              ห้อง {topThree[0].classroom}
            </span>

            <div className="my-4 flex items-center space-x-1.5 text-2xl font-black font-heading text-amber-600">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400 animate-star-pulse" />
              <span>{topThree[0].stars}</span>
              <span className="text-xs font-normal text-slate-500">ดาว</span>
            </div>

            <button
              onClick={() => setCertificateStudent(topThree[0])}
              className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เกียรติบัตรคนเก่ง</span>
            </button>
          </div>

          {/* 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 bg-linear-to-b from-slate-100 via-slate-50 to-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center relative">
              <div className="absolute -top-3.5 bg-slate-400 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-xs">
                อันดับที่ 2 🥈 เหรียญเงิน
              </div>

              <div className="mt-3 w-16 h-16 rounded-2xl bg-slate-200 p-1 flex items-center justify-center text-3xl mb-3">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  {topThree[1].avatar}
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-heading line-clamp-1">
                {topThree[1].name}
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md mt-1">
                ห้อง {topThree[1].classroom}
              </span>

              <div className="my-4 flex items-center space-x-1.5 text-xl font-bold font-heading text-slate-700">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{topThree[1].stars}</span>
                <span className="text-xs font-normal text-slate-400">ดาว</span>
              </div>

              <button
                onClick={() => setCertificateStudent(topThree[1])}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์เกียรติบัตร</span>
              </button>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="order-3 md:order-3 bg-linear-to-b from-orange-50 via-amber-50/50 to-white rounded-3xl p-6 border border-amber-200 shadow-xs flex flex-col items-center text-center relative">
              <div className="absolute -top-3.5 bg-amber-700 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-xs">
                อันดับที่ 3 🥉 ทองแดง
              </div>

              <div className="mt-3 w-16 h-16 rounded-2xl bg-amber-100 p-1 flex items-center justify-center text-3xl mb-3">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  {topThree[2].avatar}
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-heading line-clamp-1">
                {topThree[2].name}
              </h3>
              <span className="text-xs font-medium text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md mt-1">
                ห้อง {topThree[2].classroom}
              </span>

              <div className="my-4 flex items-center space-x-1.5 text-xl font-bold font-heading text-amber-800">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{topThree[2].stars}</span>
                <span className="text-xs font-normal text-slate-400">ดาว</span>
              </div>

              <button
                onClick={() => setCertificateStudent(topThree[2])}
                className="w-full py-2 px-3 bg-orange-100 hover:bg-orange-200 text-amber-900 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์เกียรติบัตร</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs space-y-4">
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>ตารางอันดับสะสมดาวทั้งหมด ({filteredStudents.length} คน)</span>
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อในอันดับ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            const percent = Math.min(100, Math.round((student.stars / maxStarsInList) * 100));

            return (
              <div
                key={student.id}
                className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-50/40 rounded-2xl px-3 transition-colors"
              >
                {/* Rank & Student Info */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-heading text-xs sm:text-sm ${
                    rank === 1 ? 'bg-amber-400 text-purple-950 shadow-xs' :
                    rank === 2 ? 'bg-slate-300 text-slate-800' :
                    rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {rank}
                  </div>

                  <div className="text-2xl">{student.avatar}</div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 font-heading">
                        {student.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      ห้อง {student.classroom} • ความดี {student.starHistory?.length || 0} ครั้ง
                    </span>
                  </div>
                </div>

                {/* Progress bar and Stars */}
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="w-28 sm:w-40 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-linear-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-base font-extrabold font-heading text-amber-700">
                      {student.stars}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">ดาว</span>
                  </div>

                  <button
                    onClick={() => setCertificateStudent(student)}
                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                    title="พิมพ์เกียรติบัตร"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL: Certificate Generator */}
      {certificateStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative space-y-6 text-center">
            
            <button
              onClick={() => setCertificateStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="space-y-1">
              <div className="text-3xl">🏅 ✨ 🌟</div>
              <h3 className="text-2xl font-black font-heading text-amber-800 tracking-wide">
                เกียรติบัตรคนดีประจำห้องเรียน
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Certificate of Good Deeds & Excellence
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-4 border-y-2 border-dashed border-amber-200 space-y-3">
              <p className="text-xs text-slate-500">เกียรติบัตรฉบับนี้มอบให้เพื่อแสดงว่า</p>
              <div className="text-2xl font-black font-heading text-purple-900">
                {certificateStudent.name} {certificateStudent.avatar}
              </div>
              <p className="text-xs text-slate-600">
                นักเรียนชั้นประถมศึกษาห้อง <strong className="text-purple-700">{certificateStudent.classroom}</strong>
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                เป็นผู้มีความประพฤติดี มีวินัย มีน้ำใจช่วยเหลือผู้อื่น และสะสมดาวความดีได้รวมทั้งสิ้น
              </p>
              <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-2xl bg-amber-100 text-amber-900 font-black text-2xl font-heading border border-amber-300 shadow-xs">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                <span>{certificateStudent.stars} ดวง</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-6 pt-2">
              <div>
                <p>วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-[10px] text-slate-400">ระบบสะสมดาวความดี</p>
              </div>
              <div>
                <div className="w-32 border-b border-slate-300 mb-1" />
                <p>ลงชื่อ ครูประจำชั้น</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบประกาศเกียรติคุณ</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
