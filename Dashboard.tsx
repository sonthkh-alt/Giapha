import React from 'react';
import { FamilyMember } from './types';
import { Users, User, GitMerge, Clock, Plus, GitBranch } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onAddNew: () => void;
  onViewTree: () => void;
}

const Dashboard: React.FC<Props> = ({ members, onAddNew, onViewTree }) => {

  const isHaMember = (name: string) => name.startsWith('Hà ');
  
  const totalMembers = members.length;
  const haMembersCount = members.filter(m => isHaMember(m.name)).length;
  const nonHaMembersCount = totalMembers - haMembersCount;
  const livingMembersCount = members.filter(m => !m.isDeceased).length;
  
  // Sơ bộ tính toán số thế hệ, giả định người không có cha mẹ là thế hệ 1
  const getGenerations = () => {
    const memberMap = new Map(members.map(m => [m.id, m]));
    let maxDepth = 0;
    
    members.forEach(member => {
        let current = member;
        let depth = 1;
        while(current.fatherId && memberMap.has(current.fatherId)){
            depth++;
            current = memberMap.get(current.fatherId)!;
        }
        if(depth > maxDepth) maxDepth = depth;
    });
    return maxDepth;
  }
  
  const generations = getGenerations();

  return (
    <div className="space-y-8">
       <div>
         <h2 className="text-3xl font-bold text-stone-800">Chào mừng đến với Gia phả họ Hà</h2>
         <p className="text-sm text-stone-500 mt-1">Đây là bảng điều khiển trung tâm để quản lý phả hệ của dòng họ.</p>
       </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Tổng thành viên" value={totalMembers} color="indigo" />
        <StatCard icon={User} title="Huyết thống (Họ Hà)" value={haMembersCount} color="red" />
        <StatCard icon={User} title="Ngoại tộc" value={nonHaMembersCount} color="blue" />
        <StatCard icon={GitMerge} title="Số thế hệ" value={generations} color="amber" />
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Lối tắt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button onClick={onAddNew} className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-red-50 border border-stone-200 rounded-lg transition group">
                   <div className="bg-red-100 text-red-700 p-3 rounded-md">
                      <Plus size={24} />
                   </div>
                   <div>
                       <p className="font-bold text-stone-700 group-hover:text-red-800">Thêm Thành viên Mới</p>
                       <p className="text-xs text-stone-500">Mở rộng và cập nhật cây gia phả.</p>
                   </div>
               </button>
                <button onClick={onViewTree} className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-blue-50 border border-stone-200 rounded-lg transition group">
                   <div className="bg-blue-100 text-blue-700 p-3 rounded-md">
                      <GitBranch size={24} />
                   </div>
                   <div>
                       <p className="font-bold text-stone-700 group-hover:text-blue-800">Xem Cây Gia Phả</p>
                       <p className="text-xs text-stone-500">Khám phá sơ đồ huyết thống trực quan.</p>
                   </div>
               </button>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Thành viên mới nhất</h3>
            <div className="space-y-3">
              {[...members].slice(-3).reverse().map(m => (
                 <div key={m.id} className="flex items-center gap-3">
                    <img src={m.photoUrl || `https://i.pravatar.cc/32?u=${m.id}`} className="w-8 h-8 rounded-full object-cover"/>
                    <div>
                      <p className="text-sm font-semibold text-stone-700">{m.name}</p>
                      <p className="text-xs text-stone-400">{isHaMember(m.name) ? "Họ Hà" : "Ngoại tộc"}</p>
                    </div>
                 </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }: {icon: React.ElementType, title: string, value: number, color: string}) => {
  const colors: {[key: string]: string} = {
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  }
  return (
    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-5">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}


export default Dashboard;