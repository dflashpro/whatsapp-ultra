import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Laptop, LogOut } from 'lucide-react';

export const LinkedDevicesModal = ({ onClose }) => {
  const { showToast } = useAuth();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl space-y-5 text-[#e9edef] text-center">
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <QrCode size={20} className="text-[#00a884]" />
            <h2 className="text-base font-bold">Linked Devices</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 bg-white rounded-3xl inline-block mx-auto shadow-2xl">
          <div className="w-44 h-44 bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 text-center">
            <QrCode size={120} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/80 font-mono mt-2">WA-ULTRA-SECURE-KEY</span>
          </div>
        </div>

        <p className="text-xs text-[#8696a0] max-w-xs mx-auto">
          Scan this QR code from your phone or secondary browser to link WhatsApp Ultra.
        </p>

        <div className="text-left space-y-2 pt-2">
          <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Active Device Sessions</p>
          <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Laptop size={20} className="text-[#00a884]" />
              <div>
                <p className="text-xs font-bold">Chrome on Windows (Current)</p>
                <p className="text-[10px] text-[#00a884]">Active now • Colombo</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded-full font-bold">Active</span>
          </div>
        </div>

        <button 
          onClick={() => { showToast('Logged out from other devices'); onClose(); }}
          className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Log Out from All Other Devices
        </button>
      </div>
    </div>
  );
};
