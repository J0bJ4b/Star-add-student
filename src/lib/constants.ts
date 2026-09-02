import { Reward, StarCategory, Student } from '../types';

export const DEFAULT_CATEGORIES: StarCategory[] = [
  {
    id: 'cat-1',
    name: 'ส่งงานครบ',
    icon: 'CheckCircle2',
    color: 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
    bgLight: 'bg-emerald-50 text-emerald-700',
    defaultAmount: 1,
  },
  {
    id: 'cat-2',
    name: 'ประพฤติดี',
    icon: 'Heart',
    color: 'text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100',
    bgLight: 'bg-purple-50 text-purple-700',
    defaultAmount: 1,
  },
  {
    id: 'cat-3',
    name: 'ช่วยเหลือเพื่อน',
    icon: 'Users',
    color: 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100',
    bgLight: 'bg-blue-50 text-blue-700',
    defaultAmount: 1,
  },
  {
    id: 'cat-4',
    name: 'ตอบคำถามถูก',
    icon: 'Sparkles',
    color: 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100',
    bgLight: 'bg-amber-50 text-amber-700',
    defaultAmount: 0.5,
  },
  {
    id: 'cat-5',
    name: 'ทำการบ้านครบ',
    icon: 'BookOpen',
    color: 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
    bgLight: 'bg-indigo-50 text-indigo-700',
    defaultAmount: 1,
  },
  {
    id: 'cat-6',
    name: 'ตรงต่อเวลา',
    icon: 'Clock',
    color: 'text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100',
    bgLight: 'bg-teal-50 text-teal-700',
    defaultAmount: 0.5,
  },
  {
    id: 'cat-7',
    name: 'ทำความสะอาดห้อง',
    icon: 'Sparkle',
    color: 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100',
    bgLight: 'bg-rose-50 text-rose-700',
    defaultAmount: 1,
  },
];

export const AVATAR_OPTIONS = [
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', 
  '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🚀', '⭐',
  '🎈', '🎨', '⚽', '👑', '🌻', '🍎', '🌈', '⚡'
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'เด็กชายกิตติศักดิ์ ใจดี (ก้อง)',
    classroom: 'ป.3/1',
    stars: 18.5,
    avatar: '🦁',
    claimedRewards: [],
    starHistory: [
      {
        id: 'hist-1',
        timestamp: Date.now() - 3600000 * 2,
        studentId: 'std-1',
        studentName: 'เด็กชายกิตติศักดิ์ ใจดี (ก้อง)',
        classroom: 'ป.3/1',
        amount: 1,
        category: 'ส่งงานครบ',
        note: 'ส่งแบบฝึกหัดคณิตศาสตร์เรียบร้อย'
      },
      {
        id: 'hist-2',
        timestamp: Date.now() - 3600000 * 5,
        studentId: 'std-1',
        studentName: 'เด็กชายกิตติศักดิ์ ใจดี (ก้อง)',
        classroom: 'ป.3/1',
        amount: 0.5,
        category: 'ตอบคำถามถูก',
        note: 'ตอบคำถามวิชาวิทยาศาสตร์'
      }
    ]
  },
  {
    id: 'std-2',
    name: 'เด็กหญิงกานดา สดใส (แก้ม)',
    classroom: 'ป.3/1',
    stars: 16,
    avatar: '🐰',
    claimedRewards: [],
    starHistory: [
      {
        id: 'hist-3',
        timestamp: Date.now() - 3600000 * 3,
        studentId: 'std-2',
        studentName: 'เด็กหญิงกานดา สดใส (แก้ม)',
        classroom: 'ป.3/1',
        amount: 1,
        category: 'ช่วยเหลือเพื่อน',
        note: 'ช่วยเพื่อนเก็บอุปกรณ์ศิลปะ'
      }
    ]
  },
  {
    id: 'std-3',
    name: 'เด็กชายธนภัทร รุ่งเรือง (นนท์)',
    classroom: 'ป.3/1',
    stars: 14.5,
    avatar: '🚀',
    claimedRewards: [],
    starHistory: [
      {
        id: 'hist-4',
        timestamp: Date.now() - 3600000 * 8,
        studentId: 'std-3',
        studentName: 'เด็กชายธนภัทร รุ่งเรือง (นนท์)',
        classroom: 'ป.3/1',
        amount: 1,
        category: 'ประพฤติดี',
        note: 'มีมารยาทดี กล่าวสวัสดีคุณครู'
      }
    ]
  },
  {
    id: 'std-4',
    name: 'เด็กหญิงพิมพ์ชนก อักษรศิลป์ (พลอย)',
    classroom: 'ป.3/1',
    stars: 12,
    avatar: '🦄',
    claimedRewards: [],
    starHistory: [
      {
        id: 'hist-5',
        timestamp: Date.now() - 3600000 * 12,
        studentId: 'std-4',
        studentName: 'เด็กหญิงพิมพ์ชนก อักษรศิลป์ (พลอย)',
        classroom: 'ป.3/1',
        amount: 1,
        category: 'ทำการบ้านครบ',
      }
    ]
  },
  {
    id: 'std-5',
    name: 'เด็กชายภูวดล สุขสมบูรณ์ (มิน)',
    classroom: 'ป.3/1',
    stars: 9.5,
    avatar: '🐼',
    claimedRewards: [],
    starHistory: []
  },
  {
    id: 'std-6',
    name: 'เด็กหญิงมัทนา แสนสุข (มิ้น)',
    classroom: 'ป.3/2',
    stars: 15,
    avatar: '🐱',
    claimedRewards: [],
    starHistory: []
  },
  {
    id: 'std-7',
    name: 'เด็กชายวรพล เลิศปัญญา (วิน)',
    classroom: 'ป.3/2',
    stars: 11,
    avatar: '⚡',
    claimedRewards: [],
    starHistory: []
  },
  {
    id: 'std-8',
    name: 'เด็กหญิงชลธิชา บุญช่วย (น้ำ)',
    classroom: 'ป.3/2',
    stars: 8,
    avatar: '🌻',
    claimedRewards: [],
    starHistory: []
  }
];

export const DEFAULT_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    name: 'สติกเกอร์การ์ตูนสุดน่ารัก',
    requiredStars: 5,
    description: 'เลือกสติกเกอร์ลายการ์ตูนอนิเมะ/สัตว์น่ารัก 1 แผ่น',
    icon: '🎨',
    stock: 20
  },
  {
    id: 'rew-2',
    name: 'ดินสอเปลี่ยนไส้ / ปากกาเจลสีสวย',
    requiredStars: 10,
    description: 'อุปกรณ์เครื่องเขียนน่ารัก 1 ด้าม สำหรับใช้เรียน',
    icon: '✏️',
    stock: 15
  },
  {
    id: 'rew-3',
    name: 'ขนมกล่องแสนอร่อย',
    requiredStars: 15,
    description: 'ขนมกรุบกรอบหรือเยลลี่ผลไม้รสโปรด 1 ห่อ',
    icon: '🍬',
    stock: 10
  },
  {
    id: 'rew-4',
    name: 'การ์ดสิทธิ์นั่งข้างเพื่อนสนิท 1 วัน',
    requiredStars: 20,
    description: 'เลือกที่นั่งเรียนข้างเพื่อนสนิทได้เป็นเวลา 1 วันเต็ม',
    icon: '🎟️',
    stock: 99
  },
  {
    id: 'rew-5',
    name: 'มงกุฎคนเก่งประจำสัปดาห์ & ผู้ช่วยครู',
    requiredStars: 30,
    description: 'รับเกียรติบัตรคนเก่ง สวมมงกุฎ และเป็นหัวหน้าช่วยแจกสมุด',
    icon: '👑',
    stock: 5
  }
];

export const DEFAULT_CLASSROOMS = ['ป.3/1', 'ป.3/2', 'ป.3/3', 'ป.4/1'];
