import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  FileText, Download, Printer, Award, Star, CheckCircle, 
  Users, Sparkles, Filter, Calendar, ExternalLink
} from 'lucide-react';
import { sounds } from '../lib/audio';

export const ReportsView: React.FC = () => {
  const { students, classrooms, activeClassroom, setActiveClassroom, attendance, getAllStarLogs } = useStudents();

  const [activeTab, setActiveTab] = useState<'export' | 'certificate' | 'cards'>('export');

  // Filter students
  const filteredStudents = activeClassroom === 'all'
    ? [...students].sort((a, b) => b.stars - a.stars)
    : students.filter((s) => s.classroom === activeClassroom).sort((a, b) => b.stars - a.stars);

  // ==========================================
  // 1. CSV EXPORT HELPERS (with UTF-8 BOM for Thai Excel support)
  // ==========================================
  const downloadCSV = (content: string, filename: string) => {
    const BOM = '\uFEFF'; // UTF-8 Byte Order Mark for Excel
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sounds.playClick();
  };

  const handleExportStudentsCSV = () => {
    let csv = 'รหัสนักเรียน,ชื่อ-สกุล,ห้องเรียน,ดาวสะสมปัจจุบัน,จำนวนครั้งที่ได้ดาว,แลกรางวัลแล้ว (ชิ้น)\n';
    filteredStudents.forEach((s) => {
      const historyCount = s.starHistory?.length || 0;
      const claimCount = s.claimedRewards?.length || 0;
      csv += `"${s.id}","${s.name}","${s.classroom}",${s.stars},${historyCount},${claimCount}\n`;
    });
    const classroomName = activeClassroom === 'all' ? 'ทุกห้อง' : `ห้อง-${activeClassroom}`;
    downloadCSV(csv, `สรุปคะแนนดาวนักเรียน_${classroomName}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportHistoryCSV = () => {
    const logs = getAllStarLogs();
    let csv = 'วัน-เวลา,ชื่อนักเรียน,ห้องเรียน,จำนวนดาว,พฤติกรรม/หมวดหมู่,หมายเหตุ\n';
    logs.forEach((l) => {
      const dateStr = new Date(l.timestamp).toLocaleString('th-TH');
      csv += `"${dateStr}","${l.studentName}","${l.classroom}",${l.amount},"${l.category}","${l.note || '-'}"\n`;
    });
    downloadCSV(csv, `ประวัติการให้ดาวทั้งหมด_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportAttendanceCSV = () => {
    let csv = 'วันที่,ชื่อนักเรียน,ห้องเรียน,สถานะ\n';
    attendance.forEach((a) => {
      const statusTh = a.status === 'present' ? 'มาเรียน' : a.status === 'late' ? 'สาย' : a.status === 'absent' ? 'ขาด' : 'ลา';
      csv += `"${a.date}","${a.studentName}","${a.classroom}","${statusTh}"\n`;
    });
    downloadCSV(csv, `ประวัติการเช็คชื่อ_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // ==========================================
  // 2. CERTIFICATE GENERATOR STATE
  // ==========================================
  const [certType, setCertType] = useState('นักเรียนดาวเด่นยอดเยี่ยมประจำเดือน');
  const [schoolName, setSchoolName] = useState('โรงเรียนอนุบาลและประถมศึกษาดีเด่น');
  const [teacherName, setTeacherName] = useState('คุณครูประจำชั้น');
  const [certDate, setCertDate] = useState(new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(filteredStudents[0]?.id || '');

  const selectedStudentForCert = students.find((s) => s.id === selectedStudentId) || filteredStudents[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black font-heading text-slate-800 flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span>ระบบรายงาน & พิมพ์เกียรติบัตร</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            ส่งออกไฟล์ Excel/CSV พิมพ์เกียรติบัตรเด็กดี และบัตรสะสมแต้มดาว
          </p>
        </div>

        {/* Classroom selector */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400">ห้องเรียน:</span>
          <select
            value={activeClassroom}
            onChange={(e) => setActiveClassroom(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกห้อง ({students.length} คน)</option>
            {classrooms.map((c) => (
              <option key={c} value={c}>ห้อง {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl gap-1.5 max-w-md print:hidden">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'export' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>ส่งออก Excel/CSV</span>
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'certificate' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>พิมพ์เกียรติบัตร</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'cards' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>บัตรสะสมดาว</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. TAB: EXPORT CSV / EXCEL */}
      {/* ========================================================= */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in print:hidden">
          {/* Card 1: Students Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-800">
                สรุปคะแนนดาวนักเรียน
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                ส่งออกรายชื่อนักเรียน คะแนนดาวสะสมปัจจุบัน สถิติการได้รับดาว และจำนวนการแลกของรางวัล
              </p>
              <div className="mt-4 text-xs font-bold text-slate-400">
                นักเรียนในขอบเขต: {filteredStudents.length} คน
              </div>
            </div>

            <button
              onClick={handleExportStudentsCSV}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ .CSV (Excel)</span>
            </button>
          </div>

          {/* Card 2: Star Logs History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-800">
                ประวัติการให้ดาวทั้งหมด
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                ส่งออกบันทึกไทม์ไลน์ทุกรายการ วันเวลาที่ให้ดาว ผู้รับ จำนวนดาว เหตุผล และหมายเหตุละเอียด
              </p>
              <div className="mt-4 text-xs font-bold text-slate-400">
                บันทึกทั้งหมด: {getAllStarLogs().length} รายการ
              </div>
            </div>

            <button
              onClick={handleExportHistoryCSV}
              className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ .CSV (Excel)</span>
            </button>
          </div>

          {/* Card 3: Attendance Logs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-slate-800">
                บันทึกการเช็คชื่อ
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                ส่งออกประวัติการมาเรียนรายวัน (มา, สาย, ขาด, ลา) สำหรับนำไปสรุปการมาเรียนประจำเดือน
              </p>
              <div className="mt-4 text-xs font-bold text-slate-400">
                บันทึกการเช็คชื่อ: {attendance.length} รายการ
              </div>
            </div>

            <button
              onClick={handleExportAttendanceCSV}
              className="mt-6 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ .CSV (Excel)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB: CERTIFICATE GENERATOR */}
      {/* ========================================================= */}
      {activeTab === 'certificate' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">เลือกนักเรียน:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer"
              >
                {filteredStudents.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    #{idx + 1} {s.name} ({s.stars} ⭐)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ประเภทเกียรติบัตร:</label>
              <input
                type="text"
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ชื่อโรงเรียน:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>สั่งพิมพ์ / บันทึก PDF</span>
              </button>
            </div>
          </div>

          {/* Real-time Certificate Paper Preview (A4 ratio landscape) */}
          <div className="flex justify-center">
            <div 
              id="certificate-print-area"
              className="bg-white border-12 border-double border-amber-600/70 p-8 sm:p-14 rounded-2xl shadow-xl max-w-4xl w-full text-center relative overflow-hidden bg-radial from-amber-50/40 via-white to-amber-50/20 print:border-8 print:p-10 print:shadow-none"
              style={{ minHeight: '520px' }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-amber-500 font-serif text-2xl select-none">⚜️</div>
              <div className="absolute top-3 right-3 text-amber-500 font-serif text-2xl select-none">⚜️</div>
              <div className="absolute bottom-3 left-3 text-amber-500 font-serif text-2xl select-none">⚜️</div>
              <div className="absolute bottom-3 right-3 text-amber-500 font-serif text-2xl select-none">⚜️</div>

              {/* School Header */}
              <div className="text-sm sm:text-base font-bold text-slate-600 tracking-wider uppercase mb-1">
                {schoolName}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-serif text-amber-800 tracking-wide mb-1">
                เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
              </h1>
              <div className="w-32 h-1 bg-amber-400 mx-auto rounded-full my-4" />

              {/* Student Name */}
              <div className="my-6">
                <div className="text-3xl sm:text-4xl font-black text-purple-900 border-b-2 border-dotted border-purple-300 inline-block px-8 py-2">
                  {selectedStudentForCert?.name}
                </div>
                <p className="text-sm font-bold text-slate-600 mt-2">
                  นักเรียนชั้นประถมศึกษา {selectedStudentForCert?.classroom}
                </p>
              </div>

              {/* Certificate Text */}
              <p className="text-base sm:text-lg font-bold text-slate-700 max-w-2xl mx-auto leading-relaxed my-4">
                ได้รับรางวัลยกย่องเชิดชูเกียรติ <br />
                <span className="text-xl sm:text-2xl font-black text-amber-700 underline decoration-amber-400">
                  "{certType}"
                </span>
                <br />
                <span className="text-sm text-slate-600 font-medium">
                  ด้วยคะแนนดาวสะสมความดี {selectedStudentForCert?.stars} ดาว มีความประพฤติดี มีวินัย และตั้งใจเรียนรู้
                </span>
              </p>

              {/* Seal and Signature */}
              <div className="mt-12 flex items-center justify-between px-8 sm:px-16 text-slate-700">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 bg-amber-100 flex items-center justify-center text-2xl mx-auto shadow-inner">
                    ⭐
                  </div>
                  <div className="text-[11px] font-black text-amber-800 mt-1 tracking-wider uppercase">
                    ตราเด็กดีเด่น
                  </div>
                </div>

                <div className="text-center">
                  <div className="border-b border-slate-400 w-44 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-slate-800">({teacherName})</div>
                  <div className="text-[11px] text-slate-500">ครูประจำชั้น</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">ให้ไว้ ณ {certDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB: PRINTABLE STUDENT STAR CARDS */}
      {/* ========================================================= */}
      {activeTab === 'cards' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div>
              <h3 className="font-black text-base text-slate-800 flex items-center space-x-2">
                <Printer className="w-5 h-5 text-purple-600" />
                <span>บัตรประจำตัวสะสมดาวนักเรียน (Star Pass Cards)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                พิมพ์บัตรขนาดพกพา (4 บัตรต่อหน้า) มีช่องปั๊มดาวจริงในห้องเรียน 20 ช่อง
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์บัตรทั้งหมด ({filteredStudents.length} คน)</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((std) => (
              <div
                key={std.id}
                className="bg-white rounded-3xl p-5 border-2 border-dashed border-purple-300 shadow-xs flex flex-col justify-between break-inside-avoid"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="text-3xl">{std.avatar}</div>
                    <div>
                      <div className="font-black text-sm text-slate-800 truncate">{std.name}</div>
                      <div className="text-xs text-purple-600 font-bold">ห้อง {std.classroom}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                      {std.stars} ⭐
                    </span>
                  </div>
                </div>

                {/* 20 Stamp Slots */}
                <div className="my-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    ช่องสแตมป์ดาวความดี (20 ช่อง)
                  </div>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold ${
                          i < Math.floor(std.stars)
                            ? 'bg-amber-100 border-amber-400 text-amber-600'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                      >
                        {i < Math.floor(std.stars) ? '⭐' : i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Classroom Star Pass</span>
                  <span>ตราประทับครูผู้สอน: _________________</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
