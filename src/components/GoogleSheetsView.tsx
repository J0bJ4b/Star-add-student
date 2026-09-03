import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  PlusCircle, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FolderSync, 
  FileText, 
  Database, 
  Sparkles,
  Search,
  Link2,
  Trash2,
  Lock,
  Check,
  HelpCircle
} from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import { listUserSpreadsheets, DriveSpreadsheetFile, extractSpreadsheetId, getSpreadsheetDetails } from '../lib/googleSheets';
import { sounds } from '../lib/audio';

export const GoogleSheetsView: React.FC = () => {
  const { 
    students, 
    classrooms, 
    rewards, 
    categories, 
    attendance, 
    getAllStarLogs,
    user,
    googleAccessToken,
    linkedSpreadsheet,
    setLinkedSpreadsheet,
    connectGoogleSheets,
    disconnectGoogleSheets,
    exportToGoogleSheets,
    syncToLinkedGoogleSheet,
    importStudentsFromGoogleSheet,
  } = useStudents();

  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Export Form State
  const [exportTitle, setExportTitle] = useState(`ดาวเด็กดี - บันทึกคะแนน (${new Date().toLocaleDateString('th-TH')})`);
  
  // Import Form State
  const [importSheetInput, setImportSheetInput] = useState('');
  const [importTargetClassroom, setImportTargetClassroom] = useState<string>('all');
  const [selectedDriveFileId, setSelectedDriveFileId] = useState<string>('');

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'ยืนยัน',
    onConfirm: () => {},
  });

  const totalLogs = getAllStarLogs().length;

  // Load user spreadsheets if token is available
  const loadDriveFiles = async () => {
    if (!googleAccessToken) return;
    try {
      setIsLoadingDriveFiles(true);
      const files = await listUserSpreadsheets(googleAccessToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Could not list drive spreadsheets:', err);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) {
      loadDriveFiles();
    }
  }, [googleAccessToken]);

  const handleConnect = async () => {
    try {
      setStatusMessage(null);
      await connectGoogleSheets();
      sounds.playClick();
      setStatusMessage({ type: 'success', text: 'เชื่อมต่อกับ Google Workspace สำเร็จแล้ว!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `การเชื่อมต่อไม่สำเร็จ: ${err.message || 'โปรดลองใหม่อีกครั้ง'}` });
    }
  };

  const handleDisconnect = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'ยกเลิกการเชื่อมต่อ Google',
      description: 'คุณต้องการออกจากระบบและตัดการเชื่อมต่อกับ Google Workspace หรือไม่?',
      actionLabel: 'ออกจากระบบ',
      isDanger: true,
      onConfirm: async () => {
        await disconnectGoogleSheets();
        setDriveFiles([]);
        setStatusMessage({ type: 'success', text: 'ยกเลิกการเชื่อมต่อ Google เรียบร้อยแล้ว' });
      },
    });
  };

  // 1. Create & Export to New Google Sheet with Confirmation
  const promptCreateNewSheet = () => {
    setConfirmModal({
      isOpen: true,
      title: 'สร้าง Google Spreadsheet ใหม่',
      description: `ระบบจะสร้างไฟล์ Google Sheet ชื่อ "${exportTitle}" ใน Google Drive ของคุณ โดยมี 4 แท็บข้อมูล (นักเรียน ${students.length} คน, บันทึกดาว ${totalLogs} รายการ, การเช็คชื่อ ${attendance.length} รายการ, ของรางวัล ${rewards.length} รายการ)`,
      actionLabel: 'ยืนยันสร้างและส่งออกข้อมูล',
      onConfirm: async () => {
        try {
          setIsExporting(true);
          setStatusMessage(null);
          const result = await exportToGoogleSheets(exportTitle);
          setStatusMessage({
            type: 'success',
            text: `สร้าง Google Sheet สำเร็จ! บันทึกข้อมูลเรียบร้อยแล้ว`,
          });
          loadDriveFiles();
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${err.message}` });
        } finally {
          setIsExporting(false);
        }
      },
    });
  };

  // 2. Sync to Currently Linked Sheet with Confirmation
  const promptSyncToLinked = () => {
    if (!linkedSpreadsheet) return;
    setConfirmModal({
      isOpen: true,
      title: 'ซิงค์ข้อมูลไปยัง Google Sheet ที่เชื่อมต่อ',
      description: `คุณต้องการอัปเดตข้อมูลล่าสุดทั้งหมด (นักเรียน ${students.length} คน, บันทึกดาว ${totalLogs} รายการ) ไปยังไฟล์ "${linkedSpreadsheet.name}" ใช่หรือไม่? (ข้อมูลในชีตเดิมจะถูกเขียนทับด้วยข้อมูลล่าสุด)`,
      actionLabel: 'ยืนยันซิงค์ข้อมูล',
      onConfirm: async () => {
        try {
          setIsSyncing(true);
          setStatusMessage(null);
          const res = await syncToLinkedGoogleSheet();
          if (res.success) {
            setStatusMessage({ type: 'success', text: res.message });
          } else {
            setStatusMessage({ type: 'error', text: res.message });
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${err.message}` });
        } finally {
          setIsSyncing(false);
        }
      },
    });
  };

  // 3. Link an existing file
  const handleLinkExistingFile = (file: DriveSpreadsheetFile) => {
    const linked = {
      id: file.id,
      name: file.name,
      url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      lastSyncedAt: Date.now(),
    };
    setLinkedSpreadsheet(linked);
    sounds.playStarChime(true);
    setStatusMessage({ type: 'success', text: `เชื่อมโยงกับไฟล์ "${file.name}" เรียบร้อยแล้ว` });
  };

  // 4. Import from Sheet with Confirmation
  const promptImportFromSheet = () => {
    const targetId = selectedDriveFileId || importSheetInput;
    if (!targetId) {
      setStatusMessage({ type: 'error', text: 'กรุณาเลือกไฟล์ Google Sheet จาก Drive หรือระบุ URL / ID ของชีต' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'นำเข้านักเรียนจาก Google Sheet',
      description: `ระบบจะอ่านรายชื่อนักเรียนและคะแนนดาวจาก Google Sheet และเพิ่มเข้าสู่ระบบ (หากมีชื่อนักเรียนในห้องเดียวกันอยู่แล้ว จะทำการอัปเดตคะแนน)`,
      actionLabel: 'ยืนยันนำเข้าข้อมูล',
      onConfirm: async () => {
        try {
          setIsImporting(true);
          setStatusMessage(null);
          const res = await importStudentsFromGoogleSheet(
            targetId,
            'รายชื่อและคะแนนดาว',
            importTargetClassroom === 'all' ? undefined : importTargetClassroom
          );

          if (res.success) {
            setStatusMessage({ type: 'success', text: res.message });
            setImportSheetInput('');
            setSelectedDriveFileId('');
          } else {
            setStatusMessage({ type: 'error', text: res.message });
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: `เกิดข้อผิดพลาดในการนำเข้า: ${err.message}` });
        } finally {
          setIsImporting(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide">
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Google Workspace & Sheets Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              เชื่อมต่อ Google Sheets 📊
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              ส่งออกและซิงค์ข้อมูลนักเรียน คะแนนสะสมดาว ประวัติความดี และบันทึกการเช็คชื่อเข้าสู่ Google Spreadsheets บน Google Drive ของคุณได้อัตโนมัติ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {googleAccessToken || user ? (
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border border-white/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                      {user?.displayName ? user.displayName.slice(0, 1) : 'G'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[140px]">{user?.displayName || 'Google Account'}</div>
                    <div className="text-[10px] text-emerald-200 truncate max-w-[140px]">{user?.email || 'เชื่อมต่อแล้ว'}</div>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-1.5 hover:bg-white/20 rounded-xl text-xs font-semibold text-emerald-100 hover:text-white transition-colors cursor-pointer"
                  title="ตัดการเชื่อมต่อ"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-sm font-black shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all cursor-pointer active:scale-98"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                <span>เชื่อมต่อ Google Sheets</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-semibold">{statusMessage.text}</div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Currently Linked Google Sheet */}
      {linkedSpreadsheet && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ชีตที่เชื่อมต่ออยู่ปัจจุบัน
                  </span>
                  {linkedSpreadsheet.lastSyncedAt && (
                    <span className="text-[11px] text-slate-400">
                      ซิงค์ล่าสุด: {new Date(linkedSpreadsheet.lastSyncedAt).toLocaleTimeString('th-TH')}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-800 mt-1 font-heading">
                  {linkedSpreadsheet.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{linkedSpreadsheet.id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={linkedSpreadsheet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <span>เปิดใน Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={promptSyncToLinked}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลไปยังชีตนี้ (Sync)'}</span>
              </button>

              <button
                onClick={() => setLinkedSpreadsheet(null)}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="ยกเลิกการเชื่อมโยงกับชีตนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Export to New Google Sheet */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 font-heading">1. สร้าง Google Spreadsheet ใหม่</h2>
                <p className="text-xs text-slate-500">ส่งออกข้อมูลทั้งหมดเป็น Google Sheet ไฟล์ใหม่ใน Google Drive</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อเอกสาร Google Spreadsheet</label>
                <input
                  type="text"
                  value={exportTitle}
                  onChange={(e) => setExportTitle(e.target.value)}
                  placeholder="ดาวเด็กดี - บันทึกคะแนนสะสม"
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">📋 แท็บที่จะถูกสร้างอัตโนมัติ:</div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span><b>รายชื่อและคะแนนดาว</b> ({students.length} คน)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span><b>ประวัติการให้ดาว</b> ({totalLogs} รายการ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span><b>บันทึกการเช็คชื่อ</b> ({attendance.length} รายการ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span><b>รายการของรางวัล</b> ({rewards.length} รายการ)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={promptCreateNewSheet}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'กำลังสร้างและส่งออกข้อมูล...' : 'สร้างและส่งออกข้อมูลไปยัง Google Sheets'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Import Students from Google Sheet */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 font-heading">2. นำเข้านักเรียนจาก Google Sheet</h2>
                <p className="text-xs text-slate-500">ดึงรายชื่อนักเรียนและดาวสะสมจาก Spreadsheet ที่มีอยู่</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option A: Select from Drive */}
              {googleAccessToken && driveFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600">เลือกไฟล์จาก Google Drive ของคุณ</label>
                    <button
                      onClick={loadDriveFiles}
                      className="text-[10px] text-teal-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                      รีเฟรชไฟล์
                    </button>
                  </div>
                  <select
                    value={selectedDriveFileId}
                    onChange={(e) => {
                      setSelectedDriveFileId(e.target.value);
                      if (e.target.value) setImportSheetInput('');
                    }}
                    className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="">-- เลือก Google Spreadsheet ใน Drive --</option>
                    {driveFiles.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Option B: Input Spreadsheet URL/ID */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">หรือระบุ Google Sheets URL / Spreadsheet ID</label>
                <input
                  type="text"
                  value={importSheetInput}
                  onChange={(e) => {
                    setImportSheetInput(e.target.value);
                    if (e.target.value) setSelectedDriveFileId('');
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {/* Target Classroom */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">นำเข้าสู่ห้องเรียน</label>
                <select
                  value={importTargetClassroom}
                  onChange={(e) => setImportTargetClassroom(e.target.value)}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="all">ใช้ห้องเรียนตามที่ระบุในคอลัมน์ของ Google Sheet</option>
                  {classrooms.map((c) => (
                    <option key={c} value={c}>กำหนดเป็นห้อง {c} ทั้งหมด</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={promptImportFromSheet}
              disabled={isImporting || (!selectedDriveFileId && !importSheetInput)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-600/20 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
              <span>{isImporting ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้านักเรียนจาก Google Sheet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheets from User's Drive */}
      {googleAccessToken && driveFiles.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FolderSync className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 font-heading">ไฟล์ Google Sheets ใน Drive ของคุณ</h3>
                <p className="text-xs text-slate-500">คลิกเพื่อเชื่อมโยงไฟล์สำหรับซิงค์ข้อมูล 1-คลิก</p>
              </div>
            </div>

            <button
              onClick={loadDriveFiles}
              disabled={isLoadingDriveFiles}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {driveFiles.map((file) => {
              const isLinked = linkedSpreadsheet?.id === file.id;
              return (
                <div
                  key={file.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLinked 
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20' 
                      : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-slate-800 line-clamp-1" title={file.name}>
                        {file.name}
                      </div>
                      {isLinked && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-black shrink-0">
                          เชื่อมต่ออยู่
                        </span>
                      )}
                    </div>
                    {file.modifiedTime && (
                      <p className="text-[11px] text-slate-400">
                        แก้ไขเมื่อ: {new Date(file.modifiedTime).toLocaleDateString('th-TH')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-200/50">
                    <a
                      href={file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>เปิดดู</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {!isLinked ? (
                      <button
                        onClick={() => handleLinkExistingFile(file)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        เชื่อมโยงชีตนี้
                      </button>
                    ) : (
                      <button
                        onClick={promptSyncToLinked}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        ซิงค์ทันที
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions & Template Format */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>คำแนะนำรูปแบบตารางสำหรับนำเข้าจาก Google Sheets</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          หากคุณต้องการเตรียมไฟล์ Google Sheet เองเพื่อนำเข้า หัวตาราง (แถวที่ 1) สามารถตั้งชื่อได้ดังนี้:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 font-bold">
              <tr>
                <th className="p-2.5 border-b">คอลัมน์ A (ชื่อ - นามสกุล)</th>
                <th className="p-2.5 border-b">คอลัมน์ B (ห้องเรียน)</th>
                <th className="p-2.5 border-b">คอลัมน์ C (รูปประจำตัว)</th>
                <th className="p-2.5 border-b">คอลัมน์ D (ดาวสะสม)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2.5">เด็กชายกิตติศักดิ์ ใจดี (ก้อง)</td>
                <td className="p-2.5">ป.3/1</td>
                <td className="p-2.5">🦁</td>
                <td className="p-2.5">18.5</td>
              </tr>
              <tr>
                <td className="p-2.5">เด็กหญิงกานดา สดใส (แก้ม)</td>
                <td className="p-2.5">ป.3/1</td>
                <td className="p-2.5">🐰</td>
                <td className="p-2.5">16</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmModal.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {confirmModal.isDanger ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 font-heading">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  await confirmModal.onConfirm();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                  confirmModal.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
