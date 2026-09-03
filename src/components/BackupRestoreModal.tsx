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
  HardDrive,
  Code2,
  Copy,
  Sparkles,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw
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
    isSyncing,
    syncNow,
    exportBackupJSON,
    importBackupJSON,
    exportBackupCode,
    importBackupCode,
    resetToSampleData,
    googleAccessToken,
    linkedSpreadsheet,
    connectGoogleSheets,
    exportToGoogleSheets,
    syncToLinkedGoogleSheet,
  } = useStudents();

  const [activeTab, setActiveTab] = useState<'code' | 'file' | 'sheets'>('code');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [manualSyncing, setManualSyncing] = useState(false);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleManualSyncModal = async () => {
    try {
      setManualSyncing(true);
      await syncNow();
      setImportStatus({ type: 'success', text: 'ซิงค์ข้อมูลกับคลาวด์ล่าสุดเรียบร้อยแล้ว!' });
    } catch (err: any) {
      setImportStatus({ type: 'error', text: 'การซิงค์ข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setManualSyncing(false);
    }
  };

  const handleGenerateCode = () => {
    const code = exportBackupCode();
    setGeneratedCode(code);
    setIsCopied(false);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleImportByCode = () => {
    if (!codeInputValue.trim()) {
      setImportStatus({ type: 'error', text: 'กรุณาวางหรือพิมพ์รหัสโค้ดก่อนกดยืนยัน' });
      return;
    }
    const res = importBackupCode(codeInputValue);
    if (res.success) {
      setImportStatus({ type: 'success', text: res.message });
      setCodeInputValue('');
    } else {
      setImportStatus({ type: 'error', text: res.message });
    }
  };

  const handleSheetsSync = async () => {
    try {
      setSheetsSyncing(true);
      setImportStatus(null);
      if (linkedSpreadsheet) {
        const res = await syncToLinkedGoogleSheet();
        if (res.success) {
          setImportStatus({ type: 'success', text: res.message });
        } else {
          setImportStatus({ type: 'error', text: res.message });
        }
      } else {
        const res = await exportToGoogleSheets();
        setImportStatus({ type: 'success', text: `ส่งออกและสร้าง Google Sheet ใหม่เรียบร้อยแล้ว: ${res.spreadsheetId}` });
      }
    } catch (err: any) {
      setImportStatus({ type: 'error', text: `เกิดข้อผิดพลาดในการซิงค์ Google Sheets: ${err.message || 'โปรดลองอีกครั้ง'}` });
    } finally {
      setSheetsSyncing(false);
    }
  };

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
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        
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
                โหลดข้อมูลด้วยรหัสโค้ด (Backup Code) หรือไฟล์ JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => { setActiveTab('code'); setImportStatus(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>ใช้รหัสโค้ด</span>
          </button>
          <button
            onClick={() => { setActiveTab('file'); setImportStatus(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'file'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>ไฟล์ .JSON</span>
          </button>
          <button
            onClick={() => { setActiveTab('sheets'); setImportStatus(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets 📊</span>
          </button>
        </div>

        {/* Sync Status Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-slate-50 border border-purple-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-purple-600" />
              <span>สถานะเชื่อมต่อคลาวด์ (Cloud Sync ทุกเครื่อง):</span>
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ออนไลน์ทุกอุปกรณ์</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            นักเรียน <span className="font-bold text-purple-700">{students.length} คน</span>, 
            ห้องเรียน <span className="font-bold text-purple-700">{classrooms.length} ห้อง</span>, 
            ของรางวัล <span className="font-bold text-purple-700">{rewards.length} ชิ้น</span>
            <span className="text-slate-500 block mt-0.5">
              ✨ ข้อมูลจะซิงค์ตรงกับเซิร์ฟเวอร์แบบเรียลไทม์ เปิดเครื่องไหน/มือถือเครื่องใดก็เป็นข้อมูลชุดเดียวกัน
            </span>
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-purple-100/60">
            <div className="text-[10px] text-slate-400">
              บันทึกล่าสุด: {lastSavedTime ? lastSavedTime.toLocaleTimeString('th-TH') : 'เมื่อสักครู่'}
            </div>
            <button
              onClick={handleManualSyncModal}
              disabled={manualSyncing || isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw className={`w-3 h-3 ${manualSyncing || isSyncing ? 'animate-spin' : ''}`} />
              <span>{manualSyncing || isSyncing ? 'กำลังดึงข้อมูล...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
            </button>
          </div>
        </div>

        {/* Alert Status */}
        {importStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold animate-fade-in ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importStatus.text}
          </div>
        )}

        {/* TAB 1: Code Mode (รหัสโค้ด) */}
        {activeTab === 'code' && (
          <div className="space-y-4 animate-fade-in">
            {/* Section 1: ใส่ Code เพื่อโหลดข้อมูล */}
            <div className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>1. วางรหัสโค้ดเพื่อโหลดข้อมูล (Import by Code):</span>
                </label>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                  วิธีที่ง่ายที่สุด
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                นำรหัสโค้ดที่เคยคัดลอกไว้ (ขึ้นต้นด้วย <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-mono text-[10px]">STAR-...</code>) มาวางในช่องด้านล่าง แล้วกดยืนยัน
              </p>
              <textarea
                value={codeInputValue}
                onChange={(e) => setCodeInputValue(e.target.value)}
                placeholder="วางรหัสโค้ดข้อมูลที่นี่ เช่น STAR-eyJ2ZXJzaW9u..."
                rows={3}
                className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-slate-400"
              />
              <button
                onClick={handleImportByCode}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>ยืนยันโหลดข้อมูลจากรหัสโค้ดนี้</span>
              </button>
            </div>

            {/* Section 2: สร้าง Code เพื่อส่งต่อหรือสำรอง */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-slate-600" />
                  <span>2. สร้างรหัสโค้ดจากข้อมูลปัจจุบัน (Export Code):</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                กดสร้างโค้ด เพื่อคัดลอกส่งไปเปิดบนมือถือ แท็บเล็ต หรือเครื่องอื่นได้ทันที
              </p>

              {!generatedCode ? (
                <button
                  onClick={handleGenerateCode}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Code2 className="w-4 h-4 text-purple-600" />
                  <span>กดเพื่อสร้างรหัสโค้ด (Generate Code)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      readOnly
                      value={generatedCode}
                      rows={3}
                      className="w-full p-2.5 pr-20 bg-white border border-purple-300 rounded-xl text-[11px] font-mono text-slate-700 select-all"
                    />
                    <button
                      onClick={handleCopyCode}
                      className={`absolute top-2 right-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-xs ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกโค้ด</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-semibold text-center">
                    ✓ สร้างรหัสโค้ดเรียบร้อย! คัดลอกแล้วส่งทาง Line หรือบันทึกเก็บไว้ได้เลย
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: File Mode (ไฟล์ JSON) */}
        {activeTab === 'file' && (
          <div className="space-y-3 animate-fade-in">
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
        )}

        {/* TAB 3: Google Sheets Mode */}
        {activeTab === 'sheets' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 font-heading">
                      ซิงค์ข้อมูลลง Google Sheets 📊
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      บันทึกรายชื่อนักเรียน คะแนนดาว ประวัติความดี และการเช็คชื่อลง Google Spreadsheet
                    </p>
                  </div>
                </div>
              </div>

              {linkedSpreadsheet ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="truncate max-w-[220px]">📄 {linkedSpreadsheet.name}</span>
                    <a
                      href={linkedSpreadsheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <span>เปิดชีต</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {linkedSpreadsheet.lastSyncedAt && (
                    <div className="text-[10px] text-slate-400">
                      ซิงค์ล่าสุด: {new Date(linkedSpreadsheet.lastSyncedAt).toLocaleString('th-TH')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 bg-white/80 p-3 rounded-xl border border-emerald-100">
                  ยังไม่ได้เชื่อมต่อกับ Google Sheet เฉพาะกิจ กดปุ่มด้านล่างเพื่อสร้าง Google Spreadsheet ใหม่ใน Google Drive ของคุณทันที
                </div>
              )}

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={handleSheetsSync}
                  disabled={sheetsSyncing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {sheetsSyncing
                      ? 'กำลังบันทึกข้อมูลลง Google Sheets...'
                      : linkedSpreadsheet
                      ? 'ซิงค์ข้อมูลทั้งหมดลง Google Sheet ที่เชื่อมต่อ (Manual Sync)'
                      : 'สร้าง Google Sheet ใหม่และส่งออกข้อมูลทั้งหมดทันที'}
                  </span>
                </button>

                {!googleAccessToken && (
                  <button
                    onClick={connectGoogleSheets}
                    className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
                    <span>เชื่อมต่อบัญชี Google Workspace</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reset Sample Data */}
        <div className="pt-3 border-t border-slate-100">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
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
                  className="px-3 py-1 bg-white text-slate-700 text-xs rounded-lg border border-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    resetToSampleData();
                    setShowResetConfirm(false);
                    setImportStatus({ type: 'success', text: 'รีเซ็ตข้อมูลตัวอย่างเริ่มต้นเรียบร้อยแล้ว' });
                  }}
                  className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
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
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
