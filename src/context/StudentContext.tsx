import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Student, Reward, StarLog, StarCategory, AttendanceRecord, AttendanceStatus, StudentTeam, LinkedGoogleSheet } from '../types';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_REWARDS, 
  DEFAULT_CLASSROOMS, 
  DEFAULT_CATEGORIES, 
  AVATAR_OPTIONS 
} from '../lib/constants';
import { sounds } from '../lib/audio';
import { fireStarBurst, fireStarShower, fireBigCelebration } from '../lib/confetti';
import { emitFloatingParticle } from '../components/FloatingParticles';
import { auth, db, loginWithGoogle, loginWithGithub, loginAsGuest, logoutUser, getAccessToken, setAccessToken } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  createAndPopulateSpreadsheet, 
  updateAllTabsInSpreadsheet, 
  readSpreadsheetRange, 
  getSpreadsheetDetails, 
  listUserSpreadsheets, 
  extractSpreadsheetId 
} from '../lib/googleSheets';

interface StudentContextType {
  students: Student[];
  classrooms: string[];
  rewards: Reward[];
  categories: StarCategory[];
  activeClassroom: string; // 'all' or specific e.g. 'ป.3/1'
  selectedCategory: string;
  soundEnabled: boolean;
  user: User | null;
  authLoading: boolean;
  isSyncing: boolean;
  lastSavedTime: Date | null;
  syncNow: () => Promise<void>;

  // Google Sheets Integration
  googleAccessToken: string | null;
  linkedSpreadsheet: LinkedGoogleSheet | null;
  setLinkedSpreadsheet: (sheet: LinkedGoogleSheet | null) => void;
  connectGoogleSheets: () => Promise<string | null>;
  disconnectGoogleSheets: () => Promise<void>;
  exportToGoogleSheets: (customTitle?: string) => Promise<{ spreadsheetId: string; spreadsheetUrl: string }>;
  syncToLinkedGoogleSheet: () => Promise<{ success: boolean; message: string }>;
  importStudentsFromGoogleSheet: (
    spreadsheetId: string, 
    sheetTabName?: string, 
    targetClassroom?: string
  ) => Promise<{ success: boolean; count: number; message: string }>;
  
  // Actions
  setActiveClassroom: (classroom: string) => void;
  setSelectedCategory: (cat: string) => void;
  toggleSound: () => void;
  loginWithGoogle: () => Promise<any>;
  loginWithGithub: () => Promise<User | void>;
  loginAsGuest: () => Promise<User | void>;
  logout: () => Promise<void>;
  
  addStars: (studentId: string, amount: number, category?: string, note?: string, posX?: number, posY?: number) => void;
  deductStars: (studentId: string, amount: number, category?: string, note?: string) => void;
  batchAddStars: (studentIds: string[], amount: number, category?: string, note?: string) => void;
  
  addStudent: (name: string, classroom: string, avatar?: string, initialStars?: number) => void;
  batchAddStudents: (namesText: string, classroom: string) => number;
  editStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addClassroom: (name: string) => boolean;
  deleteClassroom: (name: string) => void;
  renameClassroom: (oldName: string, newName: string) => boolean;
  
  addReward: (reward: Omit<Reward, 'id'>) => void;
  editReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  claimReward: (studentId: string, rewardId: string) => { success: boolean; message: string };
  
  // Category management
  addCategory: (cat: Omit<StarCategory, 'id'>) => void;
  editCategory: (id: string, updates: Partial<StarCategory>) => void;
  deleteCategory: (id: string) => void;

  // Attendance management
  attendance: AttendanceRecord[];
  markAttendance: (studentId: string, date: string, status: AttendanceStatus, note?: string) => void;
  batchMarkAttendance: (records: { studentId: string; status: AttendanceStatus }[], date: string) => void;
  rewardPresentStudents: (date: string, amount: number, note: string) => number;

  // Teams management
  teams: StudentTeam[];
  createTeam: (name: string, color: string, bgLight: string, studentIds?: string[]) => void;
  deleteTeam: (teamId: string) => void;
  autoSplitTeams: (numTeams: number, classroom: string) => void;
  addStarsToTeam: (teamId: string, amount: number, note: string) => void;

  // Projector / Big Screen Mode
  isProjectorOpen: boolean;
  setIsProjectorOpen: (val: boolean) => void;
  
  undoStarLog: (logId: string) => void;
  resetToSampleData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => { success: boolean; message: string };
  exportBackupCode: () => string;
  importBackupCode: (codeString: string) => { success: boolean; message: string };
  
  getAllStarLogs: () => StarLog[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'stargooddeeds_students_v2',
  CLASSROOMS: 'stargooddeeds_classrooms_v2',
  REWARDS: 'stargooddeeds_rewards_v2',
  CATEGORIES: 'stargooddeeds_categories_v2',
  SOUND: 'stargooddeeds_sound_v2',
  ATTENDANCE: 'stargooddeeds_attendance_v2',
  TEAMS: 'stargooddeeds_teams_v2',
  LAST_SYNC: 'stargooddeeds_last_sync_v2',
  LINKED_SHEET: 'stargooddeeds_linked_sheet_v2'
};

const DEFAULT_TEAMS_DATA: StudentTeam[] = [
  { id: 'team-red', name: 'ทีมมังกรแดง 🐲', color: 'text-rose-600 border-rose-200 bg-rose-50', bgLight: 'bg-rose-500', studentIds: [] },
  { id: 'team-blue', name: 'ทีมนกอินทรีฟ้า 🦅', color: 'text-blue-600 border-blue-200 bg-blue-50', bgLight: 'bg-blue-500', studentIds: [] },
  { id: 'team-green', name: 'ทีมเสือเขียว 🐯', color: 'text-emerald-600 border-emerald-200 bg-emerald-50', bgLight: 'bg-emerald-500', studentIds: [] },
  { id: 'team-yellow', name: 'ทีมสิงโตทอง 🦁', color: 'text-amber-600 border-amber-200 bg-amber-50', bgLight: 'bg-amber-500', studentIds: [] },
];

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state with LocalStorage initializers
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  const [classrooms, setClassrooms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      return saved ? JSON.parse(saved) : DEFAULT_CLASSROOMS;
    } catch {
      return DEFAULT_CLASSROOMS;
    }
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REWARDS);
      return saved ? JSON.parse(saved) : DEFAULT_REWARDS;
    } catch {
      return DEFAULT_REWARDS;
    }
  });

  const [categories, setCategories] = useState<StarCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [teams, setTeams] = useState<StudentTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return saved ? JSON.parse(saved) : DEFAULT_TEAMS_DATA;
    } catch {
      return DEFAULT_TEAMS_DATA;
    }
  });

  const [activeClassroom, setActiveClassroom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ส่งงานครบ');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [googleAccessToken, setGoogleAccessTokenState] = useState<string | null>(null);
  const [linkedSpreadsheet, setLinkedSpreadsheetState] = useState<LinkedGoogleSheet | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LINKED_SHEET);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());
  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);

  // Sync refs to prevent race conditions and unintended overwrites
  const isInitialLoadedRef = useRef<boolean>(false);
  const lastServerTimestampRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      const token = await getAccessToken();
      setGoogleAccessTokenState(token);
    });
    return () => unsubscribe();
  }, []);

  const setLinkedSpreadsheet = (sheet: LinkedGoogleSheet | null) => {
    setLinkedSpreadsheetState(sheet);
    if (sheet) {
      localStorage.setItem(STORAGE_KEYS.LINKED_SHEET, JSON.stringify(sheet));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LINKED_SHEET);
    }
  };

  const connectGoogleSheets = async (): Promise<string | null> => {
    try {
      const result = await loginWithGoogle();
      if (result?.accessToken) {
        setGoogleAccessTokenState(result.accessToken);
        return result.accessToken;
      }
      const token = await getAccessToken();
      setGoogleAccessTokenState(token);
      return token;
    } catch (err: any) {
      console.error('Google Sheets connection error:', err);
      throw err;
    }
  };

  const disconnectGoogleSheets = async () => {
    await logoutUser();
    setUser(null);
    setGoogleAccessTokenState(null);
  };

  // Google Sheets Export
  const exportToGoogleSheets = async (customTitle?: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
    let token = googleAccessToken || (await getAccessToken());
    if (!token) {
      token = await connectGoogleSheets();
    }
    if (!token) {
      throw new Error('กรุณาเชื่อมต่อบัญชี Google ก่อนส่งออกข้อมูล');
    }

    const allLogs = getAllStarLogs();
    const result = await createAndPopulateSpreadsheet(
      token,
      customTitle || `ดาวเด็กดี - คะแนนและความดี (${new Date().toLocaleDateString('th-TH')})`,
      {
        students,
        classrooms,
        rewards,
        categories,
        attendance,
        allLogs,
      }
    );

    const newLinked: LinkedGoogleSheet = {
      id: result.spreadsheetId,
      name: customTitle || 'ดาวเด็กดี - ข้อมูลคะแนนและประวัติ',
      url: result.spreadsheetUrl,
      lastSyncedAt: Date.now(),
    };
    setLinkedSpreadsheet(newLinked);
    sounds.playRewardFanfare();
    fireBigCelebration();
    return result;
  };

  // Google Sheets Sync to Existing
  const syncToLinkedGoogleSheet = async (): Promise<{ success: boolean; message: string }> => {
    if (!linkedSpreadsheet?.id) {
      return { success: false, message: 'ยังไม่มี Google Sheet ที่เชื่อมต่อไว้ กรุณาสร้างหรือเลือกชีตก่อน' };
    }
    let token = googleAccessToken || (await getAccessToken());
    if (!token) {
      token = await connectGoogleSheets();
    }
    if (!token) {
      return { success: false, message: 'กรุณาเชื่อมต่อบัญชี Google ก่อนซิงค์ข้อมูล' };
    }

    const allLogs = getAllStarLogs();
    await updateAllTabsInSpreadsheet(token, linkedSpreadsheet.id, {
      students,
      classrooms,
      rewards,
      categories,
      attendance,
      allLogs,
    });

    const updated = {
      ...linkedSpreadsheet,
      lastSyncedAt: Date.now(),
    };
    setLinkedSpreadsheet(updated);
    sounds.playStarChime(true);
    return { success: true, message: 'อัปเดตข้อมูลไปยัง Google Sheets สำเร็จเรียบร้อยแล้ว!' };
  };

  // Google Sheets Import
  const importStudentsFromGoogleSheet = async (
    spreadsheetId: string,
    sheetTabName = 'รายชื่อและคะแนนดาว',
    targetClassroom?: string
  ): Promise<{ success: boolean; count: number; message: string }> => {
    let token = googleAccessToken || (await getAccessToken());
    if (!token) {
      token = await connectGoogleSheets();
    }
    if (!token) {
      return { success: false, count: 0, message: 'กรุณาเชื่อมต่อบัญชี Google ก่อนนำเข้าข้อมูล' };
    }

    const cleanId = extractSpreadsheetId(spreadsheetId);
    let tabToRead = sheetTabName;
    
    // Check available sheets in spreadsheet
    try {
      const details = await getSpreadsheetDetails(token, cleanId);
      const sheetTitles = (details.sheets || []).map((s: any) => s.properties?.title);
      if (sheetTitles.length > 0 && !sheetTitles.includes(tabToRead)) {
        tabToRead = sheetTitles[0]; // fallback to first tab
      }
    } catch (e: any) {
      console.warn('Could not inspect sheet tabs, trying default range:', e);
    }

    const rows = await readSpreadsheetRange(token, cleanId, `${tabToRead}!A1:G1000`);
    if (!rows || rows.length <= 1) {
      return { success: false, count: 0, message: 'ไม่พบข้อมูลแถวใน Google Sheet ที่ระบุ' };
    }

    const headers = rows[0].map((h: any) => String(h).trim().toLowerCase());
    
    // Determine column indices
    let nameIdx = headers.findIndex((h: string) => h.includes('ชื่อ') || h.includes('name'));
    let classIdx = headers.findIndex((h: string) => h.includes('ห้อง') || h.includes('class') || h.includes('room'));
    let starIdx = headers.findIndex((h: string) => h.includes('ดาว') || h.includes('star') || h.includes('คะแนน'));
    let avatarIdx = headers.findIndex((h: string) => h.includes('รูป') || h.includes('avatar') || h.includes('ไอคอน'));
    let idIdx = headers.findIndex((h: string) => h.includes('รหัส') || h.includes('id'));

    // Fallbacks if header wasn't matched explicitly
    if (nameIdx === -1) nameIdx = 1 < headers.length ? 1 : 0;
    if (classIdx === -1) classIdx = 2 < headers.length ? 2 : -1;
    if (starIdx === -1) starIdx = 4 < headers.length ? 4 : -1;
    if (avatarIdx === -1) avatarIdx = 3 < headers.length ? 3 : -1;

    const importedStudents: Student[] = [];
    const newClassroomsSet = new Set<string>(classrooms);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const rawName = row[nameIdx] ? String(row[nameIdx]).trim() : '';
      if (!rawName) continue;

      const rawClassroom = (targetClassroom && targetClassroom !== 'all') 
        ? targetClassroom 
        : (classIdx !== -1 && row[classIdx] ? String(row[row[classIdx] !== undefined ? classIdx : 2]).trim() : (classrooms[0] || 'ป.3/1'));
      
      const rawStars = starIdx !== -1 && row[starIdx] ? parseFloat(String(row[starIdx])) : 0;
      const validStars = isNaN(rawStars) ? 0 : Math.max(0, rawStars);

      const rawAvatar = avatarIdx !== -1 && row[avatarIdx] ? String(row[avatarIdx]).trim() : '';
      const chosenAvatar = (rawAvatar && AVATAR_OPTIONS.includes(rawAvatar)) 
        ? rawAvatar 
        : AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

      const studentId = (idIdx !== -1 && row[idIdx] && String(row[idIdx]).trim()) 
        ? String(row[idIdx]).trim() 
        : `std-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      if (rawClassroom) {
        newClassroomsSet.add(rawClassroom);
      }

      importedStudents.push({
        id: studentId,
        name: rawName,
        classroom: rawClassroom || 'ป.3/1',
        stars: validStars,
        avatar: chosenAvatar,
        starHistory: [],
        claimedRewards: [],
        createdAt: Date.now(),
      });
    }

    if (importedStudents.length === 0) {
      return { success: false, count: 0, message: 'ไม่สามารถแปลงข้อมูลนักเรียนจาก Google Sheet ได้ กรุณาตรวจสอบหัวตาราง' };
    }

    // Merge or replace students
    setStudents((prev) => {
      const existingMap = new Map(prev.map((s) => [s.name + '::' + s.classroom, s]));
      const updated = [...prev];
      
      importedStudents.forEach((newStd) => {
        const key = newStd.name + '::' + newStd.classroom;
        if (existingMap.has(key)) {
          const idx = updated.findIndex((s) => s.name === newStd.name && s.classroom === newStd.classroom);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              stars: newStd.stars > 0 ? newStd.stars : updated[idx].stars,
              avatar: newStd.avatar || updated[idx].avatar,
            };
          }
        } else {
          updated.push(newStd);
        }
      });
      return updated;
    });

    setClassrooms(Array.from(newClassroomsSet));
    sounds.playRewardFanfare();
    fireBigCelebration();

    return {
      success: true,
      count: importedStudents.length,
      message: `นำเข้านักเรียน ${importedStudents.length} คน จาก Google Sheet สำเร็จเรียบร้อย!`,
    };
  };

  // Keep sound effects sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Keep attendance & teams in localStorage as well
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  // Firestore Realtime Listener (Instant multi-device sync across Vercel & devices)
  useEffect(() => {
    if (!db) return;
    const docId = user?.uid || 'shared-school';
    const docRef = doc(db, 'teachers', docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const serverTime = data.updatedAt || 0;

          if (serverTime > lastServerTimestampRef.current) {
            lastServerTimestampRef.current = serverTime;

            if (data.students && Array.isArray(data.students) && data.students.length > 0) {
              setStudents(data.students);
              localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
            }
            if (data.classrooms && Array.isArray(data.classrooms) && data.classrooms.length > 0) {
              setClassrooms(data.classrooms);
              localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(data.classrooms));
            }
            if (data.rewards && Array.isArray(data.rewards) && data.rewards.length > 0) {
              setRewards(data.rewards);
              localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(data.rewards));
            }
            if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
              setCategories(data.categories);
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
            }
            if (data.attendance && Array.isArray(data.attendance)) {
              setAttendance(data.attendance);
              localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
            }
            if (data.teams && Array.isArray(data.teams) && data.teams.length > 0) {
              setTeams(data.teams);
              localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(data.teams));
            }

            setLastSavedTime(new Date(serverTime || Date.now()));
          }
        }
        isInitialLoadedRef.current = true;
      },
      (error) => {
        console.warn('Firestore realtime sync warning:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch state from server and apply if newer
  const fetchServerState = useCallback(async (isInitial = false) => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/data/state');
      if (response.ok) {
        const data = await response.json();
        const serverTime = data.updatedAt || 0;

        // If it's initial load or server has newer data
        if (isInitial || serverTime > lastServerTimestampRef.current) {
          lastServerTimestampRef.current = serverTime;
          
          if (data.students && Array.isArray(data.students) && data.students.length > 0) {
            setStudents(data.students);
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
          }
          if (data.classrooms && Array.isArray(data.classrooms) && data.classrooms.length > 0) {
            setClassrooms(data.classrooms);
            localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(data.classrooms));
          }
          if (data.rewards && Array.isArray(data.rewards) && data.rewards.length > 0) {
            setRewards(data.rewards);
            localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(data.rewards));
          }
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
          }
          if (data.attendance && Array.isArray(data.attendance)) {
            setAttendance(data.attendance);
            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
          }
          if (data.teams && Array.isArray(data.teams) && data.teams.length > 0) {
            setTeams(data.teams);
            localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(data.teams));
          }

          setLastSavedTime(new Date(serverTime || Date.now()));
        }

        // If the server was completely blank on initial setup, seed it with local data
        if (isInitial && !data.hasData) {
          await persistStateToServer(students, classrooms, rewards, categories, attendance, teams);
        }
      }
    } catch (err) {
      console.warn('Sync with server API encountered an issue, running from cache/Firestore:', err);
    } finally {
      setIsSyncing(false);
      if (isInitial) {
        isInitialLoadedRef.current = true;
      }
    }
  }, []);

  // Save state to Firestore, server API, and localStorage
  const persistStateToServer = async (
    newStudents: Student[],
    newClassrooms: string[],
    newRewards: Reward[],
    newCategories: StarCategory[],
    newAttendance: AttendanceRecord[],
    newTeams: StudentTeam[]
  ) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      setIsSyncing(true);
      const timestamp = Date.now();
      lastServerTimestampRef.current = timestamp;

      // Save locally first
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(newStudents));
      localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(newClassrooms));
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(newRewards));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(newAttendance));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(newTeams));
      setLastSavedTime(new Date(timestamp));

      // Push to Firestore Cloud Database (for Vercel & real-time multi-device sync)
      if (db) {
        const docId = user?.uid || 'shared-school';
        setDoc(
          doc(db, 'teachers', docId),
          {
            students: newStudents,
            classrooms: newClassrooms,
            rewards: newRewards,
            categories: newCategories,
            attendance: newAttendance,
            teams: newTeams,
            updatedAt: timestamp,
          },
          { merge: true }
        ).catch((err) => console.warn('Firestore setDoc notice:', err));
      }

      // Push to Express server (if running fullstack)
      fetch('/api/data/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: newStudents,
          classrooms: newClassrooms,
          rewards: newRewards,
          categories: newCategories,
          attendance: newAttendance,
          teams: newTeams,
          timestamp,
        }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to sync changes:', err);
    } finally {
      isSavingRef.current = false;
      setIsSyncing(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    fetchServerState(true);
  }, [fetchServerState]);

  // Periodic multi-device live sync & window focus sync
  useEffect(() => {
    // Sync on tab focus or visibility return
    const handleFocus = () => {
      if (!document.hidden) {
        fetchServerState(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // Background polling every 4.5 seconds for live multi-device updates
    const pollInterval = setInterval(() => {
      if (!document.hidden && !isSavingRef.current) {
        fetchServerState(false);
      }
    }, 4500);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(pollInterval);
    };
  }, [fetchServerState]);

  // Auto-sync when local state changes (ONLY after initial load completed)
  useEffect(() => {
    if (!isInitialLoadedRef.current) return;
    persistStateToServer(students, classrooms, rewards, categories, attendance, teams);
  }, [students, classrooms, rewards, categories, attendance, teams]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const syncNow = async () => {
    await fetchServerState(false);
  };

  // Add stars to a student
  const addStars = (
    studentId: string,
    amount: number,
    categoryName?: string,
    note?: string,
    posX?: number,
    posY?: number
  ) => {
    const cat = categoryName || selectedCategory || 'ความดีทั่วไป';
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Sound & Confetti
    if (amount > 0) {
      sounds.playStarChime(amount <= 0.5);
      if (posX !== undefined && posY !== undefined) {
        fireStarBurst(posX, posY);
        emitFloatingParticle(posX, posY, amount);
        if (amount >= 1) {
          fireStarShower();
        }
      } else {
        fireStarShower();
      }
    }

    setStudents((prev) =>
      prev.map((std) => {
        if (std.id !== studentId) return std;
        const newTotal = Math.max(0, Number((std.stars + amount).toFixed(1)));
        const newLog: StarLog = {
          id: logId,
          timestamp: Date.now(),
          studentId: std.id,
          studentName: std.name,
          classroom: std.classroom,
          amount,
          category: cat,
          note: note || undefined,
        };

        return {
          ...std,
          stars: newTotal,
          starHistory: [newLog, ...(std.starHistory || [])],
        };
      })
    );
  };

  // Deduct stars
  const deductStars = (
    studentId: string,
    amount: number,
    categoryName?: string,
    note?: string
  ) => {
    const cat = categoryName || 'หักดาว / ตักเตือน';
    const deductAmount = -Math.abs(amount);
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    sounds.playDeductSound();

    setStudents((prev) =>
      prev.map((std) => {
        if (std.id !== studentId) return std;
        const newTotal = Math.max(0, Number((std.stars + deductAmount).toFixed(1)));
        const newLog: StarLog = {
          id: logId,
          timestamp: Date.now(),
          studentId: std.id,
          studentName: std.name,
          classroom: std.classroom,
          amount: deductAmount,
          category: cat,
          note: note || undefined,
        };

        return {
          ...std,
          stars: newTotal,
          starHistory: [newLog, ...(std.starHistory || [])],
        };
      })
    );
  };

  // Batch add stars to multiple students
  const batchAddStars = (
    studentIds: string[],
    amount: number,
    categoryName?: string,
    note?: string
  ) => {
    if (studentIds.length === 0) return;
    const cat = categoryName || selectedCategory || 'กิจกรรมกลุ่ม';
    sounds.playBatchStars();
    fireBigCelebration();

    setStudents((prev) =>
      prev.map((std) => {
        if (!studentIds.includes(std.id)) return std;
        const newTotal = Math.max(0, Number((std.stars + amount).toFixed(1)));
        const newLog: StarLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          studentId: std.id,
          studentName: std.name,
          classroom: std.classroom,
          amount,
          category: cat,
          note: note || undefined,
        };

        return {
          ...std,
          stars: newTotal,
          starHistory: [newLog, ...(std.starHistory || [])],
        };
      })
    );
  };

  // Add single student
  const addStudent = (name: string, classroom: string, avatar?: string, initialStars: number = 0) => {
    const randomAvatar = avatar || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      classroom: classroom.trim(),
      stars: initialStars,
      avatar: randomAvatar,
      starHistory: initialStars > 0 ? [{
        id: `log-init-${Date.now()}`,
        timestamp: Date.now(),
        studentId: `std-${Date.now()}`,
        studentName: name.trim(),
        classroom: classroom.trim(),
        amount: initialStars,
        category: 'คะแนนเริ่มต้น',
      }] : [],
      claimedRewards: [],
      createdAt: Date.now(),
    };

    setStudents((prev) => [newStudent, ...prev]);
    sounds.playAddStudent();
  };

  // Batch add students from multiline text
  const batchAddStudents = (namesText: string, classroom: string): number => {
    const lines = namesText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return 0;

    const newOnes: Student[] = lines.map((nameLine, index) => {
      const randomAvatar = AVATAR_OPTIONS[(Date.now() + index) % AVATAR_OPTIONS.length];
      return {
        id: `std-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        name: nameLine,
        classroom: classroom.trim(),
        stars: 0,
        avatar: randomAvatar,
        starHistory: [],
        claimedRewards: [],
        createdAt: Date.now() + index,
      };
    });

    setStudents((prev) => [...newOnes, ...prev]);
    sounds.playAddStudent();
    return newOnes.length;
  };

  // Edit student
  const editStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    sounds.playClick();
  };

  // Delete student
  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    sounds.playClick();
  };

  // Add classroom
  const addClassroom = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed || classrooms.includes(trimmed)) return false;
    setClassrooms((prev) => [...prev, trimmed]);
    sounds.playClick();
    return true;
  };

  // Delete classroom
  const deleteClassroom = (name: string) => {
    setClassrooms((prev) => prev.filter((c) => c !== name));
    if (activeClassroom === name) {
      setActiveClassroom('all');
    }
    sounds.playClick();
  };

  // Rename classroom
  const renameClassroom = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed || classrooms.includes(trimmed)) return false;

    setClassrooms((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setStudents((prev) =>
      prev.map((s) => (s.classroom === oldName ? { ...s, classroom: trimmed } : s))
    );
    setAttendance((prev) =>
      prev.map((a) => (a.classroom === oldName ? { ...a, classroom: trimmed } : a))
    );

    if (activeClassroom === oldName) {
      setActiveClassroom(trimmed);
    }
    sounds.playClick();
    return true;
  };

  // Add Reward
  const addReward = (reward: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      ...reward,
      id: `rew-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setRewards((prev) => [...prev, newReward]);
    sounds.playClick();
  };

  // Edit Reward
  const editReward = (id: string, updates: Partial<Reward>) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    sounds.playClick();
  };

  // Delete Reward
  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    sounds.playClick();
  };

  // Claim Reward
  const claimReward = (
    studentId: string,
    rewardId: string
  ): { success: boolean; message: string } => {
    const std = students.find((s) => s.id === studentId);
    const rew = rewards.find((r) => r.id === rewardId);

    if (!std || !rew) {
      return { success: false, message: 'ไม่พบข้อมูลนักเรียนหรือของรางวัล' };
    }

    if (std.stars < rew.requiredStars) {
      return {
        success: false,
        message: `ดาวไม่พอ! น้อง ${std.name} มี ${std.stars} ดาว (ต้องการ ${rew.requiredStars} ดาว)`,
      };
    }

    if (rew.stock !== undefined && rew.stock <= 0) {
      return { success: false, message: 'ขออภัย ของรางวัลนี้หมดแล้ว!' };
    }

    // Deduct stars & decrease stock
    const newStars = Number((std.stars - rew.requiredStars).toFixed(1));
    const claimRecord = {
      rewardId: rew.id,
      rewardName: rew.name,
      requiredStars: rew.requiredStars,
      timestamp: Date.now(),
    };

    const newLog: StarLog = {
      id: `log-claim-${Date.now()}`,
      timestamp: Date.now(),
      studentId: std.id,
      studentName: std.name,
      classroom: std.classroom,
      amount: -rew.requiredStars,
      category: 'แลกของรางวัล',
      note: `แลก: ${rew.name}`,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          stars: newStars,
          claimedRewards: [claimRecord, ...(s.claimedRewards || [])],
          starHistory: [newLog, ...(s.starHistory || [])],
        };
      })
    );

    if (rew.stock !== undefined) {
      setRewards((prev) =>
        prev.map((r) => (r.id === rewardId ? { ...r, stock: Math.max(0, (r.stock || 0) - 1) } : r))
      );
    }

    sounds.playRewardFanfare();
    fireStarShower();

    return {
      success: true,
      message: `ยินดีด้วย! ${std.name} แลกของรางวัล "${rew.name}" สำเร็จ 🎉`,
    };
  };

  // Categories
  const addCategory = (cat: Omit<StarCategory, 'id'>) => {
    const newCat: StarCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    sounds.playClick();
  };

  const editCategory = (id: string, updates: Partial<StarCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    sounds.playClick();
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    sounds.playClick();
  };

  // Attendance
  const markAttendance = (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    const std = students.find((s) => s.id === studentId);
    if (!std) return;

    setAttendance((prev) => {
      const existingIdx = prev.findIndex(
        (a) => a.studentId === studentId && a.date === date
      );
      const newRec: AttendanceRecord = {
        id: `att-${studentId}-${date}`,
        studentId,
        studentName: std.name,
        classroom: std.classroom,
        date,
        status,
        note,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRec;
        return copy;
      }
      return [newRec, ...prev];
    });

    sounds.playClick();
  };

  const batchMarkAttendance = (
    records: { studentId: string; status: AttendanceStatus }[],
    date: string
  ) => {
    setAttendance((prev) => {
      const copy = [...prev];
      records.forEach(({ studentId, status }) => {
        const std = students.find((s) => s.id === studentId);
        if (!std) return;

        const existingIdx = copy.findIndex(
          (a) => a.studentId === studentId && a.date === date
        );
        const newRec: AttendanceRecord = {
          id: `att-${studentId}-${date}`,
          studentId,
          studentName: std.name,
          classroom: std.classroom,
          date,
          status,
        };

        if (existingIdx >= 0) {
          copy[existingIdx] = newRec;
        } else {
          copy.push(newRec);
        }
      });
      return copy;
    });

    sounds.playClick();
  };

  // Reward stars to all present students for a date
  const rewardPresentStudents = (date: string, amount: number, note: string): number => {
    const presentRecords = attendance.filter(
      (a) => a.date === date && a.status === 'present'
    );
    const studentIds = presentRecords.map((a) => a.studentId);

    if (studentIds.length === 0) return 0;

    batchAddStars(studentIds, amount, 'มาเรียนตรงเวลา', note || `มาเรียนวันที่ ${date}`);
    return studentIds.length;
  };

  // Teams
  const createTeam = (
    name: string,
    color: string,
    bgLight: string,
    studentIds: string[] = []
  ) => {
    const newTeam: StudentTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      color,
      bgLight,
      studentIds,
    };
    setTeams((prev) => [...prev, newTeam]);
    sounds.playClick();
  };

  const deleteTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    sounds.playClick();
  };

  const autoSplitTeams = (numTeams: number, classroom: string) => {
    const classroomStudents = students.filter(
      (s) => classroom === 'all' || s.classroom === classroom
    );
    if (classroomStudents.length === 0) return;

    const shuffled = [...classroomStudents].sort(() => Math.random() - 0.5);
    const newTeams: StudentTeam[] = [];

    const defaultNames = ['ทีมมังกรแดง 🐲', 'ทีมนกอินทรีฟ้า 🦅', 'ทีมเสือเขียว 🐯', 'ทีมสิงโตทอง 🦁', 'ทีมยูนิคอร์น 🦄', 'ทีมเพนกวิน 🐧'];
    const colors = [
      { color: 'text-rose-600 border-rose-200 bg-rose-50', bgLight: 'bg-rose-500' },
      { color: 'text-blue-600 border-blue-200 bg-blue-50', bgLight: 'bg-blue-500' },
      { color: 'text-emerald-600 border-emerald-200 bg-emerald-50', bgLight: 'bg-emerald-500' },
      { color: 'text-amber-600 border-amber-200 bg-amber-50', bgLight: 'bg-amber-500' },
      { color: 'text-purple-600 border-purple-200 bg-purple-50', bgLight: 'bg-purple-500' },
      { color: 'text-teal-600 border-teal-200 bg-teal-50', bgLight: 'bg-teal-500' },
    ];

    for (let i = 0; i < numTeams; i++) {
      const idx = i % colors.length;
      newTeams.push({
        id: `team-${Date.now()}-${i}`,
        name: defaultNames[i] || `ทีมกลุ่มที่ ${i + 1}`,
        color: colors[idx].color,
        bgLight: colors[idx].bgLight,
        studentIds: [],
      });
    }

    shuffled.forEach((std, idx) => {
      newTeams[idx % numTeams].studentIds.push(std.id);
    });

    setTeams(newTeams);
    sounds.playRewardFanfare();
    fireStarShower();
  };

  const addStarsToTeam = (teamId: string, amount: number, note: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team || team.studentIds.length === 0) return;
    batchAddStars(team.studentIds, amount, 'กิจกรรมกลุ่ม', `${note} (${team.name})`);
  };

  // Undo a specific log
  const undoStarLog = (logId: string) => {
    let targetLog: StarLog | undefined;
    
    // Find log in any student
    for (const std of students) {
      const found = std.starHistory.find((l) => l.id === logId);
      if (found) {
        targetLog = found;
        break;
      }
    }

    if (!targetLog) return;

    const reverseAmount = -targetLog.amount;

    setStudents((prev) =>
      prev.map((std) => {
        if (std.id !== targetLog!.studentId) return std;
        const newStars = Math.max(0, Number((std.stars + reverseAmount).toFixed(1)));
        const filteredHistory = std.starHistory.filter((l) => l.id !== logId);
        return {
          ...std,
          stars: newStars,
          starHistory: filteredHistory,
        };
      })
    );

    sounds.playClick();
  };

  // Reset to default sample data
  const resetToSampleData = () => {
    setStudents(DEFAULT_STUDENTS);
    setClassrooms(DEFAULT_CLASSROOMS);
    setRewards(DEFAULT_REWARDS);
    setCategories(DEFAULT_CATEGORIES);
    setAttendance([]);
    setTeams(DEFAULT_TEAMS_DATA);
    setActiveClassroom('all');
    sounds.playClick();
  };

  // Export JSON backup
  const exportBackupJSON = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      students,
      classrooms,
      rewards,
      categories,
      attendance,
      teams,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `star-good-deeds-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sounds.playClick();
  };

  // Import JSON backup
  const importBackupJSON = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.students || !Array.isArray(data.students)) {
        return { success: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง (ไม่พบข้อมูลนักเรียน)' };
      }

      setStudents(data.students);
      if (data.classrooms && Array.isArray(data.classrooms)) {
        setClassrooms(data.classrooms);
      }
      if (data.rewards && Array.isArray(data.rewards)) {
        setRewards(data.rewards);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (data.attendance && Array.isArray(data.attendance)) {
        setAttendance(data.attendance);
      }
      if (data.teams && Array.isArray(data.teams)) {
        setTeams(data.teams);
      }

      sounds.playRewardFanfare();
      fireBigCelebration();
      return { success: true, message: `นำเข้าข้อมูลสำเร็จ! พบนักเรียนทั้งหมด ${data.students.length} คน` };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message}` };
    }
  };

  // Export compact Base64 backup code
  const exportBackupCode = (): string => {
    const backupData = {
      v: '2.0',
      t: Date.now(),
      s: students,
      c: classrooms,
      r: rewards,
      cat: categories,
      att: attendance,
      tm: teams
    };

    try {
      const jsonStr = JSON.stringify(backupData);
      const encoded = btoa(encodeURIComponent(jsonStr));
      return `STAR-${encoded}`;
    } catch (err) {
      console.error('Failed to generate backup code:', err);
      return '';
    }
  };

  // Import compact Base64 backup code
  const importBackupCode = (codeString: string): { success: boolean; message: string } => {
    try {
      let raw = codeString.trim();
      if (raw.startsWith('STAR-')) {
        raw = raw.slice(5);
      }

      const jsonStr = decodeURIComponent(atob(raw));
      const data = JSON.parse(jsonStr);

      if (!data.s || !Array.isArray(data.s)) {
        return { success: false, message: 'รหัสโค้ดไม่ถูกต้อง หรือรูปแบบข้อมูลเสียหาย' };
      }

      setStudents(data.s);
      if (data.c && Array.isArray(data.c)) setClassrooms(data.c);
      if (data.r && Array.isArray(data.r)) setRewards(data.r);
      if (data.cat && Array.isArray(data.cat)) setCategories(data.cat);
      if (data.att && Array.isArray(data.att)) setAttendance(data.att);
      if (data.tm && Array.isArray(data.tm)) setTeams(data.tm);

      sounds.playRewardFanfare();
      fireBigCelebration();
      return {
        success: true,
        message: `กู้คืนข้อมูลสำเร็จ! มีนักเรียน ${data.s.length} คน และ ${data.c?.length || 0} ห้องเรียน`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'รหัสโค้ดไม่ถูกต้อง กรุณาคัดลอกรหัสใหม่ให้ครบถ้วน',
      };
    }
  };

  // Get all star logs across all students
  const getAllStarLogs = (): StarLog[] => {
    const logs: StarLog[] = [];
    students.forEach((s) => {
      if (s.starHistory && s.starHistory.length > 0) {
        logs.push(...s.starHistory);
      }
    });
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        classrooms,
        rewards,
        categories,
        activeClassroom,
        selectedCategory,
        soundEnabled,
        user,
        authLoading,
        isSyncing,
        lastSavedTime,
        syncNow,
        googleAccessToken,
        linkedSpreadsheet,
        setLinkedSpreadsheet,
        connectGoogleSheets,
        disconnectGoogleSheets,
        exportToGoogleSheets,
        syncToLinkedGoogleSheet,
        importStudentsFromGoogleSheet,
        setActiveClassroom,
        setSelectedCategory,
        toggleSound,
        loginWithGoogle,
        loginWithGithub,
        loginAsGuest,
        logout: logoutUser,
        addStars,
        deductStars,
        batchAddStars,
        addStudent,
        batchAddStudents,
        editStudent,
        deleteStudent,
        addClassroom,
        deleteClassroom,
        renameClassroom,
        addReward,
        editReward,
        deleteReward,
        claimReward,
        addCategory,
        editCategory,
        deleteCategory,
        attendance,
        markAttendance,
        batchMarkAttendance,
        rewardPresentStudents,
        teams,
        createTeam,
        deleteTeam,
        autoSplitTeams,
        addStarsToTeam,
        isProjectorOpen,
        setIsProjectorOpen,
        undoStarLog,
        resetToSampleData,
        exportBackupJSON,
        importBackupJSON,
        exportBackupCode,
        importBackupCode,
        getAllStarLogs,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};
