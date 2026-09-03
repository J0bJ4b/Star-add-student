import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { StarCategory } from '../types';
import { 
  Award, Plus, Edit2, Trash2, Check, Star, Sparkles, 
  Heart, Users, BookOpen, Clock, ThumbsUp, Shield, Flame
} from 'lucide-react';
import { sounds } from '../lib/audio';

const COLOR_PRESETS = [
  { name: 'เขียวสดใส', color: 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100', bgLight: 'bg-emerald-50 text-emerald-700' },
  { name: 'ม่วงพรีเมียม', color: 'text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100', bgLight: 'bg-purple-50 text-purple-700' },
  { name: 'ฟ้าสร้างสรรค์', color: 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100', bgLight: 'bg-blue-50 text-blue-700' },
  { name: 'ทองสว่าง', color: 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100', bgLight: 'bg-amber-50 text-amber-700' },
  { name: 'กุหลาบชมพู', color: 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100', bgLight: 'bg-rose-50 text-rose-700' },
  { name: 'ครามวิชาการ', color: 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100', bgLight: 'bg-indigo-50 text-indigo-700' },
  { name: 'ฟ้าครามทะเล', color: 'text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100', bgLight: 'bg-teal-50 text-teal-700' },
];

const ICON_PRESETS = ['⭐', '📚', '🧹', '🙋', '🤝', '❤️', '🏆', '🎯', '💡', '⏰', '🎨', '🚀'];

export const BadgesView: React.FC = () => {
  const { categories, addCategory, editCategory, deleteCategory, students } = useStudents();

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [defaultAmount, setDefaultAmount] = useState<number>(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Count usage of each category in all student star histories
  const categoryUsageMap = new Map<string, number>();
  students.forEach((std) => {
    std.starHistory?.forEach((log) => {
      const current = categoryUsageMap.get(log.category) || 0;
      categoryUsageMap.set(log.category, current + 1);
    });
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setIcon('⭐');
    setDefaultAmount(1);
    setSelectedColorIndex(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: StarCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon || '⭐');
    setDefaultAmount(cat.defaultAmount || 1);
    const colorIdx = COLOR_PRESETS.findIndex((c) => c.color === cat.color);
    setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenColor = COLOR_PRESETS[selectedColorIndex];

    if (editingId) {
      editCategory(editingId, {
        name: name.trim(),
        icon,
        defaultAmount,
        color: chosenColor.color,
        bgLight: chosenColor.bgLight,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon,
        defaultAmount,
        color: chosenColor.color,
        bgLight: chosenColor.bgLight,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-heading text-slate-800 flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <span>คลังเกณฑ์การให้ดาว & พฤติกรรม</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดปุ่มลัดเหตุผลความดีและเกณฑ์คะแนนดาว เพื่อกดมอบให้นักเรียนได้ในคลิกเดียว
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-600/20 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเกณฑ์พฤติกรรมใหม่</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const usageCount = categoryUsageMap.get(cat.name) || 0;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${cat.color}`}>
                    {cat.icon || '⭐'}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="แก้ไขเกณฑ์"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบเกณฑ์ "${cat.name}" ใช่หรือไม่?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="ลบเกณฑ์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-black text-base text-slate-800 mt-3 truncate">
                  {cat.name}
                </h3>

                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{cat.defaultAmount > 0 ? `+${cat.defaultAmount}` : cat.defaultAmount} ดาว</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ใช้ไปแล้ว {usageCount} ครั้ง
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ปุ่มลัดความดี</span>
                <span className="text-xs text-purple-600 font-bold">พร้อมใช้งาน ✓</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              {editingId ? 'แก้ไขเกณฑ์พฤติกรรม' : 'เพิ่มเกณฑ์พฤติกรรมใหม่'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              ตั้งชื่อพฤติกรรม จำนวนดาวที่ได้รับ และไอคอนแสดงผล
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  ชื่อเกณฑ์ / พฤติกรรม *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น กล้าแสดงออก, มีน้ำใจ, ส่งงานตรงเวลา"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    จำนวนดาวเริ่มต้น
                  </label>
                  <select
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  >
                    <option value={0.5}>+0.5 ดาว</option>
                    <option value={1}>+1.0 ดาว</option>
                    <option value={1.5}>+1.5 ดาว</option>
                    <option value={2}>+2.0 ดาว</option>
                    <option value={3}>+3.0 ดาว</option>
                    <option value={5}>+5.0 ดาว</option>
                    <option value={-1}>-1.0 ดาว (หักคะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    เลือกไอคอน
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      maxLength={4}
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-bold"
                    />
                    <div className="flex items-center space-x-1 overflow-x-auto py-1">
                      {ICON_PRESETS.slice(0, 5).map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setIcon(ic)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-sm cursor-pointer"
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  เลือกโทนสี
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                        selectedColorIndex === idx
                          ? 'border-purple-600 ring-2 ring-purple-300 ' + preset.bgLight
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเกณฑ์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
