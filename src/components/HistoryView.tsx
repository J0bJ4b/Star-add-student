import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  ArrowUpDown, 
  RotateCcw, 
  Star, 
  Calendar, 
  Sparkles, 
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const {
    getAllStarLogs,
    classrooms,
    categories,
    undoStarLog,
    activeClassroom,
  } = useStudents();

  const allLogs = getAllStarLogs();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(activeClassroom || 'all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-desc' | 'amount-asc'>('newest');

  // Filter logs
  const filteredLogs = allLogs
    .filter((log) => {
      if (selectedClassFilter !== 'all' && log.classroom !== selectedClassFilter) return false;
      if (selectedCategoryFilter !== 'all' && log.category !== selectedCategoryFilter) return false;
      if (
        searchTerm.trim() &&
        !log.studentName.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
        !log.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  // Aggregated Stats
  const totalPositiveStars = filteredLogs
    .filter((l) => l.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDeductedStars = filteredLogs
    .filter((l) => l.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalTransactions = filteredLogs.length;

  const avgPerTransaction =
    totalTransactions > 0
      ? (totalPositiveStars / (filteredLogs.filter((l) => l.amount > 0).length || 1)).toFixed(1)
      : '0';

  // Category breakdown for filtered logs
  const categorySummary = categories.map((cat) => {
    const logs = filteredLogs.filter((l) => l.category === cat.name);
    const starSum = logs.reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0);
    return {
      name: cat.name,
      count: logs.length,
      stars: starSum,
    };
  }).filter((c) => c.count > 0).sort((a, b) => b.stars - a.stars);

  const formatFullThaiDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-purple-50 text-purple-600">
              <HistoryIcon className="w-6 h-6" />
            </span>
            <span>บันทึกประวัติความดี (Star History & Logs)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบประวัติการให้ดาว ย้อนดูสถิติแยกตามหมวดหมู่ และกดยกเลิกการทำรายการได้
          </p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">ดาวที่มอบทั้งหมด</span>
          <div className="text-2xl font-black font-heading text-amber-600 mt-1">
            +{totalPositiveStars} <span className="text-xs font-normal text-slate-500">ดาว</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">จำนวนครั้งที่บันทึก</span>
          <div className="text-2xl font-black font-heading text-purple-700 mt-1">
            {totalTransactions} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">เฉลี่ยต่อการมอบ</span>
          <div className="text-2xl font-black font-heading text-indigo-600 mt-1">
            {avgPerTransaction} <span className="text-xs font-normal text-slate-500">ดาว/ครั้ง</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">ดาวที่ถูกหัก/แลกรางวัล</span>
          <div className="text-2xl font-black font-heading text-rose-600 mt-1">
            -{totalDeductedStars} <span className="text-xs font-normal text-slate-500">ดาว</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Tags */}
      {categorySummary.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-purple-600" />
            <span>สถิติตามหมวดหมู่ความดี:</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {categorySummary.map((cat) => (
              <div
                key={cat.name}
                className="px-3 py-1.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs flex items-center space-x-2"
              >
                <span className="font-semibold text-purple-900">{cat.name}:</span>
                <span className="font-bold text-amber-600">+{cat.stars} ดาว</span>
                <span className="text-[10px] text-slate-400">({cat.count} ครั้ง)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-history"
            type="text"
            placeholder="ค้นหาชื่อ หรือหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* Classroom Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกห้องเรียน</option>
            {classrooms.map((c) => (
              <option key={c} value={c}>
                ห้อง {c}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่ความดี</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value="แลกของรางวัล">แลกของรางวัล</option>
            <option value="หักดาว / ตักเตือน">หักดาว / ตักเตือน</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="newest">เวลา: ล่าสุด ➔ เก่าสุด</option>
            <option value="oldest">เวลา: เก่าสุด ➔ ล่าสุด</option>
            <option value="amount-desc">ดาว: มากสุด ➔ น้อยสุด</option>
            <option value="amount-asc">ดาว: น้อยสุด ➔ มากสุด</option>
          </select>

        </div>

      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <HistoryIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold font-heading text-slate-600">ไม่พบบันทึกประวัติการให้ดาว</p>
            <p className="text-xs text-slate-400 mt-1">เริ่มมอบดาวให้นักเรียนเพื่อบันทึกประวัติความดี</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                  <th className="p-4">วัน-เวลา</th>
                  <th className="p-4">นักเรียน</th>
                  <th className="p-4">ห้องเรียน</th>
                  <th className="p-4">หมวดหมู่ / เหตุผล</th>
                  <th className="p-4">หมายเหตุ</th>
                  <th className="p-4 text-center">จำนวนดาว</th>
                  <th className="p-4 text-right">ย้อนกลับ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => {
                  const isPositive = log.amount > 0;

                  return (
                    <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatFullThaiDate(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900 font-heading">
                        {log.studentName}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-semibold text-[11px]">
                          {log.classroom}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          log.category === 'แลกของรางวัล' ? 'bg-pink-100 text-pink-700' :
                          log.category.includes('หัก') ? 'bg-rose-100 text-rose-700' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 italic text-[11px] max-w-[200px] truncate">
                        {log.note || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-extrabold font-heading ${
                          isPositive
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPositive && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                          <span>{isPositive ? `+${log.amount}` : log.amount} ดาว</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => undoStarLog(log.id)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="ยกเลิกรายการนี้ (คืนค่าดาว)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
