import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Circle, Check } from 'lucide-react';

const STATUSES = [
  { id: 'online', label: 'Online', color: '#00a884', desc: 'Available for chats and calls' },
  { id: 'away', label: 'Away', color: '#f59e0b', desc: 'Temporarily unavailable' },
  { id: 'busy', label: 'Do Not Disturb', color: '#ef4444', desc: 'Muting all notifications' },
  { id: 'offline', label: 'Appear Offline', color: '#8696a0', desc: 'Invisible to all contacts' },
];

export const OnlineStatusModal = ({ onClose }) => {
  const { onlineStatus, setOnlineStatus, showToast } = useAuth();
  const [selected, setSelected] = useState(onlineStatus || 'online');

  const handleSave = () => {
    setOnlineStatus(selected);
    showToast(`Status set to ${STATUSES.find(s => s.id === selected)?.label}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-5 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Set Online Status</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="space-y-2">
          {STATUSES.map(s => (
            <div key={s.id} onClick={() => setSelected(s.id)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${selected === s.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <Circle size={12} fill={s.color} className={`text-transparent`} style={{ filter: `drop-shadow(0 0 4px ${s.color})` }} />
                <div>
                  <p className="text-xs font-bold">{s.label}</p>
                  <p className="text-[10px] text-[#8696a0]">{s.desc}</p>
                </div>
              </div>
              {selected === s.id && <Check size={16} className="text-[#00a884]" />}
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl">Save Status</button>
      </div>
    </div>
  );
};
