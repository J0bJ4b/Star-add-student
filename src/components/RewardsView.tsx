import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { Reward, Student } from '../types';
import { 
  Gift, 
  Plus, 
  Star, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  X,
  Package,
  Award
} from 'lucide-react';

export const RewardsView: React.FC = () => {
  const {
    rewards,
    students,
    activeClassroom,
    addReward,
    editReward,
    deleteReward,
    claimReward,
  } = useStudents();

  // Active student selector for claiming
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [claimStatusMessage, setClaimStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isAddRewardModalOpen, setIsAddRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // New Reward Form
  const [newRewardName, setNewRewardName] = useState('');
  const [newRequiredStars, setNewRequiredStars] = useState('10');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');
  const [newStock, setNewStock] = useState('10');

  // Filter students by active classroom
  const filteredStudents = activeClassroom === 'all'
    ? students
    : students.filter((s) => s.classroom === activeClassroom);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || filteredStudents[0];

  const handleClaim = (reward: Reward) => {
    if (!currentStudent) return;
    const result = claimReward(currentStudent.id, reward.id);
    if (result.success) {
      setClaimStatusMessage({ type: 'success', text: result.message });
    } else {
      setClaimStatusMessage({ type: 'error', text: result.message });
    }

    setTimeout(() => {
      setClaimStatusMessage(null);
    }, 4000);
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;
    addReward({
      name: newRewardName.trim(),
      requiredStars: parseFloat(newRequiredStars) || 5,
      description: newDescription.trim(),
      icon: newIcon || '🎁',
      stock: parseInt(newStock) || 99,
    });
    setNewRewardName('');
    setNewDescription('');
    setIsAddRewardModalOpen(false);
  };

  const handleSaveEditReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    editReward(editingReward.id, {
      name: editingReward.name,
      requiredStars: editingReward.requiredStars,
      description: editingReward.description,
      icon: editingReward.icon,
      stock: editingReward.stock,
    });
    setEditingReward(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-pink-50 text-pink-600">
              <Gift className="w-6 h-6" />
            </span>
            <span>ระบบแลกของรางวัล (Rewards)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตั้งเป้าหมายคะแนนดาว ตรวจสอบความก้าวหน้านักเรียน และแลกของรางวัลสร้างแรงจูงใจ
          </p>
        </div>

        <button
          id="btn-open-add-reward-modal"
          onClick={() => setIsAddRewardModalOpen(true)}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-500/25 flex items-center space-x-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มของรางวัลใหม่</span>
        </button>
      </div>

      {/* Claim Status Alert */}
      {claimStatusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-all ${
            claimStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {claimStatusMessage.type === 'success' ? (
            <Sparkles className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{claimStatusMessage.text}</span>
        </div>
      )}

      {/* Student Selector Card for Redemption */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-purple-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider block">
              จุดแลกของรางวัล (Redemption Desk)
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
              เลือกนักเรียนที่ต้องการแลกของรางวัล
            </h3>
          </div>

          {/* Student Picker Dropdown */}
          <div className="w-full sm:w-72">
            <select
              id="select-claim-student"
              value={currentStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer backdrop-blur-md"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900">
                  {s.avatar} {s.name} ({s.classroom}) — {s.stars} ⭐
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Student Active Card & Balances */}
        {currentStudent && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="text-4xl p-2 bg-white/10 rounded-2xl">
                {currentStudent.avatar}
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">
                  {currentStudent.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-purple-200">
                  <span>ห้อง {currentStudent.classroom}</span>
                  <span>•</span>
                  <span>แลกของขวัญไปแล้ว {currentStudent.claimedRewards?.length || 0} ชิ้น</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="px-4 py-2 rounded-2xl bg-amber-400 text-purple-950 font-black text-xl font-heading flex items-center space-x-2 shadow-lg shadow-amber-400/20">
                <Star className="w-5 h-5 fill-purple-950 text-purple-950" />
                <span>{currentStudent.stars}</span>
                <span className="text-xs font-bold">ดาวคงเหลือ</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rewards Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span>รายการของรางวัลทั้งหมด ({rewards.length} ชิ้น)</span>
          </h3>
          <span className="text-xs text-slate-400">
            {currentStudent ? `เทียบกับคะแนนของ ${currentStudent.name.split(' ')[0]}` : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards.map((reward) => {
            const studentStars = currentStudent?.stars || 0;
            const isAffordable = studentStars >= reward.requiredStars;
            const progressPercent = Math.min(100, Math.round((studentStars / reward.requiredStars) * 100));
            const isOutOfStock = reward.stock !== undefined && reward.stock <= 0;

            return (
              <div
                key={reward.id}
                id={`reward-card-${reward.id}`}
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                  isAffordable && !isOutOfStock
                    ? 'border-purple-200 hover:border-purple-400 hover:shadow-lg ring-1 ring-purple-100'
                    : 'border-slate-100 opacity-90'
                }`}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div className="text-3xl p-3 bg-pink-50 rounded-2xl border border-pink-100">
                      {reward.icon || '🎁'}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingReward(reward)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg"
                        title="แก้ไขรางวัล"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                        title="ลบรางวัล"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h4 className="text-base font-bold text-slate-900 font-heading">
                      {reward.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                      {reward.description || 'ของรางวัลสร้างแรงบันดาลใจ'}
                    </p>
                  </div>

                  {/* Stock & Target */}
                  <div className="mt-3 flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                    <span className="font-semibold text-purple-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>ต้องการ {reward.requiredStars} ดาว</span>
                    </span>
                    <span className={`text-[11px] font-medium ${
                      isOutOfStock ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ: ${reward.stock ?? 'ไม่จำกัด'} ชิ้น`}
                    </span>
                  </div>

                  {/* Progress Bar for Current Student */}
                  {currentStudent && (
                    <div className="my-3.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">ความก้าวหน้า:</span>
                        <span className="font-bold text-purple-700">
                          {studentStars} / {reward.requiredStars} ดาว ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAffordable ? 'bg-emerald-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Claim Button */}
                <div className="mt-2 pt-2">
                  <button
                    id={`btn-claim-reward-${reward.id}`}
                    disabled={!isAffordable || isOutOfStock || !currentStudent}
                    onClick={() => handleClaim(reward)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-heading flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      isAffordable && !isOutOfStock
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 active:scale-98'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>
                      {isOutOfStock
                        ? 'ของรางวัลหมดแล้ว'
                        : isAffordable
                        ? `กดแลกรางวัลนี้ (หัก ${reward.requiredStars} ดาว)`
                        : `ยังขาดอีก ${(reward.requiredStars - studentStars).toFixed(1)} ดาว`}
                    </span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Claimed Rewards Log for Active Student */}
      {currentStudent && currentStudent.claimedRewards && currentStudent.claimedRewards.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>ประวัติการแลกรางวัลของ {currentStudent.name}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentStudent.claimedRewards.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-purple-900 block">{item.rewardName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span className="font-bold text-rose-600 bg-white px-2 py-1 rounded-lg border border-purple-100">
                  -{item.requiredStars} ดาว
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Reward */}
      {isAddRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-600" />
                <span>เพิ่มของรางวัลใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddRewardModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่อของรางวัล:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สติกเกอร์การ์ตูน, ปากกาด้ามโปรด, สมุดโน้ต"
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ดาวที่ต้องใช้ (เป้าหมาย):
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newRequiredStars}
                    onChange={(e) => setNewRequiredStars(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    จำนวนสต็อก (ชิ้น):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ไอคอนประจำรางวัล (Emoji):
                </label>
                <div className="flex gap-2">
                  {['🎁', '🎨', '✏️', '🍬', '🎟️', '👑', '🧸', '📚', '🍦', '🎮'].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewIcon(emoji)}
                      className={`text-xl p-2 rounded-xl transition-all ${
                        newIcon === emoji ? 'bg-pink-100 ring-2 ring-pink-400' : 'hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  คำอธิบายของรางวัล:
                </label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียดของรางวัล เช่น ลายการ์ตูน ขนาด หรือเงื่อนไข..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddRewardModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  บันทึกรางวัล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Reward */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-pink-600" />
                <span>แก้ไขของรางวัล</span>
              </h3>
              <button
                onClick={() => setEditingReward(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReward} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่อของรางวัล:
                </label>
                <input
                  type="text"
                  required
                  value={editingReward.name}
                  onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ดาวที่ต้องใช้:
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={editingReward.requiredStars}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, requiredStars: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    จำนวนสต็อก (ชิ้น):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingReward.stock ?? 99}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  คำอธิบาย:
                </label>
                <textarea
                  rows={2}
                  value={editingReward.description}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
