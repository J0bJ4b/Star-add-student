import React from 'react';
import { 
  History, 
  X, 
  Sparkles, 
  FileSpreadsheet, 
  CheckCircle2, 
  Award, 
  Gift, 
  Users, 
  Database, 
  Cloud,
  Layers,
  Clock
} from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangelogItem {
  version: string;
  date: string;
  isLatest?: boolean;
  title: string;
  badgeColor: string;
  changes: {
    category: string;
    description: string;
  }[];
}

const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: 'v2.5.0',
    date: '3 กันยายน 2026',
    isLatest: true,
    title: 'Google Sheets & Google Workspace Integration 📊',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    changes: [
      {
        category: 'Google Sheets Integration',
        description: 'เชื่อมต่อบัญชี Google เพื่อสร้างและส่งออก Google Spreadsheet ใน Google Drive โดยอัตโนมัติ (4 แท็บ: รายชื่อนักเรียน, ประวัติการให้ดาว, บันทึกเช็คชื่อ, รายการของรางวัล)',
      },
      {
        category: 'Google Sheets Manual Sync',
        description: 'เพิ่มปุ่มซิงค์ข้อมูลลง Google Sheets ด้วยตนเอง (1-Click Sync) ทั้งในหน้า Google Sheets และในหน้าต่าง Backup & Restore Modal',
      },
      {
        category: 'Import Students from Sheets',
        description: 'สามารถนำเข้ารายชื่อนักเรียนและคะแนนดาวเดิมจาก Google Spreadsheets เข้าสู่ระบบได้ทันที',
      },
    ],
  },
  {
    version: 'v2.4.0',
    date: '25 สิงหาคม 2026',
    title: 'ระบบเช็คชื่อ & กิจกรรมสุ่มสุ่มผู้โชคดี 🎯',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    changes: [
      {
        category: 'Attendance Tracking',
        description: 'ระบบบันทึกการมาเรียนรายวัน (มาปกติ, มาสาย, ลา, ขาด) พร้อมสรุปสถิติและอัตราการมาเรียนประจำห้อง',
      },
      {
        category: 'Interactive Activities & Wheel',
        description: 'วงล้อสุ่มจับคู่ผู้โชคดีสำหรับตอบคำถามในห้องเรียน และเครื่องมือแบ่งกลุ่มนักเรียนอัตโนมัติ',
      },
    ],
  },
  {
    version: 'v2.3.0',
    date: '10 สิงหาคม 2026',
    title: 'โหมดโพรเจกเตอร์ & ใบประกาศเกียรติคุณ 📜',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    changes: [
      {
        category: 'Projector Mode',
        description: 'โหมดพรีเซนต์บนหน้าจอใหญ่/ทีวีประจำห้องเรียน แสดงดาวลอยและอนิเมชันพลุฉลองใหญ่แบบเต็มจอ',
      },
      {
        category: 'Certificates & Reports',
        description: 'พิมพ์ใบประกาศเกียรติคุณเด็กดีประจำเดือน และส่งออกรายงานสรุปคะแนนดาวรูปแบบ PDF / พิมพ์',
      },
    ],
  },
  {
    version: 'v2.2.0',
    date: '28 กรกฎาคม 2026',
    title: 'ร้านค้าของรางวัล & ตราเกียรติยศ 🎁',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    changes: [
      {
        category: 'Rewards Store',
        description: 'ระบบคลังของขวัญ ตัดดาวสะสมอัตโนมัติเมื่อนักเรียนนำดาวมาแลกของรางวัล พร้อมประวัติการแลก',
      },
      {
        category: 'Badges & Criteria',
        description: 'กำหนดหมวดหมู่ความดีเฉพาะครูประจำชั้น และมอบตราสัญลักษณ์ความดีตามระดับคะแนนสะสม',
      },
    ],
  },
  {
    version: 'v2.1.0',
    date: '15 กรกฎาคม 2026',
    title: 'Cloud Auto Sync & Sound Effects 🔊',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    changes: [
      {
        category: 'Firestore Realtime Cloud',
        description: 'ซิงค์ข้อมูลระหว่างคุณครูผู้ช่วยและอุปกรณ์ต่างๆ แบบเรียลไทม์ผ่าน Firebase Firestore',
      },
      {
        category: 'Audio FX & Particle Graphics',
        description: 'เอฟเฟกต์เสียงเอฟเฟกต์ดาวตก ดาวกระจาย และเสียงดนตรีประกอบเมื่อได้รับรางวัล',
      },
    ],
  },
  {
    version: 'v2.0.0',
    date: '1 กรกฎาคม 2026',
    title: 'ระบบแยกห้องเรียน & สรุปอันดับ Top Star ⭐',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    changes: [
      {
        category: 'Classroom Management',
        description: 'จัดหมวดหมู่ห้องเรียน (ป.1 - ป.6) เพิ่ม/แก้ไข/ลบ รายชื่อนักเรียนแบบรายบุคคลหรือกลุ่ม',
      },
      {
        category: 'Leaderboards',
        description: 'ตารางสรุปอันดับความดี Top 3 ประจำสัปดาห์ และอันดับดาวสะสมประจำห้อง',
      },
    ],
  },
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                ประวัติการอัปเดตระบบ (Changelog)
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {CHANGELOG_DATA[0].version}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                รายการฟีเจอร์และการปรับปรุงระบบดาวเด็กดี (Star Good Deeds)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {CHANGELOG_DATA.map((item, index) => (
            <div key={item.version} className="relative pl-6 sm:pl-8 border-l-2 border-slate-200/80 last:border-l-0">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  item.isLatest ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                }`}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.version}
                    </span>
                    <h4 className="text-sm font-black text-slate-800 font-heading">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center text-[11px] text-slate-400 font-medium gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                  {item.changes.map((change, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">{change.category}: </span>
                        <span>{change.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-purple-700">
            <Sparkles className="w-4 h-4" />
            <span>ดาวเด็กดี (Star Good Deeds) - ระบบบันทึกดาวและเช็คชื่อห้องเรียน</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
