import React, { useState } from 'react';
import { X, Zap, Plus, Trash2, Send } from 'lucide-react';

const DEFAULT_QUICK_REPLIES = [
  '👍 Ok, got it!',
  '🙏 Thanks!',
  '⏰ I\'ll get back to you shortly',
  '✅ Done!',
  '🔥 Sounds great!',
  '📞 Can we call?',
  '🇱🇰 Oyata reply karanne passe',
];

export const QuickRepliesPanel = ({ onSelect, onClose }) => {
  const [replies, setReplies] = useState(DEFAULT_QUICK_REPLIES);
  const [newReply, setNewReply] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const addReply = () => {
    if (!newReply.trim()) return;
    setReplies(prev => [...prev, newReply.trim()]);
    setNewReply('');
    setShowAdd(false);
  };

  return (
    <div className="absolute bottom-16 left-0 w-72 glass-modal rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-amber-400" />
          <span className="text-xs font-bold text-[#e9edef]">Quick Replies</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowAdd(!showAdd)} className="p-1 hover:bg-white/10 rounded-lg text-[#00a884]"><Plus size={15} /></button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={15} /></button>
        </div>
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <input
            autoFocus
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addReply()}
            placeholder="Add quick reply..."
            className="flex-1 bg-black/40 rounded-xl px-3 py-1.5 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none border border-white/5 focus:border-[#00a884]"
          />
          <button onClick={addReply} className="p-1.5 bg-[#00a884] text-black rounded-lg"><Send size={13} /></button>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
        {replies.map((r, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <button
              onClick={() => { onSelect(r); onClose(); }}
              className="flex-1 text-left px-3 py-2 text-xs text-[#e9edef] hover:bg-white/10 rounded-xl transition-colors truncate font-medium"
            >
              {r}
            </button>
            <button
              onClick={() => setReplies(prev => prev.filter((_, idx) => idx !== i))}
              className="p-1.5 opacity-0 group-hover:opacity-100 text-[#8696a0] hover:text-rose-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
