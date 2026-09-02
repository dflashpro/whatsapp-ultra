import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, BellOff, Check } from 'lucide-react';

const OPTIONS = [
  { label: '8 Hours', value: 8 * 60 * 60 * 1000 },
  { label: '1 Week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Always', value: -1 }
];

export const MuteNotificationsModal = ({ chatId, onClose }) => {
  const { mutedChats, muteChat, unmuteChat, showToast } = useAuth();
  const isMuted = mutedChats.includes(chatId);
  const [selected, setSelected] = useState(OPTIONS[0].value);

  const handleMute = () => {
    muteChat(chatId, selected);
    showToast(`Notifications muted for ${selected === -1 ? 'always' : OPTIONS.find(o => o.value === selected)?.label} 🔇`);
    onClose();
  };

  if (isMuted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-xs glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4 text-center">
          <BellOff size={32} className="mx-auto text-[#00a884]" />
          <h2 className="text-sm font-bold">Chat is Muted</h2>
          <p className="text-xs text-[#8696a0]">Notifications are currently muted for this chat.</p>
          <div className="flex gap-3">
            <button onClick={() => { unmuteChat(chatId); showToast('Notifications unmuted 🔔'); onClose(); }} className="flex-1 py-2.5 bg-[#00a884] text-black font-bold text-xs rounded-xl">Unmute</button>
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 font-bold text-xs rounded-xl">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellOff size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Mute Notifications</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="space-y-2">
          {OPTIONS.map(o => (
            <div key={o.value} onClick={() => setSelected(o.value)}
              className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${selected === o.value ? 'bg-[#00a884]/15 border-[#00a884]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
              <span className="text-xs font-semibold">{o.label}</span>
              {selected === o.value && <Check size={15} className="text-[#00a884]" />}
            </div>
          ))}
        </div>

        <button onClick={handleMute} className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl">Mute</button>
      </div>
    </div>
  );
};
