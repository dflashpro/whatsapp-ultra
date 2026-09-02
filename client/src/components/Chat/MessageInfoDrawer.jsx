import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCheck, Check, Clock, Eye } from 'lucide-react';

export const MessageInfoDrawer = ({ message, onClose }) => {
  const { users } = useAuth();

  if (!message) return null;

  const sender = users.find(u => u.id === message.senderId);
  const sentTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sentDate = new Date(message.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="w-80 h-full glass-header border-l border-white/5 flex flex-col z-30 select-none animate-in slide-in-from-right">
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-sm font-bold text-[#e9edef]">Message Info</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Message Preview */}
        <div className="p-3 bg-gradient-to-r from-[#005c4b] to-[#00705a] rounded-2xl rounded-tr-none shadow-lg">
          <p className="text-sm text-[#e9edef] leading-relaxed">{message.text || '(Media)'}</p>
          {message.edited && <span className="text-[10px] text-[#8696a0]"> (edited)</span>}
          <p className="text-[11px] text-[#8696a0] text-right mt-1">{sentTime}</p>
        </div>

        {/* Status Rows */}
        <div className="space-y-2">
          <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <CheckCheck size={18} className="text-[#53bdeb]" />
              <div>
                <p className="text-xs font-bold text-[#e9edef]">Read</p>
                <p className="text-[10px] text-[#8696a0]">{sentDate} {sentTime}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <CheckCheck size={18} className="text-[#8696a0]" />
              <div>
                <p className="text-xs font-bold text-[#e9edef]">Delivered</p>
                <p className="text-[10px] text-[#8696a0]">{sentDate} {sentTime}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#8696a0]" />
              <div>
                <p className="text-xs font-bold text-[#e9edef]">Sent</p>
                <p className="text-[10px] text-[#8696a0]">{sentDate} {sentTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Reactions</p>
            <div className="flex flex-wrap gap-2">
              {message.reactions.map((r, i) => {
                const u = users.find(x => x.id === r.userId);
                return (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl text-xs">
                    <span className="text-base">{r.reaction}</span>
                    <span className="text-[#8696a0]">{u?.name?.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
