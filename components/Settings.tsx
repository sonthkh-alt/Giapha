
import React, { useState, useEffect } from 'react';
import { Info, Mail, Phone, Globe, ShieldCheck, Github, Edit3, Save, X } from 'lucide-react';
import { SystemSettings } from '../types';

interface Props {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
}

const SettingsView: React.FC<Props> = ({ isAdmin, setIsAdmin, settings, onUpdateSettings }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SystemSettings>(settings);

  useEffect(() => {
    setEditData(settings);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin@213') {
      setIsAdmin(true);
      setPassword('');
      setError('');
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdateSettings(editData);
    setIsEditing(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Settings</h2>
          <p className="text-sm text-stone-500 mt-1 font-medium">Thông tin hệ thống và quản trị.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${isEditing ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-stone-900 text-white shadow-stone-900/20'}`}
          >
            {isEditing ? <><Save size={16} /> Lưu thay đổi</> : <><Edit3 size={16} /> Chỉnh sửa thông tin</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admin Login/Status */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-800'}`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-stone-800 uppercase tracking-widest text-xs">Quản trị Hệ thống</h3>
              <p className="text-sm text-stone-500 font-medium">{isAdmin ? 'Bạn đang đăng nhập với quyền Admin' : 'Đăng nhập để quản lý phả hệ'}</p>
            </div>
          </div>

          {isAdmin ? (
            <div className="pt-4 space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                  Quyền Admin cho phép bạn: Duyệt thông tin mới, chỉnh sửa/xóa thành viên và sao lưu dữ liệu toàn hệ thống.
                </p>
              </div>
              <button onClick={handleLogout} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 transition shadow-xl shadow-stone-900/20">
                Đăng xuất khỏi hệ thống
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="pt-4 space-y-4">
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Mật khẩu quản trị</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..." 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                />
                {error && <p className="text-[10px] text-red-600 font-bold mt-2 uppercase tracking-widest">{error}</p>}
              </div>
              <button type="submit" className="w-full bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-800 transition shadow-xl shadow-red-700/20">
                Đăng nhập Admin
              </button>
              <p className="text-[10px] text-stone-400 font-bold text-center uppercase tracking-widest italic">Mật khẩu mặc định: admin@213</p>
            </form>
          )}
        </div>

        {/* System Info */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-stone-100 p-3 rounded-2xl text-stone-800">
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-black text-stone-800 uppercase tracking-widest text-xs">Thông tin Hệ thống</h3>
              <p className="text-sm text-stone-500 font-medium">Chi tiết phiên bản hiện tại</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Phiên bản</span>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.version} 
                  onChange={e => setEditData({...editData, version: e.target.value})}
                  className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs font-bold w-32 text-right outline-none focus:ring-2 focus:ring-red-500/20"
                />
              ) : (
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-black">{settings.version}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Nền tảng</span>
              <span className="text-stone-800 font-bold text-sm">Gia Phả Họ Hà v1</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Trạng thái</span>
              <span className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                ĐANG HOẠT ĐỘNG
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-200 space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-2xl text-red-700">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="font-black text-stone-800 uppercase tracking-widest text-xs">Liên hệ Hỗ trợ</h3>
            <p className="text-sm text-stone-500 font-medium">Kết nối với ban quản trị dòng họ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-stone-50 border border-transparent">
            <Mail size={20} className="text-stone-400" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Email</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.email} 
                  onChange={e => setEditData({...editData, email: e.target.value})}
                  className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 mt-1"
                />
              ) : (
                <p className="text-sm font-bold text-stone-800">{settings.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-stone-50 border border-transparent">
            <Phone size={20} className="text-stone-400" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Hotline</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.hotline} 
                  onChange={e => setEditData({...editData, hotline: e.target.value})}
                  className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 mt-1"
                />
              ) : (
                <p className="text-sm font-bold text-stone-800">{settings.hotline}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-stone-50 border border-transparent">
            <Globe size={20} className="text-stone-400" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Website</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.website} 
                  onChange={e => setEditData({...editData, website: e.target.value})}
                  className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 mt-1"
                />
              ) : (
                <p className="text-sm font-bold text-stone-800">{settings.website}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Terms */}
      <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-red-500" size={28} />
            <h3 className="text-xl font-black tracking-tight">Bảo mật & Quyền riêng tư</h3>
          </div>
          {isEditing ? (
            <textarea 
              rows={4}
              value={editData.securityTerms}
              onChange={e => setEditData({...editData, securityTerms: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/40 resize-none"
            />
          ) : (
            <p className="text-stone-400 text-sm leading-relaxed max-w-2xl">
              {settings.securityTerms}
            </p>
          )}
          <div className="pt-4 flex gap-4">
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              Điều khoản sử dụng
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              Chính sách bảo mật
            </button>
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-red-700/20 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
          Copyright © 2024 Gia Phả Họ Hà • All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
