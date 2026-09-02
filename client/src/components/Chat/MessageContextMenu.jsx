import React from 'react';
import { Reply, Forward, Trash2, Edit3, Star, Info, Copy, Share2 } from 'lucide-react';

export const MessageContextMenu = ({ msg, isSender, position, onClose, onReply, onForward, onDelete, onEdit, onStar, onCopy, onInfo, isStarred }) => {
  const menuItems = [
    { icon: Reply, label: 'Reply', color: 'text-[#00a884]', action: () => { onReply(msg); onClose(); } },
    { icon: Forward, label: 'Forward', color: 'text-[#53bdeb]', action: () => { onForward(msg); onClose(); } },
    { icon: Copy, label: 'Copy Text', color: 'text-[#e9edef]', action: () => { onCopy(msg.text); onClose(); } },
    { icon: Star, label: isStarred ? 'Unstar' : 'Star', color: 'text-amber-400', action: () => { onStar(msg.id); onClose(); } },
    { icon: Info, label: 'Message Info', color: 'text-[#8696a0]', action: () => { onInfo(msg); onClose(); } },
    ...(isSender ? [
      { icon: Edit3, label: 'Edit', color: 'text-violet-400', action: () => { onEdit(msg); onClose(); } },
      { icon: Trash2, label: 'Delete', color: 'text-rose-400', action: () => { onDelete(msg); onClose(); } },
    ] : [
      { icon: Trash2, label: 'Delete for me', color: 'text-rose-400', action: () => { onDelete(msg, 'me'); onClose(); } }
    ])
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 glass-modal rounded-2xl p-1.5 shadow-2xl w-48 animate-in fade-in border border-white/10"
        style={{ top: Math.min(position.y, window.innerHeight - 280), left: Math.min(position.x, window.innerWidth - 200) }}
      >
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={item.action}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 rounded-xl text-xs font-semibold text-left transition-colors"
            >
              <Icon size={15} className={item.color} />
              <span className="text-[#e9edef]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
