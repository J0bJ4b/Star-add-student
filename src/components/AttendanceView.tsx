import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { AttendanceStatus } from '../types';
import { 
  CheckCircle2, Clock, XCircle, AlertCircle, Calendar, 
  Users, Star, Award, Check, Sparkles, Filter 
} from 'lucide-react';
import { sounds } from '../lib/audio';
import { fireStarBurst } from '../lib/confetti';

export const AttendanceView: React.FC = () => {
  const { 
    students, 
    classrooms, 
    activeClassroom, 
    setActiveClassroom,
    attendance, 
    markAttendance, 
    batchMarkAttendance,
    rewardPresentStudents 
  } = useStudents();

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [rewardAmount, setRewardAmount] = useState<number>(1);
  const [awardMessage, setAwardMessage] = useState<string>('');

  // Filter students by active classroom
  const filteredStudents = activeClassroom === 'all'
    ? students
    : students.filter((s) => s.classroom === activeClassroom);

  // Map of studentId -> status for current selectedDate
  const currentAttendanceMap = new Map<string, AttendanceStatus>();
  attendance.forEach((rec) => {
    if (rec.date === selectedDate) {
      currentAttendanceMap.set(rec.studentId, rec.status);
    }
  });

  // Calculate statistics for the selected date and classroom
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let unrecordedCount = 0;

  filteredStudents.forEach((std) => {
    const status = currentAttendanceMap.get(std.id);
    if (status === 'present') presentCount++;
    else if (status === 'late') lateCount++;
    else if (status === 'absent') absentCount++;
    else if (status === 'leave') leaveCount++;
    else unrecordedCount++;
  });

  const totalFiltered = filteredStudents.length;
  const attendanceRate = totalFiltered > 0 ? Math.round(((presentCount + lateCount) / totalFiltered) * 100) : 0;

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    const records = filteredStudents.map((std) => ({
      studentId: std.id,
      status: 'present' as AttendanceStatus,
    }));
    batchMarkAttendance(records, selectedDate);
    sounds.playClick();
  };

  // Handle Give Stars to Present Students
  const handleGiveStarsToPresent = () => {
    const count = rewardPresentStudents(selectedDate, rewardAmount, `มาเรียนตรงเวลา วันที่ ${selectedDate}`);
    if (count > 0) {
      setAwardMessage(`มอบ ${rewardAmount} ดาวให้นักเรียนที่มาเรียนทั้งหมด ${count} คน สำเร็จ!`);
      sounds.playStarEarned();
      fireStarBurst();
      setTimeout(() => setAwardMessage(''), 4000);
    } else {
      setAwardMessage('ไม่มีนักเรียนที่มีสถานะ "มาเรียน" ในวันที่เลือก');
      setTimeout(() => setAwardMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Title & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-heading text-slate-800 flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span>ระบบเช็คชื่อ & การมาเรียน</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            เช็คชื่อประจำวัน บันทึกการมาเรียน และมอบดาวโบนัสคนมาตรงเวลาอัตโนมัติ
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* Classroom Selector */}
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-purple-600" />
            <select
              value={activeClassroom}
              onChange={(e) => setActiveClassroom(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกห้อง ({students.length} คน)</option>
              {classrooms.map((c) => (
                <option key={c} value={c}>ห้อง {c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notification banner if stars awarded */}
      {awardMessage && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-800 text-sm font-bold flex items-center space-x-2 animate-fade-in">
          <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{awardMessage}</span>
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>ทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {totalFiltered} <span className="text-xs font-semibold text-slate-400">คน</span>
          </div>
          <div className="text-[11px] text-teal-600 font-bold mt-1">
            มาเรียน {attendanceRate}%
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>มาเรียน</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">
            {presentCount} <span className="text-xs font-semibold text-emerald-600">คน</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">ตรงเวลา</div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
            <span>มาสาย</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-2">
            {lateCount} <span className="text-xs font-semibold text-amber-600">คน</span>
          </div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">บันทึกสาย</div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-3xl border border-rose-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700">
            <span>ขาดเรียน</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 mt-2">
            {absentCount} <span className="text-xs font-semibold text-rose-600">คน</span>
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">ไม่มาเรียน</div>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-3xl border border-blue-200 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700">
            <span>ลา</span>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-800 mt-2">
            {leaveCount} <span className="text-xs font-semibold text-blue-600">คน</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">มีใบลา</div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl border border-emerald-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>เช็คมาครบทุกคน</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline">|</span>

          <span className="text-xs font-bold text-slate-500">
            ยังไม่ได้เช็ค: {unrecordedCount} คน
          </span>
        </div>

        {/* Give Stars to Present Button */}
        <div className="flex items-center space-x-2">
          <select
            value={rewardAmount}
            onChange={(e) => setRewardAmount(Number(e.target.value))}
            className="text-xs font-bold bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-2 py-2"
          >
            <option value={0.5}>+0.5 ดาว</option>
            <option value={1}>+1 ดาว</option>
            <option value={2}>+2 ดาว</option>
          </select>

          <button
            onClick={handleGiveStarsToPresent}
            disabled={presentCount === 0}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-900 font-black text-xs rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-slate-900" />
            <span>แจกดาวคนมาเรียน ({presentCount} คน)</span>
          </button>
        </div>
      </div>

      {/* Students Attendance List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-800 flex items-center space-x-2">
            <span>รายชื่อนักเรียน</span>
            <span className="text-xs text-slate-400 font-normal">
              (วันที่ {new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })})
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-bold">{filteredStudents.length} คน</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.map((std, idx) => {
            const currentStatus = currentAttendanceMap.get(std.id);

            return (
              <div
                key={std.id}
                className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors gap-3"
              >
                {/* Left: Info */}
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                  <div className="text-2xl shrink-0">
                    {std.avatar.length > 2 ? (
                      <img src={std.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                    ) : (
                      std.avatar
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{std.name}</div>
                    <div className="text-xs text-slate-400">ห้อง {std.classroom} • {std.stars} ⭐</div>
                  </div>
                </div>

                {/* Right: 4 Status Buttons */}
                <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                  <button
                    onClick={() => markAttendance(std.id, selectedDate, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">มาเรียน</span>
                  </button>

                  <button
                    onClick={() => markAttendance(std.id, selectedDate, 'late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">สาย</span>
                  </button>

                  <button
                    onClick={() => markAttendance(std.id, selectedDate, 'absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ขาด</span>
                  </button>

                  <button
                    onClick={() => markAttendance(std.id, selectedDate, 'leave')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      currentStatus === 'leave'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ลา</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-bold text-sm">
              ไม่พบรายชื่อนักเรียนในห้องเรียนนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
