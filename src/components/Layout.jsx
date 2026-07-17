import React, { useState } from 'react';
import { Home, List, Settings, GraduationCap, LogOut, Users, Clock, HelpCircle } from 'lucide-react';
import { UserGuideModal } from './UserGuideModal';

export const Layout = ({ children, currentPage, setCurrentPage, onLogout }) => {
  const [showGuide, setShowGuide] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col shadow-xl flex-shrink-0 z-20">
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-base sm:text-lg leading-tight whitespace-nowrap">Xét thăng hạng viên chức</h1>
            <p className="text-xs text-slate-400" title="Trường THPT Cao Bá Quát - Phường Tân An - Tỉnh Đắk Lắk">THPT Cao Bá Quát</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<Home size={20} />} 
            label="Rà soát & Thống kê" 
            active={currentPage === 'dashboard'} 
            onClick={() => setCurrentPage('dashboard')} 
          />
          <NavItem 
            icon={<List size={20} />} 
            label="Tính & Xuất Xếp hạng" 
            active={currentPage === 'list'} 
            onClick={() => setCurrentPage('list')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Quản lý Thư ký" 
            active={currentPage === 'secretaries'} 
            onClick={() => setCurrentPage('secretaries')} 
          />
          <NavItem 
            icon={<Clock size={20} />} 
            label="Nhật ký Hệ thống" 
            active={currentPage === 'history'} 
            onClick={() => setCurrentPage('history')} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Cấu hình Đợt & Tổ" 
            active={currentPage === 'settings'} 
            onClick={() => setCurrentPage('settings')} 
          />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg text-sm transition-colors text-slate-400"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto bg-slate-100">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            {currentPage === 'dashboard' && 'Dashboard Rà soát'}
            {currentPage === 'list' && 'Bảng Xếp hạng Ưu tiên'}
            {currentPage === 'secretaries' && 'Quản lý Thư ký Rà soát'}
            {currentPage === 'history' && 'Nhật ký Hoạt động Hệ thống'}
            {currentPage === 'settings' && 'Cài đặt Hệ thống'}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 shadow-sm font-medium border border-blue-200"
              title="Hướng dẫn sử dụng"
            >
              <HelpCircle size={16} />
              Hướng dẫn
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Máy chủ đang kết nối
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {showGuide && (
        <UserGuideModal role="admin" onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
        : 'hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);
