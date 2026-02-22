
import React from 'react';
import { LayoutDashboard, Users, GitBranch, Settings, Info } from 'lucide-react';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<Props> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'tree', label: 'Cây Gia Phả', icon: GitBranch },
    { id: 'management', label: 'Quản lý Thành viên', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col p-4 shadow-sm z-50">
      <div className="flex items-center gap-3 px-4 py-4 mb-8">
        <div className="bg-red-700 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-2xl font-serif shadow-lg shadow-red-700/20">
          HÀ
        </div>
        <div>
          <h1 className="text-sm font-black text-stone-800 tracking-tight">GIA PHẢ HỌ HÀ</h1>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Quản trị Hệ thống</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeView === item.id
                ? 'bg-red-700 text-white shadow-lg shadow-red-700/20 translate-x-1'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-stone-100 pt-4 space-y-1">
        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeView === 'settings'
              ? 'bg-stone-800 text-white'
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
          }`}
        >
          <Settings size={18} />
          <span>Setting</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
