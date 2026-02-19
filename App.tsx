
import React, { useState, useEffect } from 'react';
import { FamilyMember, FamilyData } from './types.ts';
import { INITIAL_DATA } from './constants.tsx';
import TreeVisualization from './components/TreeVisualization.tsx';
import MemberManagement from './components/AdminPanel.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import { X, Skull, Users, Heart, Calendar, Trash2, MapPin, Info, Edit3 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<FamilyData>(() => {
    const saved = localStorage.getItem('family_data_ha');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);

  useEffect(() => {
    localStorage.setItem('family_data_ha', JSON.stringify(data));
  }, [data]);

  const isHaMember = (member: FamilyMember) => member.name.trim().startsWith('Hà ');

  const handleAddMember = (newMember: Omit<FamilyMember, 'id'>) => {
    const id = crypto.randomUUID();
    let members = [...data.members, { ...newMember, id }];
    if (newMember.spouseId) {
      members = members.map(m => m.id === newMember.spouseId ? { ...m, spouseId: id } : m);
    }
    setData(prev => ({ members, lastUpdated: new Date().toISOString() }));
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setData(prev => {
      let newMembers = [...prev.members];
      const oldMember = prev.members.find(m => m.id === updated.id);
      if (oldMember?.spouseId !== updated.spouseId) {
        if (oldMember?.spouseId) newMembers = newMembers.map(m => m.id === oldMember.spouseId ? { ...m, spouseId: undefined } : m);
        if (updated.spouseId) newMembers = newMembers.map(m => m.id === updated.spouseId ? { ...m, spouseId: updated.id } : m);
      }
      newMembers = newMembers.map(m => m.id === updated.id ? updated : m);
      return { members: newMembers, lastUpdated: new Date().toISOString() };
    });
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Xóa thành viên này?')) {
      setData(prev => {
        const newMembers = prev.members.filter(m => m.id !== id).map(m => ({
          ...m,
          fatherId: m.fatherId === id ? undefined : m.fatherId,
          motherId: m.motherId === id ? undefined : m.motherId,
          spouseId: m.spouseId === id ? undefined : m.spouseId,
        }));
        return { members: newMembers, lastUpdated: new Date().toISOString() };
      });
    }
  };

  const getChildren = (parentId: string) => data.members.filter(m => m.fatherId === parentId || m.motherId === parentId);

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-8 overflow-auto">
        {activeView === 'dashboard' && <Dashboard members={data.members} onAddNew={() => setActiveView('management')} onViewTree={() => setActiveView('tree')} />}
        {activeView === 'tree' && (
          <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-stone-800 mb-6">Sơ đồ Huyết thống</h2>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative min-h-[500px]">
              <TreeVisualization data={data.members} onMemberClick={setSelectedMember} />
            </div>
          </div>
        )}
        {activeView === 'management' && (
          <MemberManagement 
            members={data.members} 
            onAdd={handleAddMember} 
            onUpdate={handleUpdateMember} 
            onDelete={handleDeleteMember} 
            onBackup={() => {}} 
            onRestore={() => {}} 
            onSelectMember={setSelectedMember}
            initialMemberToEdit={memberToEdit}
            onFormOpened={() => setMemberToEdit(null)}
          />
        )}
      </main>

      {selectedMember && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition z-30"><X size={20} /></button>
            <div className={`h-40 relative ${isHaMember(selectedMember) ? 'bg-gradient-to-br from-red-700 to-red-900' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}></div>
            <div className="px-12 pb-12">
              <div className="flex items-end gap-8 -mt-20 relative z-10">
                <img src={selectedMember.photoUrl || `https://i.pravatar.cc/300?u=${selectedMember.id}`} className="w-44 h-44 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl bg-white"/>
                <div className="mb-4">
                  <h3 className="text-4xl font-black text-stone-800 tracking-tight">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-3">
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isHaMember(selectedMember) ? 'bg-red-700 text-white' : 'bg-blue-600 text-white'}`}>
                        {isHaMember(selectedMember) ? 'Huyết thống Họ Hà' : 'Ngoại tộc'}
                     </span>
                  </div>
                </div>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                <div className="space-y-4">
                  <div className="bg-stone-50 p-6 rounded-2xl">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">Ngày sinh</p>
                    <p className="font-bold text-stone-800">{selectedMember.birthDate || selectedMember.birthYear || 'Chưa rõ'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <button onClick={() => setSelectedMember(null)} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold">Đóng</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
