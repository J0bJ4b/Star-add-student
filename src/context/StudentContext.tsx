import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Reward, StarLog, StarCategory } from '../types';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_REWARDS, 
  DEFAULT_CLASSROOMS, 
  DEFAULT_CATEGORIES, 
  AVATAR_OPTIONS 
} from '../lib/constants';
import { sounds } from '../lib/audio';
import { fireStarBurst, fireBigCelebration } from '../lib/confetti';
import { auth, db, loginWithGoogle, loginAsGuest, logoutUser } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  
  addReward: (reward: Omit<Reward, 'id'>) => void;
  editReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  claimReward: (studentId: string, rewardId: string) => { success: boolean; message: string };
  
  undoStarLog: (logId: string) => void;
  resetToSampleData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => { success: boolean; message: string };
  
  getAllStarLogs: () => StarLog[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'stargooddeeds_students_v2',
  CLASSROOMS: 'stargooddeeds_classrooms_v2',
  REWARDS: 'stargooddeeds_rewards_v2',
  CATEGORIES: 'stargooddeeds_categories_v2',
  SOUND: 'stargooddeeds_sound_v2',
};

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
        // Load data from Firestore
        try {
          setIsSyncing(true);
          const docRef = doc(db, 'teachers', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.students) setStudents(data.students);
            if (data.classrooms) setClassrooms(data.classrooms);
            if (data.rewards) setRewards(data.rewards);
            if (data.categories) setCategories(data.categories);
          } else {
            // First time login for this user: sync local state to Firestore
            await setDoc(docRef, {
              students,
              classrooms,
              rewards,
              categories,
              updatedAt: Date.now(),
            });
          }
        } catch (err) {
          console.warn('Firestore load failed, relying on local storage:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage & Cloud Firestore
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
          const docRef = doc(db, 'teachers', user.uid);
          await setDoc(
            docRef,
            {
              students: newStudents,
              classrooms: newClassrooms,
              rewards: newRewards,
              categories: newCategories,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
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
      } else {
        fireStarBurst(0.5, 0.4);
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
    fireStarBurst(0.5, 0.3);

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
        addReward,
        editReward,
        deleteReward,
        claimReward,
        undoStarLog,
        resetToSampleData,
        exportBackupJSON,
        importBackupJSON,
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
