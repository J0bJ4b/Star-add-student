import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Star, 
  Plus, 
  Minus, 
  Check, 
  Users, 
  Sparkles, 
  CheckSquare, 
  Square,
  LayoutGrid,
  List,
  MessageSquare
} from 'lucide-react';

export const AddStarView: React.FC = () => {
  const {
    students,
    activeClassroom,
    categories,
    selectedCategory,
    setSelectedCategory,
    addStars,
    deductStars,
    batchAddStars,
  } = useStudents();

  // Search, Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [starRangeFilter, setStarRangeFilter] = useState<'all' | '0-5' | '6-15' | '16+'>('all');
  const [sortBy, setSortBy] = useState<'stars-desc' | 'stars-asc' | 'name-asc' | 'name-desc'>('stars-desc');
  const [customNote, setCustomNote] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-select batch mode
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Filter students
  const filteredStudents = students
    .filter((s) => {
      // Classroom filter
      if (activeClassroom !== 'all' && s.classroom !== activeClassroom) return false;

      // Name search
      if (searchTerm.trim() && !s.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
        return false;
      }

      // Star range filter
      if (starRangeFilter === '0-5' && (s.stars < 0 || s.stars > 5)) return false;
      if (starRangeFilter === '6-15' && (s.stars < 6 || s.stars > 15)) return false;
      if (starRangeFilter === '16+' && s.stars < 16) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'stars-desc') return b.stars - a.stars;
      if (sortBy === 'stars-asc') return a.stars - b.stars;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'th');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'th');
      return 0;
    });

  // Batch toggle handlers
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleBatchAward = (amount: number) => {
    if (selectedStudentIds.length === 0) return;
    batchAddStars(selectedStudentIds, amount, selectedCategory, customNote || undefined);
    setSelectedStudentIds([]);
    setIsBatchMode(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header & Category Selection Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-purple-100 shadow-xs space-y-5">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="text-2xl animate-star-pulse">⭐</span>
              <span>มอบดาวความดี (Add Star)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              เลือกเหตุผลความดี แล้วกดปุ่มเพื่อเพิ่มหรือลดคะแนนดาวความดีให้นักเรียน
            </p>
          </div>

          {/* Batch Mode Switch */}
          <div className="flex items-center gap-2">
            <button
              id="btn-batch-mode-toggle"
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedStudentIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                isBatchMode
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/25'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isBatchMode ? 'ปิดโหมดเลือกหลายคน' : 'โหมดให้ดาวหลายคนพร้อมกัน'}</span>
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2.5 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>เลือกหมวดหมู่ความดีที่มอบ:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 scale-102 ring-2 ring-purple-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Note Input */}
        <div className="flex items-center space-x-2 bg-slate-50 rounded-2xl px-3.5 py-2 border border-slate-200">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <input
            id="input-custom-note"
            type="text"
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี เช่น ชื่อวิชา, ครั้งที่ 3, รางวัลพิเศษ)..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

      </div>

      {/* Batch Control Action Bar (Sticky when batch mode active) */}
      {isBatchMode && (
        <div className="bg-linear-to-r from-purple-700 to-indigo-700 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <button
              onClick={selectAllFiltered}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              {selectedStudentIds.length === filteredStudents.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <div>
              <span className="text-sm font-bold font-heading">
                เลือกนักเรียน {selectedStudentIds.length} จาก {filteredStudents.length} คน
              </span>
              <p className="text-[11px] text-purple-200">
                หมวดหมู่: <span className="font-semibold text-amber-300">{selectedCategory}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-purple-200 hidden md:inline">มอบดาวทั้งกลุ่ม:</span>
            <button
              id="btn-batch-add-half"
              disabled={selectedStudentIds.length === 0}
              onClick={() => handleBatchAward(0.5)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-purple-950 text-xs font-bold rounded-xl shadow-xs transition-transform transform active:scale-95 cursor-pointer"
            >
              +½ ดาว (+0.5)
            </button>
            <button
              id="btn-batch-add-one"
              disabled={selectedStudentIds.length === 0}
              onClick={() => handleBatchAward(1)}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-purple-950 text-xs font-bold rounded-xl shadow-md transition-transform transform active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5 fill-purple-950" />
              <span>+1 ดาวเต็ม</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-student-star"
            type="text"
            placeholder="ค้นหาชื่อนักเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Filter by Star Range & Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Star Range */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 px-1.5 hidden sm:inline">ช่วงดาว:</span>
            {(['all', '0-5', '6-15', '16+'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setStarRangeFilter(range)}
                className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
                  starRangeFilter === range
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {range === 'all' ? 'ทั้งหมด' : range}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center bg-slate-50 rounded-xl px-2.5 py-1 border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              id="select-sort-add-star"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-medium bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="stars-desc">ดาวมาก ➔ น้อย</option>
              <option value="stars-asc">ดาวน้อย ➔ มาก</option>
              <option value="name-asc">ชื่อ ก ➔ ฮ</option>
              <option value="name-desc">ชื่อ ฮ ➔ ก</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="แบบการ์ด"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="แบบตาราง"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Student Cards or Table Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
          <Star className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 font-heading">ไม่พบรายชื่อนักเรียน</h3>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มรายชื่อนักเรียนใหม่</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredStudents.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);

            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-400 bg-purple-50/30 shadow-md'
                    : 'border-slate-100 hover:border-purple-200 hover:shadow-lg shadow-xs'
                }`}
              >
                {/* Batch selection checkbox */}
                {isBatchMode && (
                  <button
                    onClick={() => toggleSelectStudent(student.id)}
                    className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 text-purple-600 hover:bg-purple-50"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-purple-600 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                )}

                {/* Top Info */}
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl shadow-xs ring-1 ring-purple-100 shrink-0">
                    {student.avatar || '⭐'}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-sm font-bold text-slate-900 font-heading truncate">
                      {student.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {student.classroom}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center Stars Display */}
                <div className="my-4 py-3 px-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/70 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-star-pulse" />
                    <span className="text-xs font-medium text-amber-900">คะแนนดาว:</span>
                  </div>
                  <div className="text-xl font-extrabold font-heading text-amber-600">
                    {student.stars}
                  </div>
                </div>

                {/* Quick Star Control Buttons */}
                <div className="space-y-2">
                  {/* Positive Add Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-add-half-${student.id}`}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const posX = (rect.left + rect.width / 2) / window.innerWidth;
                        const posY = (rect.top + rect.height / 2) / window.innerHeight;
                        addStars(student.id, 0.5, selectedCategory, customNote || undefined, posX, posY);
                      }}
                      className="py-2 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold font-heading flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title="เพิ่มครึ่งดาว (+0.5)"
                    >
                      <Plus className="w-3 h-3 text-amber-700" />
                      <span>+½ ดาว</span>
                    </button>

                    <button
                      id={`btn-add-one-${student.id}`}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const posX = (rect.left + rect.width / 2) / window.innerWidth;
                        const posY = (rect.top + rect.height / 2) / window.innerHeight;
                        addStars(student.id, 1, selectedCategory, customNote || undefined, posX, posY);
                      }}
                      className="py-2 px-2 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-xl text-xs font-extrabold font-heading flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-400/25 ring-1 ring-amber-400"
                      title="เพิ่ม 1 ดาวเต็ม (+1.0)"
                    >
                      <Star className="w-3.5 h-3.5 fill-purple-950 text-purple-950" />
                      <span>+1 ดาว</span>
                    </button>
                  </div>

                  {/* Negative Deduct Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-deduct-half-${student.id}`}
                      onClick={() => deductStars(student.id, 0.5, 'หักดาว / ตักเตือน', customNote || undefined)}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-slate-100"
                      title="ลดครึ่งดาว (-0.5)"
                    >
                      <Minus className="w-2.5 h-2.5" />
                      <span>-½ ดาว</span>
                    </button>

                    <button
                      id={`btn-deduct-one-${student.id}`}
                      onClick={() => deductStars(student.id, 1, 'หักดาว / ตักเตือน', customNote || undefined)}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-slate-100"
                      title="ลด 1 ดาว (-1.0)"
                    >
                      <Minus className="w-2.5 h-2.5" />
                      <span>-1 ดาว</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                  {isBatchMode && <th className="p-4 w-10">เลือก</th>}
                  <th className="p-4">นักเรียน</th>
                  <th className="p-4">ห้องเรียน</th>
                  <th className="p-4 text-center">ดาวสะสม</th>
                  <th className="p-4 text-center">เพิ่มดาว (+½ / +1)</th>
                  <th className="p-4 text-center">ลดดาว (-½ / -1)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-purple-50/40 transition-colors ${
                        isSelected ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      {isBatchMode && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(student.id)}
                            className="rounded text-purple-600 focus:ring-purple-400"
                          />
                        </td>
                      )}
                      <td className="p-4 font-bold text-slate-800 flex items-center space-x-2.5">
                        <span className="text-xl">{student.avatar}</span>
                        <span>{student.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-semibold">
                          {student.classroom}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-base font-extrabold font-heading text-amber-600 flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                          <span>{student.stars}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              addStars(student.id, 0.5, selectedCategory, customNote || undefined, rect.left / window.innerWidth, rect.top / window.innerHeight);
                            }}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold"
                          >
                            +½
                          </button>
                          <button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              addStars(student.id, 1, selectedCategory, customNote || undefined, rect.left / window.innerWidth, rect.top / window.innerHeight);
                            }}
                            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-lg font-extrabold shadow-xs"
                          >
                            +1 ดาว
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => deductStars(student.id, 0.5, 'หักดาว / ตักเตือน', customNote || undefined)}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg font-medium"
                          >
                            -½
                          </button>
                          <button
                            onClick={() => deductStars(student.id, 1, 'หักดาว / ตักเตือน', customNote || undefined)}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg font-medium"
                          >
                            -1
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
