import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  GraduationCap, Plus, Edit3, Trash2, Users, Star, 
  Award, Check, X, ArrowRight, ChevronDown, ChevronUp, Layers, AlertTriangle
} from 'lucide-react';
import { TabType } from '../types';

interface Props {
  onNavigateTab?: (tab: TabType) => void;
}

export const ClassroomsView: React.FC<Props> = ({ onNavigateTab }) => {
  const { 
    classrooms, 
    students, 
    addClassroom, 
    deleteClassroom, 
    renameClassroom, 
    activeClassroom, 
    setActiveClassroom,
    editStudent
  } = useStudents();

  const [newClassName, setNewClassName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Edit state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editInputName, setEditInputName] = useState('');
  
  // Expanded classroom state for student list & transfer
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  
  // Delete confirm modal
  const [deletingClass, setDeletingClass] = useState<string | null>(null);

  const quickPresets = ['ป.1/1', 'ป.1/2', 'ป.2/1', 'ป.2/2', 'ป.3/1', 'ป.3/2', 'ป.4/1', 'ป.5/1', 'ป.6/1', 'ม.1/1'];

  const handleAddClassroom = (nameToAdd?: string) => {
    const targetName = (nameToAdd || newClassName).trim();
    if (!targetName) {
      setErrorMsg('กรุณากรอกชื่อห้องเรียน');
      return;
    }
    if (classrooms.includes(targetName)) {
      setErrorMsg(`ห้อง "${targetName}" มีอยู่ในระบบแล้ว`);
      return;
    }

    const success = addClassroom(targetName);
    if (success) {
      setSuccessMsg(`เพิ่มห้อง "${targetName}" เรียบร้อยแล้ว`);
      setNewClassName('');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 2500);
    } else {
      setErrorMsg('ไม่สามารถเพิ่มห้องเรียนได้');
    }
  };

  const handleStartRename = (className: string) => {
    setEditingName(className);
    setEditInputName(className);
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = editInputName.trim();
    if (!trimmed) return;
    if (trimmed === oldName) {
      setEditingName(null);
      return;
    }
    if (classrooms.includes(trimmed)) {
      alert(`ชื่อห้อง "${trimmed}" มีอยู่แล้ว`);
      return;
    }

    const success = renameClassroom(oldName, trimmed);
    if (success) {
      setEditingName(null);
      setSuccessMsg(`เปลี่ยนชื่อห้องจาก "${oldName}" เป็น "${trimmed}" สำเร็จ`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleConfirmDelete = (className: string) => {
    deleteClassroom(className);
    setDeletingClass(null);
    setSuccessMsg(`ลบห้อง "${className}" ออกจากระบบแล้ว`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Stats calculation
  const totalStudents = students.length;
  const totalStars = students.reduce((sum, s) => sum + s.stars, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-heading text-slate-800 flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span>จัดการห้องเรียน</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม แก้ไข และจัดกลุ่มนักเรียนในแต่ละชั้นเรียน
          </p>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>ห้องเรียน: <b className="text-purple-700 text-sm">{classrooms.length}</b></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span>นักเรียน: <b className="text-slate-800 text-sm">{totalStudents}</b></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>ดาวรวม: <b className="text-amber-600 text-sm">{totalStars}</b></span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center space-x-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Classroom Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center space-x-2">
          <Plus className="w-5 h-5 text-purple-600" />
          <span>เพิ่มห้องเรียนใหม่</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="พิมพ์ชื่อห้อง เช่น ป.1/1, ป.4/2, ม.1/3..."
            value={newClassName}
            onChange={(e) => {
              setNewClassName(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddClassroom();
            }}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleAddClassroom()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างห้องเรียน</span>
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-3.5 flex items-center flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 font-bold mr-1">หรือเลือกด่วน:</span>
          {quickPresets.map((preset) => {
            const isExists = classrooms.includes(preset);
            return (
              <button
                key={preset}
                disabled={isExists}
                onClick={() => handleAddClassroom(preset)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  isExists 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 border border-purple-100'
                }`}
                title={isExists ? 'มีห้องนี้อยู่แล้ว' : `คลิกเพื่อเพิ่มห้อง ${preset}`}
              >
                + {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Classroom List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {classrooms.map((c) => {
          const roomStudents = students.filter((s) => s.classroom === c);
          const roomStars = roomStudents.reduce((sum, s) => sum + s.stars, 0);
          const avgStars = roomStudents.length > 0 ? (roomStars / roomStudents.length).toFixed(1) : '0';
          const topStudent = [...roomStudents].sort((a, b) => b.stars - a.stars)[0];
          const isExpanded = expandedClass === c;
          const isActive = activeClassroom === c;

          return (
            <div 
              key={c} 
              className={`bg-white rounded-3xl border transition-all shadow-sm flex flex-col ${
                isActive ? 'border-purple-400 ring-2 ring-purple-400/20' : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div className="flex-1 mr-3">
                  {editingName === c ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editInputName}
                        onChange={(e) => setEditInputName(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-purple-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 w-32"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(c);
                          if (e.key === 'Escape') setEditingName(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveRename(c)}
                        className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm"
                        title="บันทึก"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingName(null)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                        title="ยกเลิก"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-black font-heading text-slate-800">
                        ห้อง {c}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full">
                          เลือกอยู่
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">ชั้นเรียนประถมศึกษา/มัธยมศึกษา</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartRename(c)}
                    className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="แก้ไขชื่อห้อง"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingClass(c)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="ลบห้องนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Block */}
              <div className="p-5 grid grid-cols-3 gap-2 bg-slate-50/70 border-b border-slate-100 text-center">
                <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">นักเรียน</div>
                  <div className="text-lg font-black text-slate-800">{roomStudents.length} <span className="text-xs font-medium text-slate-400">คน</span></div>
                </div>
                <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">ดาวรวม</div>
                  <div className="text-lg font-black text-amber-500 flex items-center justify-center space-x-1">
                    <span>{roomStars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">เฉลี่ย/คน</div>
                  <div className="text-lg font-black text-purple-600">{avgStars}</div>
                </div>
              </div>

              {/* Top Student in this room */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg overflow-hidden shrink-0">
                    {topStudent ? (
                      topStudent.avatar.length > 2 ? (
                        <img src={topStudent.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span>{topStudent.avatar}</span>
                      )
                    ) : (
                      <Award className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-amber-600 uppercase flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>อันดับ 1 ของห้อง</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 truncate">
                      {topStudent ? topStudent.name : 'ยังไม่มีข้อมูลนักเรียน'}
                    </div>
                  </div>
                </div>
                {topStudent && (
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                    ⭐ {topStudent.stars}
                  </span>
                )}
              </div>

              {/* Expanded Students List */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 max-h-64 overflow-y-auto space-y-2">
                  <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                    <span>รายชื่อนักเรียนในห้อง ({roomStudents.length} คน)</span>
                    <span className="text-[10px] text-slate-400">ย้ายห้องได้โดยเลือกห้องใหม่</span>
                  </div>
                  {roomStudents.map((std) => (
                    <div key={std.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center space-x-2 truncate mr-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm overflow-hidden shrink-0">
                          {std.avatar.length > 2 ? (
                            <img src={std.avatar} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span>{std.avatar}</span>
                          )}
                        </div>
                        <span className="font-bold text-slate-700 truncate">{std.name}</span>
                        <span className="text-amber-500 font-bold shrink-0">({std.stars}⭐)</span>
                      </div>
                      
                      {/* Transfer to another classroom */}
                      <select
                        value={std.classroom}
                        onChange={(e) => {
                          editStudent(std.id, { classroom: e.target.value });
                          setSuccessMsg(`ย้าย "${std.name}" ไปห้อง ${e.target.value} แล้ว`);
                          setTimeout(() => setSuccessMsg(''), 2500);
                        }}
                        className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:ring-1 focus:ring-purple-400"
                        title="ย้ายไปห้องอื่น"
                      >
                        {classrooms.map((target) => (
                          <option key={target} value={target}>ห้อง {target}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {roomStudents.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 font-bold">
                      ยังไม่มีนักเรียนในห้องนี้
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 mt-auto flex items-center space-x-2">
                <button
                  onClick={() => setExpandedClass(isExpanded ? null : c)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center justify-center space-x-1"
                >
                  <span>รายชื่อ ({roomStudents.length})</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    setActiveClassroom(c);
                    if (onNavigateTab) {
                      onNavigateTab('dashboard');
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs ${
                    isActive 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <span>เข้าสู่ห้องนี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {classrooms.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">ยังไม่มีห้องเรียนในระบบ</h3>
            <p className="text-slate-400 text-sm mt-1">กดสร้างห้องเรียนใหม่ด้านบนเพื่อเริ่มต้นได้เลยครับ</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-800">
              ยืนยันการลบห้อง "{deletingClass}"?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2">
              ห้องนี้มีนักเรียนทั้งหมด {students.filter(s => s.classroom === deletingClass).length} คน<br/>
              (การลบห้องเรียนจะไม่ลบประวัติดาว แต่นักเรียนจะถูกย้ายหรือจัดกลุ่มใหม่)
            </p>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setDeletingClass(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingClass)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 transition-all"
              >
                ยืนยันลบห้อง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
