import React from 'react';
import { checkEligibility } from '../utils/validation';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export const Dashboard = ({ candidates }) => {
  const total = candidates.length;
  
  const stats = candidates.reduce((acc, curr) => {
    const { isValid } = checkEligibility(curr);
    if (isValid) acc.valid += 1;
    else acc.invalid += 1;
    return acc;
  }, { valid: 0, invalid: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Tổng số hồ sơ" 
          value={total} 
          icon={<Users className="text-blue-500" size={24} />} 
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Đủ điều kiện" 
          value={stats.valid} 
          icon={<CheckCircle className="text-emerald-500" size={24} />} 
          bgColor="bg-emerald-50"
        />
        <StatCard 
          title="Thiếu điều kiện" 
          value={stats.invalid} 
          icon={<XCircle className="text-rose-500" size={24} />} 
          bgColor="bg-rose-50"
        />
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Hướng dẫn sử dụng</h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Chuyển sang tab <strong>Danh sách Ứng viên</strong> để xem chi tiết và xếp hạng.</li>
          <li>Bạn có thể thêm hồ sơ mới ở tab <strong>Thêm Hồ sơ</strong>.</li>
          <li>Thuật toán xếp hạng sẽ tự động tính toán dựa trên thành tích và các tiêu chí ưu tiên theo quy định.</li>
          <li>Danh sách có thể được xuất ra Excel hoặc PDF để nộp báo cáo.</li>
        </ul>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-full ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);
