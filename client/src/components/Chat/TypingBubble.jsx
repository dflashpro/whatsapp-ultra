import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export const TypingBubble = () => {
  const { typingUsers } = useSocket();
  const { activeChat, users, currentUser } = useAuth();

  if (!activeChat) return null;

  const isGroup = Boolean(activeChat.isGroup);
  const chatId = isGroup ? activeChat.id : [currentUser?.id, activeChat?.id].sort().join('-');
  const typingUserId = typingUsers[chatId];
  const typingUserId2 = typingUsers[activeChat.id];

  const whoTyping = typingUserId || typingUserId2;
  if (!whoTyping || whoTyping === currentUser?.id) return null;

  const typingUser = users.find(u => u.id === whoTyping);
  const name = isGroup ? (typingUser?.name?.split(' ')[0] || 'Someone') : null;

  return (
    <div className="flex items-end gap-2 px-4 sm:px-6 pb-2 animate-in fade-in">
      {isGroup && typingUser && (
        <img src={typingUser.avatar} alt={name} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
      )}
      <div className="glass-card rounded-2xl rounded-tl-none px-4 py-2.5 shadow-lg flex items-center gap-3 max-w-fit">
        {isGroup && (
          <span className="text-xs font-bold text-[#53bdeb] mr-1">{name}</span>
        )}
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-[#8696a0] font-medium">typing...</span>
      </div>
    </div>
  );
};
