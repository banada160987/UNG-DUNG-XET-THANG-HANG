import React from 'react';
import { Circle, CheckCircle, AlertCircle, Clock, Search, XCircle, Trophy, FileText } from 'lucide-react';

export const STATUS_CONFIG = {
  'draft': { label: 'Nháp', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  'submitted_to_head': { label: 'Đã gửi Tổ trưởng', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: FileText },
  'head_rejected': { label: 'Yêu cầu bổ sung', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle },
  'resubmitted': { label: 'Giáo viên đã bổ sung', color: 'bg-orange-200 text-orange-900 border-orange-400', icon: FileText },
  'head_approved': { label: 'Tổ trưởng xác nhận', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
  'admin_reviewing': { label: 'Tổ rà soát đang kiểm tra', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Search },
  'admin_approved': { label: 'Đủ điều kiện', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle },
  'admin_rejected': { label: 'Không đủ điều kiện', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle },
  'ranked': { label: 'Đã xếp thứ tự ưu tiên', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Trophy },
  'finalized': { label: 'Đã đưa vào danh sách trình', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: FileText },
  'eligible': { label: 'Hợp lệ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  'ineligible': { label: 'Chưa hợp lệ', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle }
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: 'Không rõ', color: 'bg-gray-100 text-gray-800', icon: Circle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};
