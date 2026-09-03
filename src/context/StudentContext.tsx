import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Reward, StarLog, StarCategory, AttendanceRecord, AttendanceStatus, StudentTeam } from '../types';
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
import { auth, loginWithGoogle, loginAsGuest, logoutUser } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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
  
  // Actions
  setActiveClassroom: (classroom: string) => void;
  setSelectedCategory: (cat: string) => void;
  toggleSound: () => void;
  loginWithGoogle: () => Promise<User | void>;
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

  const [activeClassroom, setActiveClassroom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ส่งงานครบ');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());

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

  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);

  // Sync attendance & teams
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  // Keep sound effects sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        // Load data from Cloud SQL backend
        try {
          setIsSyncing(true);
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/data/state', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.students && data.students.length > 0) setStudents(data.students);
            if (data.classrooms && data.classrooms.length > 0) setClassrooms(data.classrooms);
            if (data.rewards && data.rewards.length > 0) setRewards(data.rewards);
            if (data.categories && data.categories.length > 0) setCategories(data.categories);
          }
        } catch (err) {
          console.warn('Backend load failed, relying on local storage:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage & Cloud SQL
  const persistState = useCallback(
    async (
      newStudents: Student[],
      newClassrooms: string[],
      newRewards: Reward[],
      newCategories: StarCategory[]
    ) => {
      try {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(newStudents));
        localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(newClassrooms));
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(newRewards));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
        setLastSavedTime(new Date());

        if (user) {
          setIsSyncing(true);
          const token = await user.getIdToken();
          await fetch('/api/data/state', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              students: newStudents,
              classrooms: newClassrooms,
              rewards: newRewards,
              categories: newCategories
            })
          });
          setIsSyncing(false);
        }
      } catch (err) {
        console.error('Failed to persist state:', err);
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Auto-sync when state updates
  useEffect(() => {
    persistState(students, classrooms, rewards, categories);
  }, [students, classrooms, rewards, categories, persistState]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
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
    const cat = categoryName || selectedCategory || 'มอบดาวทั้งกลุ่ม';
    sounds.playStarChime(false);
    fireStarShower();

    const now = Date.now();
    setStudents((prev) =>
      prev.map((std) => {
        if (!studentIds.includes(std.id)) return std;
        const newTotal = Math.max(0, Number((std.stars + amount).toFixed(1)));
        const newLog: StarLog = {
          id: `log-${now}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: now,
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
  const addStudent = (
    name: string,
    classroom: string,
    avatar?: string,
    initialStars: number = 0
  ) => {
    const randomAvatar = avatar || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      classroom: classroom.trim() || 'ป.3/1',
      stars: initialStars,
      avatar: randomAvatar,
      claimedRewards: [],
      starHistory: initialStars > 0 ? [
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          studentId: `std-${Date.now()}`,
          studentName: name.trim(),
          classroom: classroom.trim() || 'ป.3/1',
          amount: initialStars,
          category: 'คะแนนเริ่มต้น',
          note: 'ลงทะเบียนเข้าสู่ระบบ'
        }
      ] : [],
      createdAt: Date.now(),
    };

    setStudents((prev) => [newStudent, ...prev]);

    // If classroom not in list, add it
    if (classroom && !classrooms.includes(classroom.trim())) {
      setClassrooms((prev) => [...prev, classroom.trim()]);
    }
    sounds.playClick();
  };

  // Bulk add students by pasting lines
  const batchAddStudents = (namesText: string, targetClassroom: string): number => {
    const lines = namesText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return 0;

    const newStudents: Student[] = lines.map((name, index) => {
      // Pick avatar cyclically
      const avatar = AVATAR_OPTIONS[(students.length + index) % AVATAR_OPTIONS.length];
      return {
        id: `std-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        classroom: targetClassroom || 'ป.3/1',
        stars: 0,
        avatar,
        claimedRewards: [],
        starHistory: [],
        createdAt: Date.now(),
      };
    });

    setStudents((prev) => [...newStudents, ...prev]);
    if (targetClassroom && !classrooms.includes(targetClassroom)) {
      setClassrooms((prev) => [...prev, targetClassroom]);
    }
    sounds.playClick();
    return newStudents.length;
  };

  // Edit student info
  const editStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((std) => {
        if (std.id !== id) return std;
        return {
          ...std,
          ...updates,
        };
      })
    );
    sounds.playClick();
  };

  // Delete student
  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((std) => std.id !== id));
    sounds.playDeductSound();
  };

  // Classroom management
  const addClassroom = (name: string): boolean => {
    const cleanName = name.trim();
    if (!cleanName || classrooms.includes(cleanName)) return false;
    setClassrooms((prev) => [...prev, cleanName]);
    sounds.playClick();
    return true;
  };

  const deleteClassroom = (name: string) => {
    setClassrooms((prev) => prev.filter((c) => c !== name));
    if (activeClassroom === name) {
      setActiveClassroom('all');
    }
    sounds.playClick();
  };

  const renameClassroom = (oldName: string, newName: string): boolean => {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanNew || (cleanOld !== cleanNew && classrooms.includes(cleanNew))) return false;

    setClassrooms((prev) => prev.map((c) => (c === cleanOld ? cleanNew : c)));
    setStudents((prev) =>
      prev.map((s) => (s.classroom === cleanOld ? { ...s, classroom: cleanNew } : s))
    );
    if (activeClassroom === cleanOld) {
      setActiveClassroom(cleanNew);
    }
    sounds.playClick();
    return true;
  };

  // Reward Management
  const addReward = (rewardData: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      ...rewardData,
      id: `rew-${Date.now()}`,
    };
    setRewards((prev) => [...prev, newReward]);
    sounds.playClick();
  };

  const editReward = (id: string, updates: Partial<Reward>) => {
    setRewards((prev) =>
      prev.map((rew) => (rew.id === id ? { ...rew, ...updates } : rew))
    );
    sounds.playClick();
  };

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((rew) => rew.id !== id));
    sounds.playClick();
  };

  // Claim reward
  const claimReward = (studentId: string, rewardId: string): { success: boolean; message: string } => {
    const student = students.find((s) => s.id === studentId);
    const reward = rewards.find((r) => r.id === rewardId);

    if (!student || !reward) {
      return { success: false, message: 'ไม่พบข้อมูลนักเรียนหรือของรางวัล' };
    }

    if (student.stars < reward.requiredStars) {
      return {
        success: false,
        message: `ดาวไม่เพียงพอ! ต้องการ ${reward.requiredStars} ดาว (ปัจจุบันมี ${student.stars} ดาว)`,
      };
    }

    if (reward.stock !== undefined && reward.stock <= 0) {
      return { success: false, message: 'ของรางวัลชิ้นนี้หมดแล้ว' };
    }

    const logId = `claim-${Date.now()}`;
    const claimTime = Date.now();

    // Deduct stars & record claim
    setStudents((prev) =>
      prev.map((std) => {
        if (std.id !== studentId) return std;
        const newStars = Math.max(0, Number((std.stars - reward.requiredStars).toFixed(1)));
        const claimEntry = {
          rewardId: reward.id,
          rewardName: reward.name,
          requiredStars: reward.requiredStars,
          timestamp: claimTime,
        };
        const newLog: StarLog = {
          id: logId,
          timestamp: claimTime,
          studentId: std.id,
          studentName: std.name,
          classroom: std.classroom,
          amount: -reward.requiredStars,
          category: 'แลกของรางวัล',
          note: `แลก: ${reward.name} (${reward.requiredStars} ดาว)`,
        };

        return {
          ...std,
          stars: newStars,
          claimedRewards: [claimEntry, ...(std.claimedRewards || [])],
          starHistory: [newLog, ...(std.starHistory || [])],
        };
      })
    );

    // Decrease stock if limited
    if (reward.stock !== undefined && reward.stock > 0) {
      setRewards((prev) =>
        prev.map((r) => (r.id === rewardId ? { ...r, stock: (r.stock || 1) - 1 } : r))
      );
    }

    // Celebration
    sounds.playRewardFanfare();
    fireBigCelebration();

    return {
      success: true,
      message: `แลกรางวัล "${reward.name}" ให้ ${student.name} สำเร็จ!`,
    };
  };

  // Category Management
  const addCategory = (catData: Omit<StarCategory, 'id'>) => {
    const newCat: StarCategory = {
      ...catData,
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

  // Attendance Management
  const markAttendance = (studentId: string, date: string, status: AttendanceStatus, note?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setAttendance((prev) => {
      const existingIndex = prev.findIndex((r) => r.studentId === studentId && r.date === date);
      const newRecord: AttendanceRecord = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date,
        studentId,
        studentName: student.name,
        classroom: student.classroom,
        status,
        note,
      };

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = newRecord;
        return copy;
      } else {
        return [...prev, newRecord];
      }
    });
    sounds.playClick();
  };

  const batchMarkAttendance = (records: { studentId: string; status: AttendanceStatus }[], date: string) => {
    setAttendance((prev) => {
      const map = new Map<string, AttendanceRecord>();
      prev.forEach((r) => {
        if (r.date !== date) {
          map.set(`${r.studentId}-${r.date}`, r);
        }
      });
      records.forEach((rec) => {
        const student = students.find((s) => s.id === rec.studentId);
        if (student) {
          map.set(`${rec.studentId}-${date}`, {
            id: `att-${Date.now()}-${rec.studentId}`,
            date,
            studentId: rec.studentId,
            studentName: student.name,
            classroom: student.classroom,
            status: rec.status,
          });
        }
      });
      return Array.from(map.values());
    });
    sounds.playClick();
  };

  const rewardPresentStudents = (date: string, amount: number, note: string): number => {
    const presentRecords = attendance.filter((a) => a.date === date && a.status === 'present');
    const presentIds = presentRecords.map((r) => r.studentId);
    if (presentIds.length > 0) {
      batchAddStars(presentIds, amount, 'ตรงต่อเวลา', note || `มาเรียนตรงเวลา วันที่ ${date}`);
    }
    return presentIds.length;
  };

  // Team Management
  const createTeam = (name: string, color: string, bgLight: string, studentIds: string[] = []) => {
    const newTeam: StudentTeam = {
      id: `team-${Date.now()}`,
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
    const filteredStudents = classroom === 'all' 
      ? [...students] 
      : students.filter((s) => s.classroom === classroom);
    
    const shuffled = [...filteredStudents].sort(() => Math.random() - 0.5);

    const teamNames = ['ทีมมังกรแดง 🐲', 'ทีมนกอินทรีฟ้า 🦅', 'ทีมเสือเขียว 🐯', 'ทีมสิงโตทอง 🦁', 'ทีมฟีนิกซ์ม่วง 🦅', 'ทีมเพนกวินหิมะ 🐧'];
    const teamColors = [
      { color: 'text-rose-600 border-rose-200 bg-rose-50', bgLight: 'bg-rose-500' },
      { color: 'text-blue-600 border-blue-200 bg-blue-50', bgLight: 'bg-blue-500' },
      { color: 'text-emerald-600 border-emerald-200 bg-emerald-50', bgLight: 'bg-emerald-500' },
      { color: 'text-amber-600 border-amber-200 bg-amber-50', bgLight: 'bg-amber-500' },
      { color: 'text-purple-600 border-purple-200 bg-purple-50', bgLight: 'bg-purple-500' },
      { color: 'text-cyan-600 border-cyan-200 bg-cyan-50', bgLight: 'bg-cyan-500' },
    ];

    const newTeams: StudentTeam[] = [];
    for (let i = 0; i < numTeams; i++) {
      newTeams.push({
        id: `team-${i + 1}`,
        name: teamNames[i % teamNames.length] || `ทีมที่ ${i + 1}`,
        color: teamColors[i % teamColors.length].color,
        bgLight: teamColors[i % teamColors.length].bgLight,
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

      sounds.playRewardFanfare();
      fireStarBurst();
      return { success: true, message: `นำเข้าข้อมูลเรียบร้อย! นักเรียน ${data.students.length} คน` };
    } catch (e: any) {
      return { success: false, message: `เกิดข้อผิดพลาดในการอ่านไฟล์: ${e.message}` };
    }
  };

  // Export as Code string (Base64 encoded JSON for easy copy-pasting)
  const exportBackupCode = (): string => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      students,
      classrooms,
      rewards,
      categories,
      attendance,
    };
    try {
      const jsonStr = JSON.stringify(backupData);
      // UTF-8 safe base64 encoding
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binaryStr = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryStr += String.fromCharCode(utf8Bytes[i]);
      }
      const base64 = btoa(binaryStr);
      return `STAR-${base64}`;
    } catch (e) {
      return JSON.stringify(backupData);
    }
  };

  // Import from Code string (Base64 or raw JSON)
  const importBackupCode = (codeString: string): { success: boolean; message: string } => {
    const trimmed = codeString.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณากรอกหรือวางรหัสโค้ดข้อมูล' };
    }

    try {
      let jsonString = '';
      if (trimmed.startsWith('STAR-')) {
        const base64Part = trimmed.slice(5);
        const binaryStr = atob(base64Part);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        jsonString = new TextDecoder().decode(bytes);
      } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        jsonString = trimmed;
      } else {
        // Try decoding raw base64
        try {
          const binaryStr = atob(trimmed);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          jsonString = new TextDecoder().decode(bytes);
        } catch {
          jsonString = trimmed;
        }
      }

      const data = JSON.parse(jsonString);
      if (!data.students || !Array.isArray(data.students)) {
        return { success: false, message: 'รหัสโค้ดไม่ถูกต้อง หรือรูปแบบข้อมูลไม่สมบูรณ์ (ไม่พบข้อมูลนักเรียน)' };
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

      sounds.playRewardFanfare();
      fireStarBurst();
      return { success: true, message: `โหลดข้อมูลสำเร็จ! นักเรียน ${data.students.length} คน` };
    } catch (e: any) {
      return { success: false, message: `รหัสโค้ดไม่ถูกต้อง กรุณาตรวจสอบโค้ดอีกครั้ง (${e.message})` };
    }
  };

  // Get aggregated history logs sorted by timestamp descending
  const getAllStarLogs = (): StarLog[] => {
    const allLogs: StarLog[] = [];
    students.forEach((std) => {
      if (std.starHistory && std.starHistory.length > 0) {
        std.starHistory.forEach((log) => {
          allLogs.push({
            ...log,
            studentName: std.name,
            classroom: std.classroom,
          });
        });
      }
    });
    return allLogs.sort((a, b) => b.timestamp - a.timestamp);
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
        setActiveClassroom,
        setSelectedCategory,
        toggleSound,
        loginWithGoogle,
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
