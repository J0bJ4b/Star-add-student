import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Student } from '../types';
import { useStudents } from '../context/StudentContext';
import { AVATAR_OPTIONS } from '../lib/constants';

interface Props {
  student?: Student | null;
  onClose: () => void;
}

export const StudentFormModal: React.FC<Props> = ({ student, onClose }) => {
  const { addStudent, editStudent, classrooms } = useStudents();
  
  const [name, setName] = useState(student?.name || '');
  const [classroom, setClassroom] = useState(student?.classroom || classrooms[0] || 'ป.1/1');
  const [avatar, setAvatar] = useState(student?.avatar || AVATAR_OPTIONS[0]);
  const [initialStars, setInitialStars] = useState(student?.stars?.toString() || '0');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!student;

  const handleSave = () => {
    if (!name.trim()) return;

    if (isEditing) {
      editStudent(student.id, {
        name: name.trim(),
        classroom,
        avatar
      });
    } else {
      addStudent(name.trim(), classroom, avatar, parseFloat(initialStars) || 0);
    }
    onClose();
  };

  const processImage = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setAvatar(dataUrl);
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกินไป (จำกัด 5MB)');
        return;
      }
      processImage(file);
    }
  };

  const isCustomImage = avatar.startsWith('data:') || avatar.startsWith('http');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-black font-heading text-slate-800">
            {isEditing ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <label className="text-xs font-bold text-slate-500 mb-2">รูปประจำตัว (Avatar)</label>
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-5xl overflow-hidden group-hover:border-purple-400 transition-colors shadow-inner">
                {isCustomImage ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatar}</span>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xs font-bold text-slate-500">รอสักครู่...</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors"
                title="อัปโหลดรูปภาพ"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            {/* Quick Emoji Picker */}
            <div className="mt-4 w-full">
              <label className="text-[10px] font-bold text-slate-400 block mb-1.5 text-center">หรือเลือกจากอีโมจิ</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATAR_OPTIONS.slice(0, 10).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110 ${
                      avatar === emoji ? 'bg-purple-100 border border-purple-300' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">ชื่อ - นามสกุล (หรือชื่อเล่น)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ด.ช. มาวิน"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">ห้องเรียน</label>
                <select 
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                >
                  {classrooms.map(c => (
                    <option key={c} value={c}>ห้อง {c}</option>
                  ))}
                </select>
              </div>

              {!isEditing && (
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">ดาวเริ่มต้น</label>
                  <input 
                    type="number" 
                    value={initialStars}
                    onChange={(e) => setInitialStars(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-sm font-bold transition-all"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim() || isProcessing}
            className="flex-[2] py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center"
          >
            {isProcessing ? 'กำลังประมวลผล...' : 'บันทึกข้อมูล'}
          </button>
        </div>

      </div>
    </div>
  );
};
