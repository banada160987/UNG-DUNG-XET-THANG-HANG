import React from 'react';
import { Home, Users, FilePlus, Settings } from 'lucide-react';

export const Layout = ({ children, currentPage, setCurrentPage }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Quản lý Thăng hạng
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<Home size={20} />} 
            label="Tổng quan" 
            active={currentPage === 'dashboard'} 
            onClick={() => setCurrentPage('dashboard')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Danh sách Ứng viên" 
            active={currentPage === 'list'} 
            onClick={() => setCurrentPage('list')}
          />
          <NavItem 
            icon={<FilePlus size={20} />} 
            label="Thêm Hồ sơ" 
            active={currentPage === 'add'} 
            onClick={() => setCurrentPage('add')}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentPage === 'dashboard' && 'Tổng quan'}
            {currentPage === 'list' && 'Danh sách Ứng viên Xét thăng hạng'}
            {currentPage === 'add' && 'Thêm/Sửa Hồ sơ'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
        active 
          ? 'bg-blue-50 text-blue-700 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  );
};
