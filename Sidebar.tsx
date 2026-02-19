import React from 'react';
import { LayoutDashboard, Users, GitBranch, Settings } from 'lucide-react';

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
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col p-4 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="bg-red-700 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-2xl font-serif">
          HÀ
        </div>
        <div>
          <h1 className="text-sm font-bold text-stone-800">Gia Phả Dòng Họ</h1>
          <p className="text-xs text-stone-500">Hệ thống Quản trị</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeView === item.id
                ? 'bg-red-50 text-red-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="border-t border-stone-200 pt-4 space-y-2">
           <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-stone-600 hover:bg-stone-100">
               <Settings size={20}/>
               Cài đặt
           </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;