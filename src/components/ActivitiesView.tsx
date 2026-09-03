import React, { useState, useEffect, useRef } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  Sparkles, RotateCcw, Play, Pause, RefreshCw, Users, Star, 
  Clock, Award, Check, Shuffle, AlertCircle, Plus, Volume2
} from 'lucide-react';
import { sounds } from '../lib/audio';
import { fireStarBurst, fireBigCelebration } from '../lib/confetti';

export const ActivitiesView: React.FC = () => {
  const { 
    students, 
    classrooms, 
    activeClassroom, 
    setActiveClassroom,
    addStars,
    categories,
    teams,
    createTeam,
    deleteTeam,
    autoSplitTeams,
    addStarsToTeam
  } = useStudents();

  const [activeTab, setActiveTab] = useState<'wheel' | 'timer' | 'teams'>('wheel');

  // Filter students by active classroom
  const filteredStudents = activeClassroom === 'all'
    ? students
    : students.filter((s) => s.classroom === activeClassroom);

  // ==========================================
  // 1. RANDOM PICKER / WHEEL STATE
  // ==========================================
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<typeof students[0] | null>(null);
  const [spinIndex, setSpinIndex] = useState(0);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [removePicked, setRemovePicked] = useState(false);
  const [starAwardAmount, setStarAwardAmount] = useState(1);
  const [awardReason, setAwardReason] = useState('ตอบคำถามถูก / กิจกรรมสุ่ม');
  const [awardSuccess, setAwardSuccess] = useState('');

  const eligibleStudents = removePicked 
    ? filteredStudents.filter((s) => !pickedIds.includes(s.id))
    : filteredStudents;

  const spinIntervalRef = useRef<any>(null);

  const startSpin = () => {
    if (eligibleStudents.length === 0) {
      alert('ไม่มีนักเรียนในรายชื่อ หรือถูกสุ่มไปหมดแล้ว');
      return;
    }

    setIsSpinning(true);
    setSelectedWinner(null);
    setAwardSuccess('');
    sounds.playClick();

    let speed = 40;
    let step = 0;
    const maxSteps = 35 + Math.floor(Math.random() * 20);

    const spinStep = () => {
      setSpinIndex((prev) => (prev + 1) % eligibleStudents.length);
      sounds.playClick();
      step++;

      if (step < maxSteps) {
        speed += 6;
        spinIntervalRef.current = setTimeout(spinStep, speed);
      } else {
        // Finished
        setIsSpinning(false);
        const winner = eligibleStudents[(spinIndex + 1) % eligibleStudents.length];
        setSelectedWinner(winner);
        setPickedIds((prev) => [...prev, winner.id]);
        sounds.playRewardFanfare();
        fireBigCelebration();
      }
    };

    spinIntervalRef.current = setTimeout(spinStep, speed);
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  const handleAwardWinner = (starsToAdd: number) => {
    if (!selectedWinner) return;
    addStars(selectedWinner.id, starsToAdd, 'ตอบคำถามถูก', awardReason);
    setAwardSuccess(`มอบ ${starsToAdd} ดาวให้ ${selectedWinner.name} สำเร็จแล้ว!`);
    sounds.playStarEarned();
    fireStarBurst();
    setTimeout(() => setAwardSuccess(''), 3000);
  };

  // ==========================================
  // 2. TIMER & STOPWATCH STATE
  // ==========================================
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [timerSeconds, setTimerSeconds] = useState(180); // Default 3 mins
  const [initialCountdown, setInitialCountdown] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('3');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerMode === 'countdown') {
            if (prev <= 1) {
              clearInterval(interval);
              setIsTimerRunning(false);
              sounds.playRewardFanfare();
              fireBigCelebration();
              return 0;
            }
            if (prev <= 4) {
              sounds.playClick();
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  const handleSetTimer = (secs: number) => {
    setIsTimerRunning(false);
    setTimerMode('countdown');
    setTimerSeconds(secs);
    setInitialCountdown(secs);
  };

  const handleApplyCustomTime = () => {
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      handleSetTimer(mins * 60);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // 3. TEAMS STATE
  // ==========================================
  const [splitCount, setSplitCount] = useState(4);
  const [teamStarNote, setTeamStarNote] = useState('ตอบคำถามชนะเลิศ / งานกลุ่มยอดเยี่ยม');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-heading text-slate-800 flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span>กิจกรรมในชั้นเรียน</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            วงล้อสุ่มผู้โชคดี นาฬิกาจับเวลากิจกรรม และระบบจัดกลุ่มบ้านสะสมคะแนน
          </p>
        </div>

        {/* Classroom selector */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400">ห้องเรียน:</span>
          <select
            value={activeClassroom}
            onChange={(e) => setActiveClassroom(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกห้อง ({students.length} คน)</option>
            {classrooms.map((c) => (
              <option key={c} value={c}>ห้อง {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Sub-Navigation Tabs */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl gap-1.5 max-w-lg">
        <button
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'wheel' 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>วงล้อสุ่มชื่อ</span>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'timer' 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>นาฬิกาจับเวลา</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'teams' 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดกลุ่ม / บ้าน ({teams.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. TAB: RANDOM PICKER WHEEL */}
      {/* ========================================================= */}
      {activeTab === 'wheel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main Slot / Wheel Display */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[420px]">
            {/* Background decoration */}
            <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-purple-50 to-transparent pointer-events-none" />

            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 border border-purple-200 px-3 py-1 rounded-full mb-6 z-10 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สุ่มผู้โชคดีตอบคำถาม ({eligibleStudents.length} คนที่มีสิทธิ์)</span>
            </div>

            {/* Visual Box / Big Card */}
            <div className="w-full max-w-md my-4 p-8 bg-linear-to-br from-slate-50 to-purple-50/40 rounded-3xl border-2 border-purple-200/80 shadow-md relative">
              {isSpinning ? (
                <div className="py-6 animate-pulse">
                  <div className="text-6xl mb-3">
                    {eligibleStudents[spinIndex]?.avatar.length > 2 ? (
                      <img src={eligibleStudents[spinIndex]?.avatar} className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-purple-300" alt="" />
                    ) : (
                      eligibleStudents[spinIndex]?.avatar || '🎲'
                    )}
                  </div>
                  <div className="text-2xl font-black text-slate-800 truncate">
                    {eligibleStudents[spinIndex]?.name || 'กำลังสุ่ม...'}
                  </div>
                  <div className="text-xs text-purple-600 font-bold mt-1">
                    ห้อง {eligibleStudents[spinIndex]?.classroom}
                  </div>
                </div>
              ) : selectedWinner ? (
                <div className="py-4 animate-scale-up">
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black mb-3 border border-amber-300">
                    🎉 ผู้โชคดีคือ 🎉
                  </div>
                  <div className="text-6xl mb-3">
                    {selectedWinner.avatar.length > 2 ? (
                      <img src={selectedWinner.avatar} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-amber-400 shadow-md" alt="" />
                    ) : (
                      selectedWinner.avatar
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {selectedWinner.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-1">
                    ห้อง {selectedWinner.classroom} • มีแล้ว {selectedWinner.stars} ⭐
                  </p>
                </div>
              ) : (
                <div className="py-10 text-slate-400">
                  <div className="text-6xl mb-3">🎯</div>
                  <p className="font-bold text-slate-600 text-lg">พร้อมแล้วสำหรับสุ่มผู้โชคดี!</p>
                  <p className="text-xs text-slate-400 mt-1">กดปุ่ม "เริ่มสุ่มชื่อ" ด้านล่างได้เลยครับ</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3 mt-4 z-10">
              <button
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={startSpin}
                className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-600/25 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
              >
                <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'กำลังสุ่ม...' : 'เริ่มสุ่มชื่อ!'}</span>
              </button>

              {pickedIds.length > 0 && (
                <button
                  onClick={() => {
                    setPickedIds([]);
                    setSelectedWinner(null);
                  }}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors"
                  title="รีเซ็ตรายชื่อที่เคยสุ่มแล้ว"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="mt-5 flex items-center space-x-2 text-xs text-slate-500">
              <label className="flex items-center space-x-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={removePicked}
                  onChange={(e) => setRemovePicked(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-400"
                />
                <span>ไม่สุ่มซ้ำคนที่เคยได้แล้ว ({pickedIds.length} คน)</span>
              </label>
            </div>
          </div>

          {/* Winner Award Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800 mb-2 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>มอบรางวัลให้ผู้โชคดี</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                ให้ดาวทันทีเมื่อนักเรียนตอบคำถามหรือทำกิจกรรมเสร็จ
              </p>

              {awardSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center space-x-1.5 mb-4 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{awardSuccess}</span>
                </div>
              )}

              {selectedWinner ? (
                <div className="space-y-4">
                  <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-100">
                    <div className="text-xs text-purple-700 font-bold">ผู้รับรางวัล:</div>
                    <div className="text-base font-black text-slate-800 truncate">{selectedWinner.name}</div>
                    <div className="text-xs text-slate-500">ห้อง {selectedWinner.classroom}</div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">
                      เหตุผล / กิจกรรม
                    </label>
                    <input
                      type="text"
                      value={awardReason}
                      onChange={(e) => setAwardReason(e.target.value)}
                      placeholder="เช่น ตอบคำถามถูก, แสดงความคิดเห็นดี"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-2 block">
                      กดมอบดาวทันที:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleAwardWinner(amt)}
                          className="py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-900" />
                          <span>+{amt} ดาว</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  สุ่มผู้โชคดีก่อน เพื่อเปิดปุ่มมอบดาว
                </div>
              )}
            </div>

            {/* List of picked */}
            {pickedIds.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                  <span>ประวัติผู้ถูกสุ่มรอบนี้:</span>
                  <span className="text-[10px] text-slate-400">{pickedIds.length} คน</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {pickedIds.map((id) => {
                    const std = students.find((s) => s.id === id);
                    if (!std) return null;
                    return (
                      <span key={id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold flex items-center space-x-1">
                        <span>{std.avatar}</span>
                        <span className="truncate max-w-[90px]">{std.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB: CLASSROOM TIMER & STOPWATCH */}
      {/* ========================================================= */}
      {activeTab === 'timer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-3xl mx-auto text-center animate-fade-in">
          {/* Mode Switcher */}
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerMode('countdown');
                setTimerSeconds(initialCountdown);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                timerMode === 'countdown' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              ⏱️ นับถอยหลัง (Timer)
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerMode('stopwatch');
                setTimerSeconds(0);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                timerMode === 'stopwatch' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              ⏱️ จับเวลาเดินหน้า (Stopwatch)
            </button>
          </div>

          {/* Big Digital Display */}
          <div className="my-6">
            <div className={`text-7xl sm:text-9xl font-black font-mono tracking-wider select-none ${
              timerMode === 'countdown' && timerSeconds <= 10 && timerSeconds > 0
                ? 'text-rose-600 animate-pulse'
                : 'text-slate-800'
            }`}>
              {formatTime(timerSeconds)}
            </div>
            {timerMode === 'countdown' && timerSeconds === 0 && (
              <div className="mt-3 text-lg font-black text-rose-600 animate-bounce">
                🔔 หมดเวลาแล้วครับ! (TIME'S UP) 🔔
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 my-8">
            <button
              onClick={() => {
                setIsTimerRunning(!isTimerRunning);
                sounds.playClick();
              }}
              className={`px-8 py-4 rounded-2xl text-white font-black text-lg shadow-lg flex items-center space-x-2 transition-all active:scale-95 cursor-pointer ${
                isTimerRunning 
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-6 h-6" />
                  <span>พักชั่วคราว</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-white" />
                  <span>{timerSeconds === 0 ? 'เริ่มใหม่' : 'เริ่มจับเวลา'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                if (timerMode === 'countdown') {
                  setTimerSeconds(initialCountdown);
                } else {
                  setTimerSeconds(0);
                }
                sounds.playClick();
              }}
              className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
              title="รีเซ็ตเวลา"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Presets for Countdown */}
          {timerMode === 'countdown' && (
            <div className="pt-6 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-3">
                ตั้งเวลาด่วน
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: '30 วิ', sec: 30 },
                  { label: '1 นาที', sec: 60 },
                  { label: '2 นาที', sec: 120 },
                  { label: '3 นาที', sec: 180 },
                  { label: '5 นาที', sec: 300 },
                  { label: '10 นาที', sec: 600 },
                  { label: '15 นาที', sec: 900 },
                ].map((p) => (
                  <button
                    key={p.sec}
                    onClick={() => handleSetTimer(p.sec)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      initialCountdown === p.sec 
                        ? 'bg-purple-50 text-purple-700 border-purple-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom Minutes Input */}
              <div className="mt-4 flex items-center justify-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="นาที"
                  className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                />
                <span className="text-xs text-slate-500 font-bold">นาที</span>
                <button
                  onClick={handleApplyCustomTime}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  ตั้งเวลา
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB: TEAMS & HOUSES */}
      {/* ========================================================= */}
      {activeTab === 'teams' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls to auto-split */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>แบ่งกลุ่ม / บ้านสะสมคะแนน</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                แบ่งนักเรียนในห้อง {activeClassroom === 'all' ? 'ทุกห้อง' : `ห้อง ${activeClassroom}`} เป็นทีมเพื่อแข่งตอบคำถามและทำงานร่วมกัน
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-bold">จำนวนกลุ่ม:</span>
              <select
                value={splitCount}
                onChange={(e) => setSplitCount(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5"
              >
                <option value={2}>2 กลุ่ม</option>
                <option value={3}>3 กลุ่ม</option>
                <option value={4}>4 กลุ่ม</option>
                <option value={5}>5 กลุ่ม</option>
                <option value={6}>6 กลุ่ม</option>
              </select>

              <button
                onClick={() => autoSplitTeams(splitCount, activeClassroom)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center space-x-1.5 active:scale-95 transition-all"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>สุ่มแบ่งกลุ่มใหม่</span>
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {teams.map((team, idx) => {
              const teamMembers = students.filter((s) => team.studentIds.includes(s.id));
              const totalTeamStars = teamMembers.reduce((sum, s) => sum + s.stars, 0);

              return (
                <div 
                  key={team.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hover:border-purple-300 transition-all"
                >
                  {/* Team Header */}
                  <div className={`p-4 border-b ${team.color} flex items-center justify-between`}>
                    <div>
                      <h4 className="font-black text-base truncate">{team.name}</h4>
                      <p className="text-[11px] opacity-80">สมาชิก {teamMembers.length} คน</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black flex items-center space-x-1">
                        <span>{totalTeamStars}</span>
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      </div>
                      <span className="text-[10px] opacity-75">แต้มรวมทีม</span>
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="p-3.5 flex-1 max-h-60 overflow-y-auto space-y-1.5 bg-slate-50/40">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100 text-xs shadow-2xs">
                        <div className="flex items-center space-x-2 truncate mr-2">
                          <span className="text-sm shrink-0">{member.avatar}</span>
                          <span className="font-bold text-slate-700 truncate">{member.name}</span>
                        </div>
                        <span className="text-amber-500 font-bold shrink-0">{member.stars}⭐</span>
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs font-bold">
                        ยังไม่มีสมาชิกในทีมนี้
                      </div>
                    )}
                  </div>

                  {/* Team Star Award */}
                  <div className="p-3 bg-white border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">ให้ดาวทั้งทีม</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => addStarsToTeam(team.id, 1, 'ชนะกิจกรรมกลุ่ม')}
                        className="py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                      >
                        <Star className="w-3 h-3 fill-slate-900" />
                        <span>+1 ดาว/คน</span>
                      </button>
                      <button
                        onClick={() => addStarsToTeam(team.id, 2, 'ชนะเลิศกิจกรรมกลุ่ม')}
                        className="py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                      >
                        <Star className="w-3 h-3 fill-white" />
                        <span>+2 ดาว/คน</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
