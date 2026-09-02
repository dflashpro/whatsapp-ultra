import React from 'react';
import { Pin, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PinnedChatMessage = ({ message, onScrollTo, onUnpin }) => {
  if (!message) return null;

  return (
    <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between gap-3 animate-in slide-in-from-top z-10 select-none">
      <div 
        onClick={() => onScrollTo(message.id)}
        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-lg bg-[#00a884]/20 flex items-center justify-center shrink-0">
          <Pin size={12} className="text-[#00a884] fill-[#00a884]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider">Pinned Message</p>
          <p className="text-xs text-[#e9edef] truncate group-hover:text-[#00a884] transition-colors">
            {message.text || (message.type === 'image' ? '📷 Photo' : message.type === 'poll' ? '📊 Poll' : '📁 Attachment')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={() => onScrollTo(message.id)} 
          className="p-1 hover:bg-white/10 rounded-lg text-[#8696a0] hover:text-white"
          title="Jump to message"
        >
          <ChevronRight size={16} />
        </button>
        <button 
          onClick={onUnpin} 
          className="p-1 hover:bg-white/10 rounded-lg text-[#8696a0] hover:text-rose-400"
          title="Unpin message"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
