import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Phone, 
  Video, 
  Lock, 
  ShieldAlert, 
  Trash2, 
  BellOff, 
  Clock, 
  Image, 
  FileText, 
  Users,
  Pin
} from 'lucide-react';

export const ContactInfoDrawer = ({ onClose }) => {
  const { 
    activeChat, 
    users, 
    currentUser, 
    lockedChats, 
    toggleLockChat, 
    pinnedChats, 
    togglePinChat,
    blockedUsers, 
    blockUser, 
    unblockUser,
    showToast 
  } = useAuth();

  if (!activeChat) return null;

  const isBlocked = (blockedUsers || []).includes(activeChat.id);
  const isLocked = lockedChats.includes(activeChat.id);
  const isPinned = pinnedChats.includes(activeChat.id);

  return (
    <div className="w-80 sm:w-96 h-full glass-header border-l border-white/5 flex flex-col z-30 select-none overflow-y-auto animate-in slide-in-from-right">
      {/* Top Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-sm font-bold text-[#e9edef]">
          {activeChat.isGroup ? 'Group Info' : 'Contact Info'}
        </h3>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0] hover:text-[#e9edef]">
          <X size={20} />
        </button>
      </div>

      {/* Profile Overview */}
      <div className="p-6 flex flex-col items-center text-center border-b border-white/5 space-y-3">
        <img 
          src={activeChat.avatar} 
          alt={activeChat.name} 
          className="w-28 h-28 rounded-full object-cover ring-4 ring-[#00a884]/30 shadow-2xl"
        />
        <div>
          <h2 className="text-lg font-bold text-[#e9edef]">{activeChat.name}</h2>
          <p className="text-xs text-[#8696a0] mt-0.5">{activeChat.phone || (activeChat.isGroup ? `${(activeChat.members || []).length} participants` : '')}</p>
        </div>
      </div>

      {/* About / Description */}
      <div className="p-4 border-b border-white/5 space-y-1">
        <p className="text-xs font-semibold text-[#00a884] uppercase tracking-wider">
          {activeChat.isGroup ? 'Description' : 'About'}
        </p>
        <p className="text-sm text-[#e9edef]">{activeChat.status || activeChat.description || 'Available'}</p>
      </div>

      {/* Group Participants (If Group) */}
      {activeChat.isGroup && (
        <div className="p-4 border-b border-white/5 space-y-3">
          <p className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
            {(activeChat.members || []).length} Participants
          </p>
          <div className="space-y-2">
            {(activeChat.members || []).map(id => {
              const member = users.find(u => u.id === id);
              const isAdmin = activeChat.admin === id;
              return (
                <div key={id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5">
                  <div className="flex items-center gap-2.5">
                    <img src={member?.avatar} alt={member?.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-[#e9edef]">
                        {member?.name} {id === currentUser?.id ? '(You)' : ''}
                      </p>
                      <p className="text-[10px] text-[#8696a0]">{member?.phone}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#00a884]/20 text-[#00a884] rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy & Action Toggles */}
      <div className="p-4 border-b border-white/5 space-y-2">
        <button 
          onClick={() => togglePinChat(activeChat.id)}
          className="w-full px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs font-semibold text-[#e9edef]"
        >
          <div className="flex items-center gap-3">
            <Pin size={16} className={isPinned ? 'text-amber-400 fill-amber-400' : 'text-[#8696a0]'} />
            <span>Pin Chat</span>
          </div>
          <span className="text-[11px] text-[#8696a0]">{isPinned ? 'Pinned' : 'Off'}</span>
        </button>

        <button 
          onClick={() => toggleLockChat(activeChat.id)}
          className="w-full px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs font-semibold text-[#e9edef]"
        >
          <div className="flex items-center gap-3">
            <Lock size={16} className={isLocked ? 'text-rose-400' : 'text-[#8696a0]'} />
            <span>Lock Chat with PIN</span>
          </div>
          <span className="text-[11px] text-[#8696a0]">{isLocked ? 'Locked' : 'Off'}</span>
        </button>
      </div>

      {/* Danger Zone: Block / Delete */}
      <div className="p-4 space-y-2">
        {!activeChat.isGroup && (
          <button 
            onClick={() => isBlocked ? unblockUser(activeChat.id) : blockUser(activeChat.id)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isBlocked ? 'bg-white/10 text-[#00a884] hover:bg-white/20' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
            }`}
          >
            <ShieldAlert size={16} />
            <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
