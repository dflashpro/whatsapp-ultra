import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Tag, Check, Plus, Trash2 } from 'lucide-react';

const DEFAULT_LABELS = [
  { id: 'family', name: 'Family', color: '#00a884', emoji: '👨‍👩‍👧‍👦' },
  { id: 'work', name: 'Work', color: '#53bdeb', emoji: '💼' },
  { id: 'friends', name: 'Friends', color: '#f59e0b', emoji: '👥' },
  { id: 'important', name: 'Important', color: '#ef4444', emoji: '⭐' },
];

export const ChatLabelsModal = ({ chatId, onClose }) => {
  const { chatLabels, setChatLabel, removeChatLabel, showToast } = useAuth();
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [showNew, setShowNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const currentLabels = chatLabels?.[chatId] || [];

  const toggleLabel = (label) => {
    const has = currentLabels.find(l => l.id === label.id);
    if (has) {
      removeChatLabel(chatId, label.id);
      showToast(`Label "${label.name}" removed`);
    } else {
      setChatLabel(chatId, label);
      showToast(`Label "${label.name}" added 🏷️`);
    }
  };

  const addCustomLabel = () => {
    if (!newLabel.trim()) return;
    const custom = { id: `custom_${Date.now()}`, name: newLabel.trim(), color: '#8b5cf6', emoji: '🏷️' };
    setLabels(prev => [...prev, custom]);
    setNewLabel('');
    setShowNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-5 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Chat Labels</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="space-y-2">
          {labels.map(label => {
            const isActive = currentLabels.find(l => l.id === label.id);
            return (
              <div key={label.id} onClick={() => toggleLabel(label)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${isActive ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{label.emoji}</span>
                  <span className="text-xs font-bold">{label.name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                </div>
                {isActive && <Check size={15} className="text-[#00a884]" />}
              </div>
            );
          })}
        </div>

        {showNew ? (
          <div className="flex items-center gap-2">
            <input autoFocus value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomLabel()}
              placeholder="Label name..." className="flex-1 bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none" />
            <button onClick={addCustomLabel} className="p-2 bg-[#00a884] text-black rounded-xl"><Check size={15} /></button>
          </div>
        ) : (
          <button onClick={() => setShowNew(true)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[#8696a0] flex items-center justify-center gap-2">
            <Plus size={14} /> New Label
          </button>
        )}

        <button onClick={onClose} className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-xs rounded-xl">Done</button>
      </div>
    </div>
  );
};
