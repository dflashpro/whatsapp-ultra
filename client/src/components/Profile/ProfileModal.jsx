import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Check, Camera, User, Info, Phone } from 'lucide-react';

export const ProfileModal = () => {
  const { currentUser, showProfileModal, setShowProfileModal, updateProfile } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [status, setStatus] = useState(currentUser?.status || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  if (!showProfileModal || !currentUser) return null;

  const handleSave = () => {
    updateProfile({ name, status, avatar });
    setShowProfileModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl shadow-2xl border border-[#374248] flex flex-col overflow-hidden text-[#e9edef]">
        <div className="h-16 px-6 bg-[#111b21] border-b border-[#2a3942] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#e9edef]">Profile Details</h2>
          <button 
            onClick={() => setShowProfileModal(false)}
            className="p-1.5 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-[#e9edef] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <img 
                src={avatar || currentUser.avatar} 
                alt="Profile" 
                className="w-28 h-28 rounded-full object-cover ring-4 ring-[#00a884]/40"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-[10px] text-white font-medium">Change Photo</span>
              </div>
            </div>
            <input 
              type="text" 
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Avatar Image URL"
              className="text-xs text-center bg-[#111b21] px-3 py-1.5 rounded-lg border border-[#374248] text-[#8696a0] focus:text-[#e9edef] focus:outline-none w-full max-w-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#00a884] uppercase tracking-wider block mb-1.5">
              Your Name
            </label>
            <div className="flex items-center bg-[#111b21] rounded-xl px-3 py-2.5 border border-[#374248] focus-within:border-[#00a884] transition-colors">
              <User size={18} className="text-[#8696a0] mr-2.5 shrink-0" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm text-[#e9edef] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#00a884] uppercase tracking-wider block mb-1.5">
              About
            </label>
            <div className="flex items-center bg-[#111b21] rounded-xl px-3 py-2.5 border border-[#374248] focus-within:border-[#00a884] transition-colors">
              <Info size={18} className="text-[#8696a0] mr-2.5 shrink-0" />
              <input 
                type="text" 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-transparent text-sm text-[#e9edef] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1.5">
              Phone Number
            </label>
            <div className="flex items-center bg-[#111b21]/50 rounded-xl px-3 py-2.5 border border-[#374248]/50 text-[#8696a0]">
              <Phone size={18} className="mr-2.5 shrink-0" />
              <span className="text-sm font-mono">{currentUser.phone || '+94 77 000 0000'}</span>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95"
          >
            <Check size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
