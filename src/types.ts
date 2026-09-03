export interface StarLog {
  id: string;
  timestamp: number;
  studentId: string;
  studentName: string;
  classroom: string;
  amount: number; // e.g. +1, +0.5, -0.5, -1
  category: string; // e.g. "ส่งงานครบ", "ประพฤติดี", "ช่วยเหลือเพื่อน", "ตอบคำถามถูก", "ทำการบ้านครบ"
  note?: string;
}

export interface Student {
  id: string;
  name: string;
  classroom: string;
  stars: number;
  avatar: string;
  starHistory: StarLog[];
  claimedRewards: {
    rewardId: string;
    rewardName: string;
    requiredStars: number;
    timestamp: number;
  }[];
  createdAt?: number;
}

export interface Reward {
  id: string;
  name: string;
  requiredStars: number;
  description: string;
  icon?: string;
  stock?: number;
}

export interface Classroom {
  id: string;
  name: string;
}

export interface StarCategory {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind color classes or hex
  bgLight: string;
  defaultAmount: number;
}

export type TabType = 'dashboard' | 'add-star' | 'students' | 'classrooms' | 'leaderboard' | 'rewards' | 'history';
