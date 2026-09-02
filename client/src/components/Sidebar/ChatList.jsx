import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Check, CheckCheck, Mic, Image, FileText, Users, Pin, Lock, Bot, Sparkles, BellOff, Bookmark, Tag } from 'lucide-react';

export const ChatList = ({ searchQuery, filterTab }) => {
  const { 
    users, 
    currentUser, 
    activeChat, 
    openChat, 
    pinnedChats, 
    lockedChats,
    mutedChats,
    chatLabels = {},
  } = useAuth();
  
  const { messages, typingUsers } = useSocket();

  const getChatMessages = (targetId, isGroup) => {
    if (!currentUser) return [];
    if (targetId === currentUser.id) {
      return messages.filter(m => m.chatId === `self_${currentUser.id}` || (m.senderId === currentUser.id && m.receiverId === currentUser.id));
    }
    const chatId = isGroup ? targetId : [currentUser.id, targetId].sort().join('-');
    return messages.filter(m => m.chatId === chatId || (!isGroup && ((m.senderId === currentUser.id && m.receiverId === targetId) || (m.senderId === targetId && m.receiverId === currentUser.id))));
  };

  const getChatLastMessage = (targetId, isGroup) => {
    const chatMsgs = getChatMessages(targetId, isGroup).filter(m => !m.deleted && !m.deletedForMe);
    return chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;
  };

  const getUnreadCount = (targetId, isGroup) => {
    if (!currentUser || targetId === currentUser.id) return 0;
    const chatMsgs = getChatMessages(targetId, isGroup);
    return chatMsgs.filter(m => m.senderId === targetId && m.status !== 'read' && !m.deleted).length;
  };

  // Self Chat entry for "Saved Messages" / Personal Notes
  const selfChatUser = currentUser ? {
    id: currentUser.id,
    name: "Saved Messages (You)",
    avatar: currentUser.avatar,
    phone: "Personal Cloud Notes",
    status: "Saved notes, media, and links",
    isSelf: true,
    online: true
  } : null;

  const displayList = selfChatUser ? [selfChatUser, ...users.filter(u => u.id !== currentUser?.id)] : users.filter(u => u.id !== currentUser?.id);

  const filteredUsers = displayList
    .filter(u => {
      if (filterTab === 'groups' && !u.isGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isSelf) return -1;
      if (b.isSelf) return 1;
      const aPinned = pinnedChats.includes(a.id) || a.isAI;
      const bPinned = pinnedChats.includes(b.id) || b.isAI;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-white/5">
      {filteredUsers.map(user => {
        const lastMsg = getChatLastMessage(user.id, user.isGroup);
        const isSelected = activeChat?.id === user.id;
        const isTyping = Boolean(typingUsers[user.id] || (user.isGroup && Object.keys(typingUsers[user.id] || {}).length > 0));
        const isPinned = pinnedChats.includes(user.id) || user.isAI || user.isSelf;
        const isLocked = lockedChats.includes(user.id);
        const isMuted = mutedChats.includes(user.id);
        const unreadCount = getUnreadCount(user.id, user.isGroup);
        const userLabels = chatLabels[user.id] || [];

        return (
          <div
            key={user.id}
            onClick={() => openChat(user)}
            className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-all relative ${
              isSelected ? 'bg-white/10 border-l-4 border-[#00a884]' : 'hover:bg-white/5'
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {user.isSelf ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00a884] to-cyan-500 flex items-center justify-center text-black font-black shadow-md">
                  <Bookmark size={22} className="text-slate-900 fill-slate-900" />
                </div>
              ) : (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className={`w-12 h-12 rounded-full object-cover shadow-md ${
                    user.isAI ? 'ring-2 ring-purple-500 animate-hologram p-0.5' : 'ring-1 ring-white/10'
                  }`}
                />
              )}
              {user.isAI ? (
                <span className="absolute bottom-0 right-0 p-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white shadow-md">
                  <Sparkles size={10} />
                </span>
              ) : user.online && !user.isGroup && !user.isSelf ? (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></span>
              ) : null}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm font-bold text-[#e9edef] truncate">
                    {user.name}
                  </h3>
                  {user.isAI && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-400 rounded-full">
                      AI
                    </span>
                  )}
                  {user.isSelf && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#00a884]/20 text-[#00a884] rounded-full">
                      YOU
                    </span>
                  )}
                  {isPinned && <Pin size={12} className="text-amber-400 shrink-0 fill-amber-400" />}
                  {isLocked && <Lock size={12} className="text-rose-400 shrink-0" />}
                  {isMuted && <BellOff size={12} className="text-[#8696a0] shrink-0" />}
                </div>
                <span className="text-[11px] text-[#8696a0] shrink-0 ml-2">
                  {formatTimestamp(lastMsg?.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1">
                {isTyping ? (
                  <span className="text-xs text-[#00a884] font-medium flex items-center gap-1 truncate animate-pulse">
                    typing...
                  </span>
                ) : lastMsg ? (
                  <div className="flex items-center gap-1 text-xs text-[#8696a0] truncate flex-1">
                    {lastMsg.senderId === currentUser?.id && !user.isSelf && (
                      <span>
                        {lastMsg.status === 'read' ? (
                          <CheckCheck size={14} className="text-[#53bdeb] inline" />
                        ) : (
                          <Check size={14} className="text-[#8696a0] inline" />
                        )}
                      </span>
                    )}
                    {lastMsg.type === 'image' && <span>📷 Photo</span>}
                    {lastMsg.type === 'audio' && <span>🎤 Voice note</span>}
                    {lastMsg.type === 'location' && <span>📍 Location</span>}
                    {lastMsg.type === 'poll' && <span>📊 Poll</span>}
                    {lastMsg.type === 'text' && <span className="truncate">{lastMsg.text}</span>}
                  </div>
                ) : (
                  <span className="text-xs text-[#8696a0] truncate italic">
                    {user.status || 'Start a conversation'}
                  </span>
                )}

                {/* Right badges */}
                <div className="flex items-center gap-1 shrink-0">
                  {userLabels.map(l => (
                    <span key={l.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} title={l.name} />
                  ))}
                  {unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1.5 bg-[#00a884] text-black font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
