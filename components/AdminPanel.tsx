
import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember, Gender } from '../types';
import { Plus, Trash2, Edit3, Download, Upload, X, Search, User, Link2, Camera, Info, MapPin, Calendar, ShieldCheck } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onAdd: (member: Omit<FamilyMember, 'id'>) => void;
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onSelectMember: (member: FamilyMember) => void;
  initialMemberToEdit?: FamilyMember | null;
  onFormOpened?: () => void;
  isAdmin: boolean;
  onApprove: (id: string) => void;
}

const MemberManagement: React.FC<Props> = ({ 
    members, onAdd, onUpdate, onDelete, onBackup, onRestore, onSelectMember, 
    initialMemberToEdit, onFormOpened, isAdmin, onApprove
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const initialFormState: Partial<FamilyMember> = {
    name: '',
    hometown: '',
    gender: 'Male',
    isDeceased: false,
    birthDate: '',
    birthYear: '',
    deathYear: '',
    photoUrl: '',
    bio: '',
    fatherId: '',
    motherId: '',
    spouseId: ''
  };
  
  const [formData, setFormData] = useState<Partial<FamilyMember>>(initialFormState);

  const isHaMember = (name: string) => name.trim().startsWith('Hà ');

  useEffect(() => {
    if (initialMemberToEdit) {
      setEditingId(initialMemberToEdit.id);
      setFormData(initialMemberToEdit);
      setIsAdding(true);
      if (onFormOpened) onFormOpened();
    }
  }, [initialMemberToEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    
    // Tự động tách năm sinh nếu nhập ngày sinh đầy đủ
    if (finalData.birthDate) {
      finalData.birthYear = finalData.birthDate.split('-')[0];
    }
    
    if (editingId) {
      onUpdate(finalData as FamilyMember);
      setEditingId(null);
    } else {
      onAdd(finalData as Omit<FamilyMember, 'id'>);
    }
    setIsAdding(false);
    setFormData(initialFormState);
  };

  const filteredMembers = members
    .filter(m => activeTab === 'all' ? m.status === 'approved' : m.status === 'pending')
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .filter(m => m.name.toLowerCase().includes(adminSearch.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-stone-800 tracking-tight">Danh sách Thành viên</h2>
           <p className="text-sm text-stone-500 mt-1 font-medium">Hệ thống đang lưu trữ <span className="text-red-700 font-bold">{members.filter(m => m.status === 'approved').length}</span> người trong phả hệ.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData(initialFormState); }}
          className="bg-red-700 text-white px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-red-800 transition-all shadow-xl shadow-red-700/20 font-black text-xs uppercase tracking-widest">
          <Plus size={18} /> {isAdmin ? 'Ghi danh thành viên' : 'Đề xuất thành viên'}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-8 pt-6 flex gap-8 border-b border-stone-100">
           <button onClick={() => setActiveTab('all')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'all' ? 'border-red-700 text-red-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
             Tất cả thành viên
           </button>
           {isAdmin && (
             <button onClick={() => setActiveTab('pending')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative ${activeTab === 'pending' ? 'border-red-700 text-red-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
               Chờ duyệt
               {members.filter(m => m.status === 'pending').length > 0 && (
                 <span className="absolute -top-1 -right-4 bg-red-700 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{members.filter(m => m.status === 'pending').length}</span>
               )}
             </button>
           )}
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-stone-50/50 border-b border-stone-100">
           <div className="relative w-full md:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
             <input type="text" placeholder="Tìm kiếm theo họ tên..." className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
              value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
           </div>
           <div className="flex gap-2">
             <button onClick={onBackup} className="bg-white text-stone-700 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-stone-50 transition border border-stone-200 text-xs font-black uppercase tracking-wider">
               <Download size={16} /> Xuất file JSON
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="bg-white text-stone-700 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-stone-50 transition border border-stone-200 text-xs font-black uppercase tracking-wider">
               <Upload size={16} /> Nhập file
             </button>
             <input type="file" ref={fileInputRef} onChange={(e) => {
               const file = e.target.files?.[0];
               if (file && confirm("Cảnh báo: Dữ liệu hiện tại sẽ bị thay thế bởi file nhập vào. Tiếp tục?")) onRestore(file);
             }} accept=".json" className="hidden" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-100">
                <th className="px-8 py-6">Họ và Tên</th>
                <th className="px-8 py-6">Dòng tộc</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/30 transition group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={m.photoUrl || `https://i.pravatar.cc/100?u=${m.id}`} className="w-12 h-12 rounded-2xl object-cover border border-stone-100 shadow-sm group-hover:scale-110 transition-transform"/>
                        <div>
                          <div className="font-bold text-stone-800 text-sm">{m.name}</div>
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{m.birthYear || 'Năm sinh ?'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isHaMember(m.name) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {isHaMember(m.name) ? 'Họ Hà' : 'Ngoại Tộc'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.isDeceased ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${m.isDeceased ? 'bg-stone-400' : 'bg-emerald-500'}`}></span>
                        {m.isDeceased ? `Mất ${m.deathYear || ''}` : 'Còn sống'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onSelectMember(m)} className="p-2.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all" title="Xem chi tiết"><User size={18}/></button>
                        {isAdmin && (
                          <>
                            {activeTab === 'pending' && (
                              <button onClick={() => onApprove(m.id)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Duyệt"><ShieldCheck size={18}/></button>
                            )}
                            <button onClick={() => { setEditingId(m.id); setFormData(m); setIsAdding(true); }} className="p-2.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chỉnh sửa"><Edit3 size={18}/></button>
                            <button onClick={() => onDelete(m.id)} className="p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa"><Trash2 size={18}/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-10 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
              <div>
                <h3 className="text-2xl font-black text-stone-800 tracking-tight">{editingId ? 'Cập nhật Thông tin' : 'Thêm Thành viên Mới'}</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Hệ thống sẽ tự động đồng bộ quan hệ hôn phối hai chiều</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-stone-400 hover:text-stone-800 p-3 rounded-full hover:bg-white transition shadow-sm border border-transparent hover:border-stone-200"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* CỘT 1: AVATAR & CƠ BẢN */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                  <img src={formData.photoUrl || `https://i.pravatar.cc/300?u=${editingId || 'new'}`} className="w-48 h-48 rounded-[2rem] object-cover border-8 border-stone-50 shadow-2xl bg-stone-100 group-hover:opacity-80 transition-all"/>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 p-4 rounded-full shadow-lg text-stone-800"><Camera size={24}/></div>
                  </div>
                </div>
                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest text-center">Tải ảnh đại diện (Tỉ lệ 1:1)</p>
                
                <div className="w-full space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-2">Họ và Tên đầy đủ</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-red-500/10 outline-none transition-all" placeholder="Nhập tên..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-2">Giới tính</label>
                    <div className="flex gap-2">
                       {['Male', 'Female'].map(g => (
                         <button key={g} type="button" onClick={() => setFormData({...formData, gender: g as Gender})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-stone-800 text-white shadow-lg' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                           {g === 'Male' ? 'Nam' : 'Nữ'}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT 2: NGÀY THÁNG & ĐỊA DANH */}
              <div className="space-y-6">
                <div className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100 space-y-5">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest">
                    <Calendar size={14} /> Thời gian & Trạng thái
                  </h4>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Ngày sinh / Năm sinh</label>
                    <input type="date" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/10 transition-all" />
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={formData.isDeceased} onChange={e => setFormData({...formData, isDeceased: e.target.checked})} className="w-5 h-5 rounded-lg border-stone-300 text-red-700 focus:ring-red-500 transition-all cursor-pointer" />
                      <span className="text-xs font-black text-stone-600 uppercase tracking-widest">Đã quá vãng (Đã mất)</span>
                    </label>
                  </div>
                  {formData.isDeceased && (
                    <div className="animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Năm mất</label>
                      <input type="text" placeholder="Ví dụ: 2024" value={formData.deathYear || ''} onChange={e => setFormData({...formData, deathYear: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Quê quán
                  </label>
                  <input type="text" value={formData.hometown || ''} onChange={e => setFormData({...formData, hometown: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/10 transition-all" placeholder="Quê quán..." />
                </div>
              </div>

              {/* CỘT 3: QUAN HỆ & TIỂU SỬ */}
              <div className="space-y-6">
                <div className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100 space-y-5">
                   <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                    <Link2 size={14} /> Liên kết Gia đình
                  </h4>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Người Cha</label>
                    <select value={formData.fatherId || ''} onChange={e => setFormData({...formData, fatherId: e.target.value || undefined})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                      <option value="">-- Chưa rõ / Không có --</option>
                      {members.filter(m => m.gender === 'Male' && m.id !== editingId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Người Mẹ</label>
                    <select value={formData.motherId || ''} onChange={e => setFormData({...formData, motherId: e.target.value || undefined})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                      <option value="">-- Chưa rõ / Không có --</option>
                      {members.filter(m => m.gender === 'Female' && m.id !== editingId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Vợ / Chồng</label>
                    <select value={formData.spouseId || ''} onChange={e => setFormData({...formData, spouseId: e.target.value || undefined})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                      <option value="">-- Chưa rõ / Chưa có --</option>
                      {members.filter(m => m.id !== editingId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2">
                    <Info size={12} /> Ghi chú / Tiểu sử
                  </label>
                  <textarea rows={3} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/10 transition-all resize-none" placeholder="Lịch sử cuộc đời, sự nghiệp..." />
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-3 pt-6 border-t border-stone-100 flex gap-4">
                <button type="submit" className="flex-1 bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-800 transition shadow-xl shadow-red-700/20 active:scale-95">
                  {editingId ? 'Ghi nhận toàn bộ thay đổi' : (isAdmin ? 'Ghi danh thành viên mới' : 'Gửi đề xuất thành viên')}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-12 bg-stone-100 text-stone-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-200 transition">Hủy bỏ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
