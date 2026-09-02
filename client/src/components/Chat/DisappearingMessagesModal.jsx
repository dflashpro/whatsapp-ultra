import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Timer, Check } from 'lucide-react';

const TIMERS = [
  { label: 'Off', value: 'off', desc: 'Messages will not disappear' },
  { label: '24 Hours', value: '24h', desc: 'Messages disappear after 24 hours' },
  { label: '7 Days', value: '7d', desc: 'Messages disappear after 7 days' },
  { label: '90 Days', value: '90d', desc: 'Messages disappear after 90 days' }
];

export const DisappearingMessagesModal = ({ chatId, onClose }) => {
  const { disappearingSettings, setDisappearingTimer, showToast, activeChat } = useAuth();
  const current = disappearingSettings?.[chatId] || 'off';
  const [selected, setSelected] = useState(current);

  const handleSave = () => {
    setDisappearingTimer(chatId, selected);
    showToast(selected === 'off' ? 'Disappearing messages turned off' : `Disappearing messages set to ${selected} ⏱️`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Disappearing Messages</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <p className="text-xs text-[#8696a0]">
          When enabled, new messages will disappear from this chat after the selected duration.
        </p>

        <div className="space-y-2">
          {TIMERS.map(t => (
            <div
              key={t.value}
              onClick={() => setSelected(t.value)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                selected === t.value ? 'bg-[#00a884]/15 border-[#00a884]' : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-[#e9edef]">{t.label}</p>
                <p className="text-[10px] text-[#8696a0]">{t.desc}</p>
              </div>
              {selected === t.value && <Check size={16} className="text-[#00a884]" />}
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl">
          Save Setting
        </button>
      </div>
    </div>
  );
};
