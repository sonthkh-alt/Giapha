
import React, { useState, useEffect } from 'react';
import { FamilyMember, FamilyData, SystemSettings } from './types.ts';
import { INITIAL_DATA } from './constants.tsx';
import TreeVisualization from './components/TreeVisualization.tsx';
import MemberManagement from './components/AdminPanel.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import SettingsView from './components/Settings.tsx';
import { X, Skull, Users, Heart, Calendar, Trash2, MapPin, Info, Edit3 } from 'lucide-react';

const DEFAULT_SETTINGS: SystemSettings = {
  version: "1.1.0-stable",
  email: "support@hoha.vn",
  hotline: "09xx-xxx-xxx",
  website: "www.hoha.vn",
  securityTerms: "Dữ liệu gia phả được lưu trữ cục bộ trên trình duyệt của bạn (LocalStorage). Để đảm bảo an toàn, vui lòng thường xuyên sử dụng chức năng Xuất file JSON trong mục Quản lý Thành viên để sao lưu dữ liệu."
};

const App: React.FC = () => {
  const [data, setData] = useState<FamilyData>(() => {
    const saved = localStorage.getItem('family_data_ha');
    let initialData: FamilyData;
    
    if (saved) {
      initialData = JSON.parse(saved);
    } else {
      initialData = { ...INITIAL_DATA };
    }

    // Đảm bảo tất cả thành viên đều có trạng thái (mặc định là approved cho dữ liệu cũ)
    initialData.members = initialData.members.map(m => ({
      ...m,
      status: m.status || 'approved'
    }));

    // Đảm bảo có settings
    if (!initialData.settings) {
      initialData.settings = DEFAULT_SETTINGS;
    }

    return initialData;
  });

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('ho_ha_admin') === 'true');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);

  useEffect(() => {
    localStorage.setItem('family_data_ha', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('ho_ha_admin', isAdmin.toString());
  }, [isAdmin]);

  const isHaMember = (member: FamilyMember) => member.name.trim().startsWith('Hà ');

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setData(prev => ({ ...prev, settings: newSettings, lastUpdated: new Date().toISOString() }));
  };

  const handleAddMember = (newMember: Omit<FamilyMember, 'id'>) => {
    const id = crypto.randomUUID();
    const status = isAdmin ? 'approved' : 'pending';
    let members = [...data.members, { ...newMember, id, status }];
    if (newMember.spouseId && status === 'approved') {
      members = members.map(m => m.id === newMember.spouseId ? { ...m, spouseId: id } : m);
    }
    setData(prev => ({ members, lastUpdated: new Date().toISOString() }));
    if (!isAdmin) alert('Thông tin đã được gửi. Vui lòng chờ Admin duyệt.');
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    if (!isAdmin) {
      alert('Bạn không có quyền chỉnh sửa trực tiếp. Vui lòng liên hệ Admin.');
      return;
    }
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

  const handleApproveMember = (id: string) => {
    setData(prev => {
      const members = prev.members.map(m => {
        if (m.id === id) {
          return { ...m, status: 'approved' as const };
        }
        return m;
      });
      
      // Sau khi duyệt, cập nhật quan hệ spouse nếu có
      const approvedMember = members.find(m => m.id === id);
      if (approvedMember?.spouseId) {
        return {
          members: members.map(m => m.id === approvedMember.spouseId ? { ...m, spouseId: id } : m),
          lastUpdated: new Date().toISOString()
        };
      }
      
      return { members, lastUpdated: new Date().toISOString() };
    });
  };

  const handleDeleteMember = (id: string) => {
    if (!isAdmin) {
      alert('Chỉ Admin mới có quyền xóa thành viên.');
      return;
    }
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

  const handleBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gia_pha_ho_ha_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.members && Array.isArray(json.members)) {
          setData(json);
          alert('Khôi phục dữ liệu thành công!');
        } else {
          alert('File không đúng định dạng gia phả!');
        }
      } catch (err) {
        alert('Lỗi khi đọc file JSON!');
      }
    };
    reader.readAsText(file);
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
            onBackup={handleBackup} 
            onRestore={handleRestore} 
            onSelectMember={setSelectedMember}
            initialMemberToEdit={memberToEdit}
            onFormOpened={() => setMemberToEdit(null)}
            isAdmin={isAdmin}
            onApprove={handleApproveMember}
          />
        )}
        {activeView === 'settings' && (
          <SettingsView 
            isAdmin={isAdmin} 
            setIsAdmin={setIsAdmin} 
            settings={data.settings || DEFAULT_SETTINGS} 
            onUpdateSettings={handleUpdateSettings} 
          />
        )}
      </main>

      {selectedMember && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition z-30"><X size={20} /></button>
            
            <div className={`h-48 shrink-0 relative ${isHaMember(selectedMember) ? 'bg-gradient-to-br from-red-700 to-red-900' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            <div className="px-12 pb-12 overflow-y-auto custom-scrollbar">
              <div className="flex items-end gap-8 -mt-24 relative z-10">
                <img src={selectedMember.photoUrl || `https://i.pravatar.cc/300?u=${selectedMember.id}`} className="w-48 h-48 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl bg-white"/>
                <div className="mb-4">
                  <h3 className="text-5xl font-black text-stone-800 tracking-tight leading-tight">{selectedMember.name}</h3>
                  <div className="flex items-center gap-3 mt-4">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isHaMember(selectedMember) ? 'bg-red-700 text-white' : 'bg-blue-600 text-white'}`}>
                        {isHaMember(selectedMember) ? 'Huyết thống Họ Hà' : 'Ngoại tộc'}
                     </span>
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedMember.isDeceased ? 'bg-stone-800 text-white' : 'bg-emerald-600 text-white'}`}>
                        {selectedMember.isDeceased ? 'Đã quá vãng' : 'Đang tại thế'}
                     </span>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Thông tin cá nhân */}
                <div className="md:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} /> Ngày sinh</p>
                      <p className="font-black text-stone-800 text-lg">{selectedMember.birthDate || selectedMember.birthYear || 'Chưa rõ'}</p>
                    </div>
                    {selectedMember.isDeceased && (
                      <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Skull size={12} /> Năm mất</p>
                        <p className="font-black text-stone-800 text-lg">{selectedMember.deathYear || 'Chưa rõ'}</p>
                      </div>
                    )}
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 col-span-2">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={12} /> Quê quán</p>
                      <p className="font-black text-stone-800 text-lg">{selectedMember.hometown || 'Chưa rõ'}</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14} /> Tiểu sử & Ghi chú</p>
                    <p className="text-stone-600 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedMember.bio || 'Chưa có thông tin tiểu sử chi tiết cho thành viên này.'}
                    </p>
                  </div>
                </div>

                {/* Quan hệ gia đình */}
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-3">Quan hệ trực hệ</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Cha</p>
                          <p className="font-black text-stone-800">{data.members.find(m => m.id === selectedMember.fatherId)?.name || 'Chưa rõ'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Mẹ</p>
                          <p className="font-black text-stone-800">{data.members.find(m => m.id === selectedMember.motherId)?.name || 'Chưa rõ'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Vợ / Chồng</p>
                          <p className="font-black text-red-700">{data.members.find(m => m.id === selectedMember.spouseId)?.name || 'Chưa có'}</p>
                        </div>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-3 mb-4">Con cái</h4>
                      <div className="space-y-2">
                        {getChildren(selectedMember.id).length > 0 ? (
                          getChildren(selectedMember.id).map(child => (
                            <div key={child.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedMember(child)}>
                              <div className={`w-2 h-2 rounded-full ${child.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                              <span className="text-sm font-bold text-stone-700">{child.name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 italic">Chưa có thông tin con cái</p>
                        )}
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-stone-100 flex justify-end">
                <button onClick={() => setSelectedMember(null)} className="bg-stone-900 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 transition shadow-xl shadow-stone-900/20 active:scale-95">Đóng cửa sổ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
