import React, { useState, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  X, Maximize2, Minimize2, Star, Trophy, Sparkles, 
  Clock, Shuffle, Award, Play, Pause, RotateCcw, Users
} from 'lucide-react';
import { sounds } from '../lib/audio';
import { fireBigCelebration } from '../lib/confetti';

export const ProjectorModal: React.FC = () => {
  const { 
    isProjectorOpen, 
    setIsProjectorOpen, 
    students, 
    classrooms, 
    activeClassroom, 
    setActiveClassroom,
    addStars 
  } = useStudents();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Floating Quick Timer
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Floating Quick Wheel
  const [showPicker, setShowPicker] = useState(false);
  const [pickerWinner, setPickerWinner] = useState<typeof students[0] | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer tick
  useEffect(() => {
    let intv: any = null;
    if (isTimerRunning) {
      intv = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intv);
            setIsTimerRunning(false);
            sounds.playRewardFanfare();
            fireBigCelebration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intv);
  }, [isTimerRunning]);

  if (!isProjectorOpen) return null;

  // Filter & sort students
  const filteredStudents = activeClassroom === 'all'
    ? [...students].sort((a, b) => b.stars - a.stars)
    : students.filter((s) => s.classroom === activeClassroom).sort((a, b) => b.stars - a.stars);

  const top1 = filteredStudents[0];
  const top2 = filteredStudents[1];
  const top3 = filteredStudents[2];
  const totalStarsInRoom = filteredStudents.reduce((sum, s) => sum + s.stars, 0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleQuickSpin = () => {
    if (filteredStudents.length === 0) return;
    setIsPicking(true);
    setPickerWinner(null);
    sounds.playClick();

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredStudents.length);
      const winner = filteredStudents[randomIndex];
      setPickerWinner(winner);
      setIsPicking(false);
      sounds.playRewardFanfare();
      fireBigCelebration();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden animate-fade-in">
      {/* Top Projector Header Bar */}
      <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        {/* Left: Branding & Room */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              ⭐
            </div>
            <div>
              <div className="text-sm font-black tracking-wide flex items-center space-x-1.5">
                <span>กระดานดาวเด็กดี</span>
                <span className="px-2 py-0.5 bg-purple-900/80 text-purple-300 text-[10px] font-bold rounded-full border border-purple-700">
                  PROJECTOR MODE
                </span>
              </div>
            </div>
          </div>

          {/* Classroom Selector */}
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold">ห้อง:</span>
            <select
              value={activeClassroom}
              onChange={(e) => setActiveClassroom(e.target.value)}
              className="text-xs font-black text-amber-400 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">ทุกห้องเรียน</option>
              {classrooms.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">ห้อง {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="hidden md:flex items-center space-x-3 text-slate-300 font-mono text-sm">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>
            {currentTime.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          <span className="text-amber-400 font-black text-base">
            {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Timer Button */}
          <button
            onClick={() => setShowTimer(!showTimer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              showTimer ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>จับเวลา</span>
          </button>

          {/* Quick Picker Button */}
          <button
            onClick={() => {
              setShowPicker(true);
              handleQuickSpin();
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-purple-600/30"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>สุ่มชื่อ</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="เต็มจอ"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Projector Mode */}
          <button
            onClick={() => setIsProjectorOpen(false)}
            className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl transition-colors ml-2"
            title="ออกจากโหมดโปรเจกเตอร์"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between max-w-7xl w-full mx-auto">
        {/* Top Room Banner */}
        <div className="flex items-center justify-between bg-linear-to-r from-purple-900/40 via-slate-900 to-amber-900/30 p-5 rounded-3xl border border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                สรุปคะแนนดาวสะสมความดี {activeClassroom === 'all' ? 'ทุกห้องเรียน' : `ห้อง ${activeClassroom}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                รวมนักเรียนทั้งหมด {filteredStudents.length} คน
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-end space-x-1.5">
              <span>{totalStarsInRoom.toLocaleString()}</span>
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-400 font-bold">ดาวรวมทั้งหมด</span>
          </div>
        </div>

        {/* Podium Top 3 */}
        {filteredStudents.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto w-full items-end my-4">
            {/* Rank 2 (Silver) */}
            <div className="bg-slate-900/80 rounded-3xl p-4 border border-slate-700 text-center flex flex-col items-center justify-end h-56 relative group">
              <div className="absolute -top-3 w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border-2 border-slate-100 shadow-md">
                2
              </div>
              <div className="text-4xl mb-2">{top2?.avatar}</div>
              <div className="text-sm font-bold text-slate-200 truncate w-full">{top2?.name}</div>
              <div className="text-xs text-purple-300 mt-0.5">ห้อง {top2?.classroom}</div>
              <div className="mt-3 px-3 py-1 bg-slate-800 rounded-full text-amber-400 font-black text-xs flex items-center space-x-1">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{top2?.stars} ดาว</span>
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="bg-linear-to-b from-amber-500/20 to-slate-900 rounded-3xl p-4 border-2 border-amber-400/80 text-center flex flex-col items-center justify-end h-68 relative shadow-xl shadow-amber-500/10">
              <div className="absolute -top-4 w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-amber-200 shadow-lg animate-bounce">
                👑
              </div>
              <div className="text-5xl mb-2">{top1?.avatar}</div>
              <div className="text-base font-black text-amber-300 truncate w-full">{top1?.name}</div>
              <div className="text-xs text-amber-200/80 mt-0.5">ห้อง {top1?.classroom}</div>
              <div className="mt-3 px-4 py-1.5 bg-amber-400 text-slate-950 rounded-full font-black text-sm flex items-center space-x-1 shadow-md">
                <Star className="w-4 h-4 fill-slate-950" />
                <span>{top1?.stars} ดาว</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-slate-900/80 rounded-3xl p-4 border border-slate-700 text-center flex flex-col items-center justify-end h-48 relative">
              <div className="absolute -top-3 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-amber-600 shadow-md">
                3
              </div>
              <div className="text-4xl mb-2">{top3?.avatar}</div>
              <div className="text-sm font-bold text-slate-200 truncate w-full">{top3?.name}</div>
              <div className="text-xs text-purple-300 mt-0.5">ห้อง {top3?.classroom}</div>
              <div className="mt-3 px-3 py-1 bg-slate-800 rounded-full text-amber-400 font-black text-xs flex items-center space-x-1">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{top3?.stars} ดาว</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Leaderboard Strip */}
        <div className="mt-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            อันดับทั้งหมด ({filteredStudents.length} คน)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filteredStudents.map((std, idx) => (
              <div
                key={std.id}
                className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0 mr-1">
                  <span className={`text-xs font-black ${idx < 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-base shrink-0">{std.avatar}</span>
                  <span className="text-xs font-bold text-slate-200 truncate">{std.name}</span>
                </div>
                <span className="text-amber-400 text-xs font-black shrink-0">
                  {std.stars}⭐
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Timer Pop-up */}
      {showTimer && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-amber-400 p-5 rounded-3xl shadow-2xl animate-scale-up text-center w-72">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase">Classroom Timer</span>
            <button onClick={() => setShowTimer(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-5xl font-black font-mono my-2 text-white">
            {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isTimerRunning ? 'หยุด' : 'เริ่ม'}</span>
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(180);
              }}
              className="p-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Wheel Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-purple-500 max-w-sm w-full p-8 rounded-3xl text-center shadow-2xl animate-scale-up relative">
            <button 
              onClick={() => setShowPicker(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-purple-400 mb-4 flex items-center justify-center space-x-2">
              <Shuffle className="w-5 h-5" />
              <span>สุ่มผู้โชคดีตอบคำถาม</span>
            </h3>

            {isPicking ? (
              <div className="py-8 animate-pulse">
                <div className="text-6xl mb-3">🎲</div>
                <div className="text-xl font-bold text-slate-300">กำลังสุ่ม...</div>
              </div>
            ) : pickerWinner ? (
              <div className="py-4 animate-scale-up">
                <div className="text-6xl mb-3">{pickerWinner.avatar}</div>
                <div className="text-2xl font-black text-white">{pickerWinner.name}</div>
                <div className="text-xs text-purple-400 font-bold mt-1">ห้อง {pickerWinner.classroom}</div>
                <div className="mt-6 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => {
                      addStars(pickerWinner.id, 0.5, 'ตอบคำถามถูก', 'กิจกรรมสุ่มบนจอ');
                      sounds.playStarEarned(true);
                      setShowPicker(false);
                    }}
                    className="px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Star className="w-4 h-4 fill-amber-600 text-amber-700" />
                    <span>ให้ +0.5 ดาว</span>
                  </button>
                  <button
                    onClick={() => {
                      addStars(pickerWinner.id, 1, 'ตอบคำถามถูก', 'กิจกรรมสุ่มบนจอ');
                      sounds.playStarEarned(false);
                      setShowPicker(false);
                    }}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>ให้ +1 ดาว</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
