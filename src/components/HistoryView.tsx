import React, { useState, useMemo } from 'react';
import { useStudents } from '../context/StudentContext';
import { History, Search, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { getAllStarLogs, undoStarLog, students } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');

  const logs = getAllStarLogs();
  
  const filteredLogs = useMemo(() => {
    let result = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(log => log.studentName.toLowerCase().includes(q) || log.category.toLowerCase().includes(q));
    }
    return result;
  }, [logs, searchTerm]);

  const getStudentAvatar = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.avatar || '👤';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-500" />
            <span>ประวัติการทำรายการ</span>
          </h2>
          <p className="text-slate-500">ตรวจสอบประวัติการให้ดาว ลบดาว และการแลกรางวัลย้อนหลัง</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน หรือรายการ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">เวลา</th>
                <th className="p-4 font-bold">นักเรียน</th>
                <th className="p-4 font-bold">รายการ / เหตุผล</th>
                <th className="p-4 font-bold text-center">จำนวนดาว</th>
                <th className="p-4 font-bold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const isPositive = log.amount > 0;
                const date = new Date(log.timestamp);
                const avatar = getStudentAvatar(log.studentId);
                const isImage = avatar.length > 2;
                
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-800">{date.toLocaleDateString('th-TH')}</div>
                      <div className="text-xs text-slate-400">{date.toLocaleTimeString('th-TH')}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl overflow-hidden border border-slate-200">
                          {isImage ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{log.studentName}</div>
                          <div className="text-[10px] text-slate-400">ป.{log.classroom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-700">{log.category}</div>
                      {log.note && <div className="text-xs text-slate-500 mt-0.5">{log.note}</div>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-black ${
                        isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{isPositive ? '+' : ''}{log.amount}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          if (confirm('คุณต้องการยกเลิก (Undo) รายการนี้ใช่หรือไม่?')) {
                            undoStarLog(log.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ยกเลิกรายการนี้"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                    ไม่มีประวัติการทำรายการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
