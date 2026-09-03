import React, { useState, useMemo } from 'react';
import { 
  Star, Search, Edit3, Trash2, Plus, Minus, Users, Gift, Moon, Sun, Volume2, VolumeX, Award,
  Sparkles, CheckCircle2, BookmarkCheck, FileText, Monitor
} from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import { Student, TabType } from '../types';
import { StudentDetailModal } from './StudentDetailModal';

import { StudentFormModal } from './StudentFormModal';

interface Props {
  onOpenBackup: () => void;
  onSelectTab?: (tab: TabType) => void;
}

export const HomeView: React.FC<Props> = ({ onOpenBackup, onSelectTab }) => {
  const { students, classrooms, addStars, editStudent, deleteStudent, setIsProjectorOpen } = useStudents();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [sortMethod, setSortMethod] = useState<'stars' | 'id'>('stars');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Mock for UI
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Derived state
  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectedClass !== 'all') {
      list = list.filter(s => s.classroom === selectedClass);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }
    
    // Sort
    if (sortMethod === 'stars') {
      list = [...list].sort((a, b) => b.stars - a.stars);
    } else {
      list = [...list].sort((a, b) => a.id.localeCompare(b.id)); // Assuming ID is roughly "เลขที่"
    }
    return list;
  }, [students, selectedClass, searchTerm, sortMethod]);

  const top3 = useMemo(() => {
    return [...students].sort((a, b) => b.stars - a.stars).slice(0, 3);
  }, [students]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Navbar */}
      <header className="bg-white rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black font-heading text-slate-800 flex items-center space-x-2">
              <span>ดาวเด็กดี</span>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </h1>
            <p className="text-xs font-bold text-purple-600">ระบบความดี & สิทธิพิเศษ</p>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-2 justify-center">
          <button 
            onClick={() => onSelectTab && onSelectTab('rewards')}
            className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>จัดการร้านสิทธิ์</span>
          </button>
          <button 
            onClick={() => onSelectTab && onSelectTab('classrooms')}
            className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>จัดการห้องเรียน</span>
          </button>
          <button 
            onClick={() => {
              setEditingStudent(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-sm font-bold shadow-md shadow-purple-600/20 flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>เพิ่มนักเรียน</span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
          
          <button onClick={() => setIsSoundOn(!isSoundOn)} className="w-10 h-10 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center transition-colors">
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsDarkTheme(!isDarkTheme)} className="px-3 h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl flex items-center space-x-1.5 transition-colors text-xs font-bold">
            {isDarkTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDarkTheme ? 'กลางคืน' : 'กลางวัน'}</span>
          </button>
        </div>
      </header>

      {/* Classroom Power Tools Quick Suite */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onSelectTab && onSelectTab('activities')}
          className="bg-white hover:bg-purple-50/60 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3 transition-all hover:border-purple-300 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">กิจกรรม & สุ่มชื่อ</div>
            <div className="text-[11px] text-slate-400 truncate">วงล้อ / แบ่งกลุ่ม</div>
          </div>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('attendance')}
          className="bg-white hover:bg-teal-50/60 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3 transition-all hover:border-teal-300 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">เช็คชื่อมาเรียน</div>
            <div className="text-[11px] text-slate-400 truncate">แจกดาวตรงเวลา</div>
          </div>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('badges')}
          className="bg-white hover:bg-amber-50/60 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3 transition-all hover:border-amber-300 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">เกณฑ์ความดี</div>
            <div className="text-[11px] text-slate-400 truncate">ตั้งค่าพฤติกรรม</div>
          </div>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('reports')}
          className="bg-white hover:bg-indigo-50/60 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3 transition-all hover:border-indigo-300 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">รายงาน & เกียรติบัตร</div>
            <div className="text-[11px] text-slate-400 truncate">ส่งออก Excel / พิมพ์</div>
          </div>
        </button>

        <button
          onClick={() => setIsProjectorOpen(true)}
          className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-3.5 rounded-2xl shadow-sm flex items-center space-x-3 transition-all text-left col-span-2 sm:col-span-1 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400/30 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">โหมดโปรเจกเตอร์</div>
            <div className="text-[11px] text-amber-100 truncate">ฉายจอใหญ่หน้าห้อง 🖥️</div>
          </div>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-3xl p-3 flex flex-col lg:flex-row items-center justify-between border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
          <button 
            onClick={() => setSelectedClass('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedClass === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            ทุกห้องเรียน ({students.length})
          </button>
          {classrooms.map(c => {
            const count = students.filter(s => s.classroom === c).length;
            return (
              <button 
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedClass === c ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                ห้อง {c} ({count})
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-colors whitespace-nowrap">
            <Star className="w-4 h-4" />
            <span>จัดการดาวทั้งห้อง</span>
          </button>
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหรือเลขที่..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
      </div>

      {/* 3. Leaderboard Top 3 */}
      {top3.length >= 3 && (
        <div className="bg-purple-50/50 rounded-[2.5rem] p-8 border border-purple-200/60 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-4 bg-white px-6 py-1.5 rounded-full border border-purple-200 text-purple-700 font-bold text-sm flex items-center space-x-2 shadow-sm">
            <Award className="w-4 h-4" />
            <span>อันดับดาวสะสมสูงสุด (ภาพรวมทั้งหมด)</span>
          </div>

          <div className="flex items-end justify-center gap-4 sm:gap-8 mt-12 w-full max-w-3xl relative">
            
            {/* Rank 2 */}
            <div className="flex flex-col items-center bg-slate-100/80 rounded-3xl p-4 w-32 sm:w-40 border border-slate-200/80 relative shadow-sm">
              <div className="absolute -top-3 bg-slate-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black border-2 border-white shadow-sm flex items-center space-x-1">
                <span>🥈 อันดับ 2</span>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-inner overflow-hidden mt-2">
                {top3[1].avatar.length > 2 ? <img src={top3[1].avatar} className="w-full h-full object-cover" /> : top3[1].avatar}
              </div>
              <div className="mt-3 text-center">
                <div className="font-black font-heading text-slate-800 text-sm sm:text-base">{top3[1].name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 truncate w-full">{top3[1].name}</div>
              </div>
              <div className="mt-2 flex items-center space-x-1 text-purple-600 font-bold text-sm bg-white px-3 py-1 rounded-full border border-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{top3[1].stars} ดาว</span>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center bg-white rounded-[2rem] p-5 w-40 sm:w-48 border-2 border-amber-300 relative shadow-xl shadow-amber-400/10 z-10 -translate-y-4">
              <div className="absolute -top-4 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-black border-2 border-white shadow-md flex items-center space-x-1">
                <span>🏆 อันดับ 1</span>
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-purple-50 flex items-center justify-center text-5xl shadow-inner overflow-hidden mt-3">
                {top3[0].avatar.length > 2 ? <img src={top3[0].avatar} className="w-full h-full object-cover" /> : top3[0].avatar}
              </div>
              <div className="mt-4 text-center">
                <div className="font-black font-heading text-slate-900 text-lg sm:text-xl">{top3[0].name.split(' ')[0]}</div>
                <div className="text-xs text-slate-500 truncate w-full">{top3[0].name}</div>
              </div>
              <div className="mt-3 flex items-center space-x-1.5 text-amber-600 font-black text-lg bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
                <Star className="w-5 h-5 fill-amber-500" />
                <span>{top3[0].stars} ดาว</span>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center bg-amber-100/50 rounded-3xl p-4 w-32 sm:w-40 border border-purple-200 relative shadow-sm">
              <div className="absolute -top-3 bg-amber-700 text-white px-3 py-0.5 rounded-full text-[10px] font-black border-2 border-white shadow-sm flex items-center space-x-1">
                <span>🥉 อันดับ 3</span>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-inner overflow-hidden mt-2">
                {top3[2].avatar.length > 2 ? <img src={top3[2].avatar} className="w-full h-full object-cover" /> : top3[2].avatar}
              </div>
              <div className="mt-3 text-center">
                <div className="font-black font-heading text-slate-800 text-sm sm:text-base">{top3[2].name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 truncate w-full">{top3[2].name}</div>
              </div>
              <div className="mt-2 flex items-center space-x-1 text-purple-600 font-bold text-sm bg-white px-3 py-1 rounded-full border border-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{top3[2].stars} ดาว</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Student List */}
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">รายชื่อนักเรียนทุกห้อง <span className="text-amber-500">{filteredStudents.length} คน</span></h2>
              <p className="text-[10px] text-slate-400">คลิกปุ่มเพื่อเลือกและสลับทิศทางการเรียงลำดับ</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">⬇ เรียงลำดับ:</span>
            <button 
              onClick={() => setSortMethod('stars')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-colors flex-1 sm:flex-none justify-center ${sortMethod === 'stars' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Star className={`w-3.5 h-3.5 ${sortMethod === 'stars' ? 'fill-white' : ''}`} />
              <span>1. เรียงตามดาว ⬇</span>
            </button>
            <button 
              onClick={() => setSortMethod('id')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-colors flex-1 sm:flex-none justify-center ${sortMethod === 'id' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. เรียงตามเลขที่ ⬇</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student, index) => {
            const rank = sortMethod === 'stars' && selectedClass === 'all' && !searchTerm ? index + 1 : 
                         top3.findIndex(s => s.id === student.id) + 1;
            
            return (
              <div key={student.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow relative group">
                
                {/* Top Row: Avatar & Actions */}
                <div className="flex justify-between items-start">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl overflow-hidden shadow-inner">
                      {student.avatar.length > 2 ? <img src={student.avatar} className="w-full h-full object-cover" /> : student.avatar}
                    </div>
                    <button 
                      onClick={() => {
                        setEditingStudent(student);
                        setIsFormModalOpen(true);
                      }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center border-2 border-white transition-colors">
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">
                      ป.{student.classroom}
                    </span>
                    <button onClick={() => setSelectedStudentForDetail(student)} className="w-6 h-6 rounded-full bg-slate-50 hover:bg-purple-100 text-slate-400 hover:text-purple-600 flex items-center justify-center transition-colors">
                      <Gift className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingStudent(student);
                        setIsFormModalOpen(true);
                      }}
                      className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`คุณต้องการลบรายชื่อ "${student.name}" ใช่หรือไม่?`)) {
                          deleteStudent(student.id);
                        }
                      }}
                      className="w-6 h-6 rounded-full bg-slate-50 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name & ID */}
                <div className="mt-3 relative">
                   <div className="flex items-center space-x-2">
                     <div className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                       # เลขที่ {student.id.slice(0, 3)}
                     </div>
                     {rank > 0 && rank <= 3 && (
                       <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                         rank === 1 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                         rank === 2 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                         'bg-amber-100 text-purple-700 border-purple-200'
                       }`}>
                         🏆 อันดับ {rank}
                       </div>
                     )}
                   </div>
                   <h3 className="text-lg font-black font-heading text-slate-800 mt-1">{student.name.split(' ')[0]}</h3>
                   <p className="text-xs text-slate-400 truncate">{student.name}</p>
                </div>

                {/* Stars Display */}
                <div className="my-4 flex items-center justify-between border-t border-b border-slate-50 py-2">
                  <div className="flex items-center space-x-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-xs font-bold">ดาวสะสม</span>
                  </div>
                  <div className="text-3xl font-black font-heading text-amber-500">
                    {student.stars}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => addStars(student.id, -1, 'หักดาว')}
                    title="หัก 1 ดาว"
                    className="w-9 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-bold transition-all active:scale-95 flex items-center justify-center shrink-0"
                  >
                    –1
                  </button>
                  <button 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const posX = (rect.left + rect.width / 2) / window.innerWidth;
                      const posY = (rect.top + rect.height / 2) / window.innerHeight;
                      addStars(student.id, 0.5, 'ความดีทั่วไป', undefined, posX, posY);
                    }}
                    title="เพิ่มครึ่งดาว (+0.5 ดาว)"
                    className="flex-1 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black transition-all active:scale-95 flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>+0.5</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const posX = (rect.left + rect.width / 2) / window.innerWidth;
                      const posY = (rect.top + rect.height / 2) / window.innerHeight;
                      addStars(student.id, 1, undefined, undefined, posX, posY);
                    }}
                    title="เพิ่ม 1 ดาว (+1 ดาว)"
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>1 ดาว</span>
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {selectedStudentForDetail && (
        <StudentDetailModal 
          student={selectedStudentForDetail} 
          onClose={() => setSelectedStudentForDetail(null)} 
        />
      )}

      {isFormModalOpen && (
        <StudentFormModal 
          student={editingStudent}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}
    </div>
  );
};
