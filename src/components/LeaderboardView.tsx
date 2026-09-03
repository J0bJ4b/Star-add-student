import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { Award, Trophy, Medal, Search } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { students, classrooms } = useStudents();
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students.filter(s => {
    if (selectedClass !== 'all' && s.classroom !== selectedClass) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.stars - a.stars);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>สรุปอันดับดาวเด็กดี</span>
          </h2>
          <p className="text-slate-500">จัดอันดับนักเรียนที่มีดาวสะสมสูงสุด</p>
        </div>
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
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-bold text-center w-24">อันดับ</th>
              <th className="p-4 font-bold">นักเรียน</th>
              <th className="p-4 font-bold text-center">ห้องเรียน</th>
              <th className="p-4 font-bold text-right">ดาวสะสม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((student, index) => {
              const rank = index + 1;
              return (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-center">
                    {rank === 1 ? (
                      <div className="w-10 h-10 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black text-lg border border-amber-200">1</div>
                    ) : rank === 2 ? (
                      <div className="w-10 h-10 mx-auto bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-black text-lg border border-slate-300">2</div>
                    ) : rank === 3 ? (
                      <div className="w-10 h-10 mx-auto bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-black text-lg border border-orange-200">3</div>
                    ) : (
                      <div className="w-10 h-10 mx-auto text-slate-400 flex items-center justify-center font-bold text-lg">{rank}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl overflow-hidden shadow-inner border border-slate-200">
                        {student.avatar.length > 2 ? (
                          <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
                        ) : (
                          <span>{student.avatar}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-400">ID: {student.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                      ป.{student.classroom}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                      <span className="font-black text-orange-500 text-lg">{student.stars}</span>
                      <Award className="w-5 h-5 text-orange-500 fill-orange-500" />
                    </div>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
