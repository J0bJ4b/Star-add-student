import React, { useState, useRef } from 'react';
import { useStudents } from '../context/StudentContext';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCcw, 
  X, 
  Check, 
  AlertTriangle, 
  FileJson, 
  Cloud,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    students,
    classrooms,
    rewards,
    user,
    lastSavedTime,
    exportBackupJSON,
    importBackupJSON,
    resetToSampleData,
  } = useStudents();

  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupJSON(content);
        if (result.success) {
          setImportStatus({ type: 'success', text: result.message });
        } else {
          setImportStatus({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-purple-50 text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                สำรองและกู้คืนข้อมูล (Backup & Restore)
              </h3>
              <p className="text-xs text-slate-400">
                จัดการข้อมูลนักเรียน รางวัล และประวัติดาว
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span>สถานะการบันทึกข้อมูล (Data Storage):</span>
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกอัตโนมัติ
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            ข้อมูลนักเรียน ({students.length} คน) และของรางวัล ({rewards.length} ชิ้น) ถูกบันทึกไว้ในเบราว์เซอร์อัตโนมัติ (LocalStorage)
            {user ? ' และซิงค์ขึ้น Firestore Cloud เรียบร้อยแล้ว' : ''}
          </p>

          <div className="text-[10px] text-slate-400">
            บันทึกล่าสุด: {lastSavedTime ? lastSavedTime.toLocaleTimeString('th-TH') : 'เมื่อสักครู่'}
          </div>
        </div>

        {/* Alert Status */}
        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importStatus.text}
          </div>
        )}

        {/* Export & Import Action Buttons */}
        <div className="space-y-3">
          
          {/* Export Button */}
          <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-purple-950 font-heading">
                ส่งออกไฟล์สำรองข้อมูล (JSON Backup)
              </h4>
              <p className="text-[11px] text-purple-700 mt-0.5">
                ดาวน์โหลดไฟล์ .json เพื่อเก็บไว้สำรอง หรือนำไปเปิดในเครื่องอื่น
              </p>
            </div>
            <button
              onClick={exportBackupJSON}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-heading">
                นำเข้าไฟล์สำรองข้อมูล (Restore Data)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                เลือกไฟล์ .json ที่เคยสำรองไว้เพื่อนำข้อมูลกลับมาใช้
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกไฟล์</span>
              </button>
            </div>
          </div>

        </div>

        {/* Reset Sample Data */}
        <div className="pt-3 border-t border-slate-100">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตกลับเป็นข้อมูลตัวอย่างเริ่มต้น</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 text-center">
              <p className="text-xs font-bold text-rose-800">
                คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น?
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 bg-white text-slate-700 text-xs rounded-lg border border-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    resetToSampleData();
                    setShowResetConfirm(false);
                    setImportStatus({ type: 'success', text: 'รีเซ็ตข้อมูลตัวอย่างเริ่มต้นเรียบร้อยแล้ว' });
                  }}
                  className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  ยืนยันรีเซ็ต
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-right pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
