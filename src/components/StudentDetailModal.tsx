import React, { useState } from 'react';
import { X, Gift, Star, Plus, Minus, History } from 'lucide-react';
import { Student } from '../types';
import { useStudents } from '../context/StudentContext';

interface Props {
  student: Student;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<Props> = ({ student, onClose }) => {
  const { addStars } = useStudents();
  const [bulkAmount, setBulkAmount] = useState('5');
  const [bulkReason, setBulkReason] = useState('');

  const handleBulkAdd = () => {
    const amt = parseFloat(bulkAmount);
    if (!isNaN(amt) && amt > 0) {
      addStars(student.id, amt, bulkReason || 'มอบดาวหลายดวง');
      setBulkAmount('');
      setBulkReason('');
    }
  };

  const handleBulkDeduct = () => {
    const amt = parseFloat(bulkAmount);
    if (!isNaN(amt) && amt > 0) {
      addStars(student.id, -amt, bulkReason || 'หักดาวหลายดวง');
      setBulkAmount('');
      setBulkReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative animate-fade-in">
        
        {/* Header - Orange Background */}
        <div className="bg-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl shadow-inner overflow-hidden border-2 border-white/20">
              {student.avatar.length > 2 ? <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" /> : student.avatar}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-black font-heading">{student.name.split(' ')[0]}</h2>
              <p className="text-sm font-medium text-purple-100">
                {student.name} (ห้อง {student.classroom} | เลขที่ {student.id.slice(0, 3)})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Rewards Redemption Banner */}
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-purple-900">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold font-heading">ใช้สิทธิ์แลกของรางวัล</h3>
                <p className="text-xs text-purple-600 font-medium">มีดาวสะสม: {student.stars} ดวง</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>แลกสิทธิ์</span>
            </button>
          </div>

          {/* Bulk Stars */}
          <div className="bg-purple-50/50 rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-purple-900 flex items-center space-x-2">
              <span>เพิ่ม / ลด ทีละหลายๆ ดาว พร้อมระบุเหตุผล</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h3>
            
            <div className="flex space-x-3">
              <div className="w-24 shrink-0">
                <label className="text-[10px] font-bold text-purple-800 mb-1 block">จำนวนดาว</label>
                <input 
                  type="number" 
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm font-bold text-center text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-purple-800 mb-1 block">เหตุผล / หมายเหตุ</label>
                <input 
                  type="text" 
                  placeholder="เช่น ชนะการประกวด, ช่วยงานโรงเรียน, ลืมการบ้าน..."
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={handleBulkDeduct} className="py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5">
                <Minus className="w-4 h-4" />
                <span>หักดาวหลายดวง</span>
              </button>
              <button onClick={handleBulkAdd} className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>มอบดาวหลายดวง</span>
              </button>
            </div>
          </div>

          {/* History */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <span>ประวัติรับดาว & การใช้สิทธิ์แลกรางวัล</span>
              </h3>
              <div className="flex items-center space-x-1.5 text-purple-600 font-black text-xl font-heading">
                <Star className="w-5 h-5 fill-amber-500" />
                <span>{student.stars} ดวง</span>
              </div>
            </div>

            <div className="space-y-2">
              {student.starHistory && student.starHistory.length > 0 ? (
                [...student.starHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${log.amount > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {log.amount > 0 ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {log.category} {log.note && `(${log.note})`} {log.amount > 0 ? `(+${log.amount})` : `(${log.amount})`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm">
                  ยังไม่มีประวัติการรับดาว
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
