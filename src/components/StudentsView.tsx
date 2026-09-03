import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';
import { StudentFormModal } from './StudentFormModal';
import { Student } from '../types';

export const StudentsView: React.FC = () => {
  const { students, classrooms, deleteStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = students.filter(s => {
    if (selectedClass !== 'all' && s.classroom !== selectedClass) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">จัดการนักเรียน</h2>
          <p className="text-slate-500">จัดการรายชื่อ ห้องเรียน และรูปโปรไฟล์ของนักเรียน</p>
        </div>
        <button
          onClick={() => { setEditingStudent(null); setIsFormOpen(true); }}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md shadow-orange-500/20 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มนักเรียนใหม่</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
        >
          <option value="all">ทุกห้องเรียน</option>
          {classrooms.map(c => <option key={c} value={c}>ห้อง {c}</option>)}
        </select>

        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหารายชื่อ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">โปรไฟล์</th>
                <th className="p-4 font-bold">ชื่อ - นามสกุล</th>
                <th className="p-4 font-bold">ห้องเรียน</th>
                <th className="p-4 font-bold text-center">ดาวสะสม</th>
                <th className="p-4 font-bold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl overflow-hidden shadow-inner">
                      {student.avatar.length > 2 ? (
                        <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
                      ) : (
                        <span>{student.avatar}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {student.name}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {student.id.slice(0, 8)}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                      ป.{student.classroom}
                    </span>
                  </td>
                  <td className="p-4 text-center font-black text-orange-500 text-lg">
                    {student.stars}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => { setEditingStudent(student); setIsFormOpen(true); }}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`คุณต้องการลบรายชื่อ "${student.name}" ใช่หรือไม่?`)) {
                            deleteStudent(student.id);
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <StudentFormModal 
          student={editingStudent} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};
