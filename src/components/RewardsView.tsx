import React from 'react';
import { useStudents } from '../context/StudentContext';
import { Gift, Star } from 'lucide-react';

export const RewardsView: React.FC = () => {
  const { rewards } = useStudents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
          <Gift className="w-6 h-6 text-purple-500" />
          <span>ร้านของรางวัล</span>
        </h2>
        <p className="text-slate-500">จัดการและดูรายการของรางวัลสำหรับใช้ดาวแลก</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-4xl mb-4">
              {reward.icon || '🎁'}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{reward.name}</h3>
            <p className="text-xs text-slate-500 mb-4 h-8 overflow-hidden">{reward.description}</p>
            
            <div className="mt-auto w-full">
              <div className="flex items-center justify-center space-x-1.5 bg-orange-50 py-2 rounded-xl text-orange-600 font-black border border-orange-100">
                <Star className="w-4 h-4 fill-orange-500" />
                <span>ใช้ {reward.requiredStars} ดาว</span>
              </div>
            </div>
          </div>
        ))}
        {rewards.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-100">
            ยังไม่มีของรางวัลในระบบ
          </div>
        )}
      </div>
    </div>
  );
};
