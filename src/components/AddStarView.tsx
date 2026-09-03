import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { Search, Star, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { FloatingParticles } from './FloatingParticles';

export const AddStarView: React.FC = () => {
  const { students, classrooms, batchAddStars } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = students.filter(s => {
    if (selectedClass !== 'all' && s.classroom !== selectedClass) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(s => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || amount === 0) return;

    batchAddStars(selectedIds, amount, note || 'มอบดาวพิเศษ');
    setShowSuccess(true);
    setSelectedIds([]);
    setNote('');
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">มอบดาวแบบกลุ่ม</h2>
        <p className="text-slate-500">เลือกนักเรียนหลายคนเพื่อมอบดาวพร้อมกัน</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
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

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button onClick={selectAll} className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors">
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span>เลือกทั้งหมด ({filtered.length})</span>
                </button>
              </div>
              <div className="text-sm font-bold text-slate-500">
                เลือกแล้ว <span className="text-amber-500">{selectedIds.length}</span> คน
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {filtered.map(student => {
                const isSelected = selectedIds.includes(student.id);
                return (
                  <div 
                    key={student.id}
                    onClick={() => toggleSelect(student.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-3 flex flex-col items-center text-center transition-all ${
                      isSelected ? 'border-purple-600 bg-purple-50' : 'border-slate-100 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 overflow-hidden shadow-inner ${
                      isSelected ? 'bg-white' : 'bg-slate-50'
                    }`}>
                      {student.avatar.length > 2 ? (
                        <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
                      ) : (
                        <span>{student.avatar}</span>
                      )}
                    </div>
                    <div className="font-bold text-slate-800 text-sm truncate w-full">{student.name.split(' ')[0]}</div>
                    <div className="text-xs text-slate-500 mt-1">⭐ {student.stars}</div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 font-bold">
                  ไม่พบนักเรียน
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>กำหนดจำนวนดาว</span>
            </h3>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">จำนวนดาวที่ต้องการให้</label>
                <div className="flex items-center space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setAmount(a => Math.max(0.5, Number((a - 0.5).toFixed(1))))} 
                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 h-12 text-center text-2xl font-black text-amber-500 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button 
                    type="button" 
                    onClick={() => setAmount(a => Number((a + 0.5).toFixed(1)))} 
                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Quick amount presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[0.5, 1, 2, 3, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-2 ring-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {val === 0.5 ? '⭐ +0.5 ดาว' : `+${val} ดาว`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">หมายเหตุ / เหตุผล (ไม่บังคับ)</label>
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="เช่น ตั้งใจเรียน, ทำเวร..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={selectedIds.length === 0 || amount === 0}
                className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg shadow-md shadow-purple-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>มอบให้ {selectedIds.length} คน</span>
              </button>
            </div>
            
            {showSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center space-x-2 animate-fade-in font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>มอบดาวสำเร็จ!</span>
                <FloatingParticles count={15} color="#10b981" />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
