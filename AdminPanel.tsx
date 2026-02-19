import React, { useState, useRef } from 'react';
import { FamilyMember, Gender } from './types';
import { Plus, Trash2, Edit3, Download, Upload, X, Search, User, Link2, Camera } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onAdd: (member: Omit<FamilyMember, 'id'>) => void;
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onSelectMember: (member: FamilyMember) => void;
}

const MemberManagement: React.FC<Props> = ({ members, onAdd, onUpdate, onDelete, onBackup, onRestore, onSelectMember }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const originalSpouseId = useRef<string | undefined>(undefined);
  
  const initialFormState: Partial<FamilyMember> = {
    name: '',
    hometown: '',
    gender: 'Male',
    isDeceased: false,
    birthDate: '',
    deathYear: '',
    photoUrl: '',
    bio: ''
  };
  
  const [formData, setFormData] = useState<Partial<FamilyMember>>(initialFormState);

  const isHaMember = (name: string) => name.trim().startsWith('Hà ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-populate birthYear from birthDate
    const finalData = { ...formData };
    if (finalData.birthDate) {
      finalData.birthYear = finalData.birthDate.split('-')[0];
    }
    
    if (editingId) {
      onUpdate(finalData as FamilyMember);
      
      // Sync spouse relationship
      if (finalData.spouseId && finalData.spouseId !== originalSpouseId.current) {
        const newSpouse = members.find(m => m.id === finalData.spouseId);
        if (newSpouse && newSpouse.spouseId !== editingId) {
          onUpdate({ ...newSpouse, spouseId: editingId });
        }
      }
      if (originalSpouseId.current && originalSpouseId.current !== finalData.spouseId) {
        const oldSpouse = members.find(m => m.id === originalSpouseId.current);
        if (oldSpouse && oldSpouse.spouseId === editingId) {
           onUpdate({ ...oldSpouse, spouseId: undefined });
        }
      }
      setEditingId(null);
    } else {
      onAdd(finalData as Omit<FamilyMember, 'id'>);
    }
    
    setIsAdding(false);
    setFormData(initialFormState);
  };

  const startEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setFormData(member);
    originalSpouseId.current = member.spouseId;
    setIsAdding(true);
  };
  
  const startAdd = () => {
    setIsAdding(true); 
    setEditingId(null); 
    setFormData(initialFormState);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm("Khôi phục dữ liệu sẽ ghi đè toàn bộ thông tin hiện tại. Bạn chắc chắn?")) {
        onRestore(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({...formData, photoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMembers = members.sort((a,b) => a.name.localeCompare(b.name)).filter(m => 
    m.name.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-stone-800">Quản lý Thành viên</h2>
           <p className="text-sm text-stone-500 mt-1">Hiện có {members.length} thành viên trong cơ sở dữ liệu.</p>
        </div>
        <button onClick={startAdd}
          className="bg-red-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-800 transition shadow-lg shadow-red-700/20 font-semibold text-sm whitespace-nowrap">
          <Plus size={18} /> Thêm Thành Viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-stone-50/70 border-b border-stone-200">
           <div className="relative w-full md:max-w-xs">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
             <input type="text" placeholder="Tìm kiếm thành viên..." className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/50"
              value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
           </div>
           <div className="flex gap-2">
             <button onClick={onBackup} className="bg-white text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-100 transition border border-stone-300 text-sm font-medium">
               <Download size={16} /> Sao lưu
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="bg-white text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-100 transition border border-stone-300 text-sm font-medium">
               <Upload size={16} /> Khôi phục
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase tracking-wider border-b border-stone-200">
                <th className="px-6 py-3">Họ và Tên</th>
                <th className="px-6 py-3">Phân Loại</th>
                <th className="px-6 py-3">Trạng Thái</th>
                <th className="px-6 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={m.photoUrl || `https://i.pravatar.cc/40?u=${m.id}`} className="w-10 h-10 rounded-full object-cover shadow-sm"/>
                        <div>
                          <div className="font-bold text-stone-800 text-sm">{m.name}</div>
                          <div className="text-xs text-stone-500">{m.birthDate ? new Date(m.birthDate).toLocaleDateString('vi-VN') : (m.birthYear || 'N/A')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${isHaMember(m.name) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {isHaMember(m.name) ? 'Họ Hà' : 'Ngoại Tộc'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${m.isDeceased ? 'bg-stone-100 text-stone-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${m.isDeceased ? 'bg-stone-400' : 'bg-emerald-500'}`}></span>
                        {m.isDeceased ? `Mất ${m.deathYear || ''}`.trim() : 'Còn sống'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onSelectMember(m)} className="p-2 text-stone-500 hover:bg-stone-200/70 hover:text-stone-800 rounded-md transition" title="Xem chi tiết"><User size={16}/></button>
                        <button onClick={() => startEdit(m)} className="p-2 text-stone-500 hover:bg-stone-200/70 hover:text-stone-800 rounded-md transition" title="Chỉnh sửa"><Edit3 size={16}/></button>
                        <button onClick={() => onDelete(m.id)} className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-md transition" title="Xóa"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl relative animate-in zoom-in-95 duration-300 my-auto">
            <button onClick={() => setIsAdding(false)} className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100"><X size={20} /></button>
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-red-50 p-3 rounded-lg text-red-700"><Link2 size={20} /></div>
               <h3 className="text-xl font-bold text-stone-800">{editingId ? 'Cập nhật Thông tin' : 'Thêm Thành viên Mới'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div className="col-span-3 sm:col-span-1 flex flex-col items-center gap-4">
                <img src={formData.photoUrl || `https://i.pravatar.cc/120?u=${formData.id || 'new'}`} className="w-32 h-32 rounded-full object-cover shadow-md bg-stone-100"/>
                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden"/>
                <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full text-sm font-semibold bg-stone-100 text-stone-700 py-2 rounded-lg hover:bg-stone-200 transition flex items-center justify-center gap-2">
                  <Camera size={16} />
                  Tải ảnh lên
                </button>
              </div>
              <div className="col-span-3 sm:col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Họ và Tên</label>
                  <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Ngày Sinh</label>
                  <input type="date" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Giới tính</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none">
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Trạng thái</label>
                  <select value={formData.isDeceased ? 'true' : 'false'} onChange={e => setFormData({...formData, isDeceased: e.target.value === 'true'})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none">
                    <option value="false">Còn sống</option>
                    <option value="true">Đã mất</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Năm mất</label>
                  <input type="text" placeholder="VD: 2024" disabled={!formData.isDeceased} value={formData.deathYear || ''} onChange={e => setFormData({...formData, deathYear: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none disabled:opacity-50" />
                </div>
              </div>

              <div className="col-span-3">
                <label className="text-xs font-semibold text-stone-600 block mb-1.5">Quê quán</label>
                <input type="text" value={formData.hometown || ''} onChange={e => setFormData({...formData, hometown: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none" />
              </div>
              
              <div className="col-span-3 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Cha</label>
                  <select value={formData.fatherId || ''} onChange={e => setFormData({...formData, fatherId: e.target.value || undefined})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none">
                    <option value="">-- Chưa rõ --</option>
                    {members.filter(m => m.gender === 'Male' && m.id !== editingId).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1.5">Mẹ</label>
                  <select value={formData.motherId || ''} onChange={e => setFormData({...formData, motherId: e.target.value || undefined})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none">
                    <option value="">-- Chưa rõ --</option>
                    {members.filter(m => m.gender === 'Female' && m.id !== editingId).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-span-3">
                <label className="text-xs font-semibold text-stone-600 block mb-1.5">Vợ / Chồng</label>
                <select value={formData.spouseId || ''} onChange={e => setFormData({...formData, spouseId: e.target.value || undefined})}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none">
                  <option value="">-- Không có --</option>
                  {members.filter(m => m.id !== editingId && (!m.spouseId || m.spouseId === editingId)).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                 <label className="text-xs font-semibold text-stone-600 block mb-1.5">Tiểu sử / Ghi chú</label>
                 <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm outline-none" rows={3}></textarea>
              </div>
              <button type="submit" className="col-span-3 bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition mt-4 text-sm">
                {editingId ? 'Lưu Thay Đổi' : 'Thêm vào Gia phả'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;