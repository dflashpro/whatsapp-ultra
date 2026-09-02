import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, Star } from 'lucide-react';

export const StarredMessagesDrawer = ({ onClose }) => {
  const { starredMessages, toggleStarMessage, users } = useAuth();
  const { messages } = useSocket();

  const starredList = messages.filter(m => starredMessages.includes(m.id));

  return (
    <div className="w-80 sm:w-96 h-full glass-header border-l border-white/5 flex flex-col z-30 select-none overflow-y-auto animate-in slide-in-from-right">
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-amber-400 fill-amber-400" />
          <h3 className="text-sm font-bold text-[#e9edef]">Starred Messages</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0] hover:text-[#e9edef]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {starredList.length === 0 ? (
          <div className="text-center py-12 text-[#8696a0] space-y-2">
            <Star size={32} className="mx-auto opacity-30" />
            <p className="text-xs">No starred messages yet</p>
          </div>
        ) : (
          starredList.map(msg => {
            const sender = users.find(u => u.id === msg.senderId);
            return (
              <div key={msg.id} className="p-3.5 glass-card rounded-2xl space-y-1.5 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#00a884]">{sender?.name || 'User'}</span>
                  <button 
                    onClick={() => toggleStarMessage(msg.id)}
                    className="text-amber-400 hover:text-rose-400"
                    title="Unstar message"
                  >
                    <Star size={14} fill="currentColor" />
                  </button>
                </div>
                <p className="text-xs text-[#e9edef] leading-relaxed">{msg.text}</p>
                <span className="text-[10px] text-[#8696a0] block text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
