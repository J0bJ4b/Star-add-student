import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { Student } from '../types';
import { AVATAR_OPTIONS } from '../lib/constants';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  Plus, 
  X, 
  Check, 
  FolderPlus,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    classrooms,
    activeClassroom,
    addStudent,
    batchAddStudents,
    editStudent,
    deleteStudent,
    addClassroom,
    deleteClassroom,
  } = useStudents();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Single Add Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState(classrooms[0] || 'ป.3/1');
  const [newStudentAvatar, setNewStudentAvatar] = useState(AVATAR_OPTIONS[0]);
  const [newStudentStars, setNewStudentStars] = useState('0');

  // Bulk Add Form State
  const [bulkText, setBulkText] = useState('');
  const [bulkClass, setBulkClass] = useState(classrooms[0] || 'ป.3/1');

  // Classroom Form State
  const [newClassName, setNewClassName] = useState('');

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClassFilter !== 'all' && s.classroom !== selectedClassFilter) return false;
    if (searchTerm.trim() && !s.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
      return false;
    }
    return true;
  });

  const handleCreateSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    addStudent(
      newStudentName.trim(),
      newStudentClass,
      newStudentAvatar,
      parseFloat(newStudentStars) || 0
    );
    setNewStudentName('');
    setIsAddModalOpen(false);
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    batchAddStudents(bulkText, bulkClass);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    editStudent(editingStudent.id, {
      name: editingStudent.name,
      classroom: editingStudent.classroom,
      avatar: editingStudent.avatar,
      stars: editingStudent.stars,
    });
    setEditingStudent(null);
  };

  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClassroom(newClassName.trim());
    setNewClassName('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header & Main Control Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-purple-50 text-purple-600">
              <Users className="w-6 h-6" />
            </span>
            <span>จัดการข้อมูลนักเรียน (Students)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เพิ่ม ลบ แก้ไขรายชื่อนักเรียน จัดการห้องเรียน และปรับแก้คะแนนดาว
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-open-classroom-modal"
            onClick={() => setIsClassroomModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-purple-600" />
            <span>จัดการห้องเรียน ({classrooms.length})</span>
          </button>

          <button
            id="btn-open-bulk-modal"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>นำเข้ารายชื่อชุดใหญ่</span>
          </button>

          <button
            id="btn-open-add-student-modal"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-heading shadow-md shadow-purple-500/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มนักเรียนใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-students-list"
            type="text"
            placeholder="ค้นหาชื่อนักเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Classroom Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1 whitespace-nowrap">ห้อง:</span>
          <button
            onClick={() => setSelectedClassFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedClassFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทุกห้อง ({students.length})
          </button>
          {classrooms.map((c) => {
            const count = students.filter((s) => s.classroom === c).length;
            return (
              <button
                key={c}
                onClick={() => setSelectedClassFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedClassFilter === c
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ห้อง {c} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold font-heading text-slate-600">ไม่พบรายชื่อนักเรียน</p>
            <p className="text-xs text-slate-400 mt-1">กดปุ่ม "เพิ่มนักเรียนใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">รูปภาพ & ชื่อ-นามสกุล</th>
                  <th className="p-4">ชั้นเรียน</th>
                  <th className="p-4 text-center">ดาวสะสมปัจจุบัน</th>
                  <th className="p-4 text-center">ประวัติความดี</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl shadow-2xs">
                          {student.avatar || '⭐'}
                        </div>
                        <div>
                          <span className="text-sm text-slate-900 block font-heading font-semibold">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            รหัส: {student.id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
                        {student.classroom}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 font-bold text-sm font-heading">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{student.stars}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-500">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                        {student.starHistory?.length || 0} ครั้ง
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          id={`btn-edit-student-${student.id}`}
                          onClick={() => setEditingStudent(student)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors"
                          title="แก้ไขข้อมูลนักเรียน"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-student-${student.id}`}
                          onClick={() => setDeletingStudent(student)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="ลบนักเรียน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Single Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>เพิ่มนักเรียนใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่อ-นามสกุล / ชื่อเล่นนักเรียน:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เด็กชายกิตติศักดิ์ ใจดี (ก้อง)"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ห้องเรียน:
                  </label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {classrooms.map((c) => (
                      <option key={c} value={c}>
                        ห้อง {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    คะแนนดาวเริ่มต้น:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newStudentStars}
                    onChange={(e) => setNewStudentStars(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  เลือกไอคอนประจำตัว (Avatar):
                </label>
                <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setNewStudentAvatar(av)}
                      className={`text-xl p-1.5 rounded-xl transition-all ${
                        newStudentAvatar === av
                          ? 'bg-purple-600 scale-110 shadow-xs'
                          : 'hover:bg-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/25 transition-all"
                >
                  บันทึกนักเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Import */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>นำเข้ารายชื่อนักเรียนแบบกลุ่ม (Bulk Import)</span>
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  เลือกห้องเรียนปลายทาง:
                </label>
                <select
                  value={bulkClass}
                  onChange={(e) => setBulkClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  {classrooms.map((c) => (
                    <option key={c} value={c}>
                      ห้อง {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  วางรายชื่อนักเรียน (1 บรรทัด ต่อ 1 คน):
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`เด็กชายกิตติศักดิ์ ใจดี\nเด็กหญิงกานดา สดใส\nเด็กชายธนภัทร รุ่งเรือง\nเด็กหญิงพิมพ์ชนก อักษรศิลป์`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ระบบจะสุ่มไอคอนประจำตัวและตั้งค่าดาวเริ่มต้นเป็น 0 ดาวโดยอัตโนมัติ
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  นำเข้ารายชื่อทั้งหมด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <span>แก้ไขข้อมูลนักเรียน</span>
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่อ-นามสกุล:
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ห้องเรียน:
                  </label>
                  <select
                    value={editingStudent.classroom}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, classroom: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {classrooms.map((c) => (
                      <option key={c} value={c}>
                        ห้อง {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    คะแนนดาวสะสม:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingStudent.stars}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        stars: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  เปลี่ยนไอคอน (Avatar):
                </label>
                <div className="grid grid-cols-8 gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setEditingStudent({ ...editingStudent, avatar: av })}
                      className={`text-xl p-1.5 rounded-xl transition-all ${
                        editingStudent.avatar === av
                          ? 'bg-purple-600 scale-110 shadow-xs'
                          : 'hover:bg-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                ยืนยันการลบนักเรียน?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <strong className="text-slate-800">{deletingStudent.name}</strong> ({deletingStudent.classroom}) ออกจากระบบ?
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  deleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Manage Classrooms */}
      {isClassroomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-600" />
                <span>จัดการห้องเรียน</span>
              </h3>
              <button
                onClick={() => setIsClassroomModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Class Form */}
            <form onSubmit={handleAddClassroom} className="flex gap-2">
              <input
                type="text"
                placeholder="ชื่อห้องใหม่ เช่น ป.4/2 หรือ ม.1/1"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl whitespace-nowrap"
              >
                เพิ่มห้อง
              </button>
            </form>

            {/* Classrooms List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pt-2">
              {classrooms.map((c) => {
                const count = students.filter((s) => s.classroom === c).length;
                return (
                  <div
                    key={c}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-medium"
                  >
                    <div>
                      <span className="font-bold text-slate-800">ห้อง {c}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({count} คน)</span>
                    </div>
                    {classrooms.length > 1 && (
                      <button
                        onClick={() => deleteClassroom(c)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="ลบห้องเรียน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsClassroomModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
