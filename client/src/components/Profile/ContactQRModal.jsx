import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Copy, Share2, Check } from 'lucide-react';

export const ContactQRModal = ({ onClose }) => {
  const { currentUser, showToast } = useAuth();
  const [copied, setCopied] = useState(false);

  const contactLink = `https://wa.me/ultra/${currentUser?.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(contactLink);
    setCopied(true);
    showToast('Contact link copied! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] text-center space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">My QR Code</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        {/* QR Card */}
        <div className="p-4 bg-white rounded-3xl shadow-2xl mx-auto w-fit">
          <div className="w-40 h-40 bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-2">
            <QrCode size={110} className="text-[#00a884] animate-pulse" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center gap-2">
          <img src={currentUser?.avatar} alt={currentUser?.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00a884]" />
          <div>
            <p className="text-sm font-bold">{currentUser?.name}</p>
            <p className="text-xs text-[#8696a0]">{currentUser?.phone}</p>
          </div>
        </div>

        {/* Link Copy */}
        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono text-[#00a884]">
          <span className="truncate">{contactLink}</span>
          <button onClick={copyLink} className="p-1.5 hover:bg-white/10 rounded-lg text-white ml-2">
            {copied ? <Check size={15} className="text-[#00a884]" /> : <Copy size={15} />}
          </button>
        </div>

        <p className="text-[10px] text-[#8696a0]">Anyone can scan this QR to start chatting with you on WhatsApp Ultra</p>
      </div>
    </div>
  );
};
