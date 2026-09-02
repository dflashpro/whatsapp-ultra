import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import { Phone, Video, Search, MoreVertical, ArrowLeft, Pin, Lock, Info, Star, Archive, BellOff, Timer, Download, QrCode, Grid, BarChart2, Languages, Tag } from 'lucide-react';
import { DisappearingMessagesModal } from './DisappearingMessagesModal';
import { MuteNotificationsModal } from './MuteNotificationsModal';
import { ChatExportModal } from './ChatExportModal';
import { MediaGallery } from './MediaGallery';
import { ChatStatsDrawer } from './ChatStatsDrawer';
import { TranslationModal } from './TranslationModal';
import { ChatLabelsModal } from './ChatLabelsModal';

export const ChatHeader = ({ onOpenStarred, onOpenSearch }) => {
  const { activeChat, setActiveChat, users, pinnedChats, togglePinChat, lockedChats, toggleLockChat, showContactInfoDrawer, setShowContactInfoDrawer, archiveChat, archivedChats, mutedChats, showToast } = useAuth();
  const { typingUsers } = useSocket();
  const { startCall } = useCall();
  const [showMenu, setShowMenu] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  if (!activeChat) return null;

  const isTyping = Boolean(typingUsers[activeChat.id]);
  const isPinned = pinnedChats.includes(activeChat.id);
  const isLocked = lockedChats.includes(activeChat.id);
  const isArchived = archivedChats.includes(activeChat.id);
  const isMuted = mutedChats.includes(activeChat.id);

  const formatSubtitle = () => {
    if (activeChat.isSelf) return 'Cloud storage • Notes to yourself 📝';
    if (activeChat.isAI) return 'Ultra Intelligence • Always Active ⚡';
    if (activeChat.isGroup) return `${(activeChat.members || []).length} participants`;
    if (isTyping) return 'typing...';
    if (activeChat.online) return 'online';
    return 'last seen recently';
  };

  const menuItems = [
    { icon: Info, label: 'Contact Info', action: () => { setShowContactInfoDrawer(!showContactInfoDrawer); setShowMenu(false); } },
    { icon: Grid, label: 'Media, Links & Docs', action: () => { setShowGallery(true); setShowMenu(false); } },
    { icon: BarChart2, label: 'Chat Statistics', action: () => { setShowStats(true); setShowMenu(false); } },
    { icon: Languages, label: 'Smart Translate', action: () => { setShowTranslate(true); setShowMenu(false); } },
    { icon: Tag, label: 'Chat Labels', action: () => { setShowLabels(true); setShowMenu(false); } },
    { icon: Star, label: 'Starred Messages', action: () => { onOpenStarred && onOpenStarred(); setShowMenu(false); } },
    { icon: Search, label: 'Search in Chat', action: () => { onOpenSearch && onOpenSearch(); setShowMenu(false); } },
    { icon: Pin, label: isPinned ? 'Unpin Chat' : 'Pin Chat', action: () => { togglePinChat(activeChat.id); setShowMenu(false); } },
    { icon: Lock, label: isLocked ? 'Unlock Chat' : 'Lock with PIN', action: () => { toggleLockChat(activeChat.id); setShowMenu(false); } },
    { icon: Archive, label: isArchived ? 'Unarchive' : 'Archive Chat', action: () => { archiveChat(activeChat.id); setShowMenu(false); } },
    { icon: BellOff, label: isMuted ? 'Unmute' : 'Mute Notifications', action: () => { setShowMuteModal(true); setShowMenu(false); } },
    { icon: Timer, label: 'Disappearing Messages', action: () => { setShowDisappearingModal(true); setShowMenu(false); } },
    { icon: Download, label: 'Export Chat', action: () => { setShowExportModal(true); setShowMenu(false); } },
  ];

  return (
    <>
      <div className="h-16 px-4 glass-header border-b border-white/5 flex items-center justify-between z-20 shrink-0 select-none">
        <div onClick={() => !activeChat.isAI && !activeChat.isSelf && setShowContactInfoDrawer(!showContactInfoDrawer)} className="flex items-center gap-3 min-w-0 cursor-pointer group p-1 -ml-1 rounded-xl hover:bg-white/5 transition-all">
          <button onClick={(e) => { e.stopPropagation(); setActiveChat(null); }} className="md:hidden p-1 text-[#aebac1]"><ArrowLeft size={20} /></button>
          <div className="relative shrink-0">
            <img src={activeChat.avatar} alt={activeChat.name} className={`w-10 h-10 rounded-full object-cover ${activeChat.isAI ? 'ring-2 ring-purple-500' : 'ring-1 ring-white/20'}`} />
            {activeChat.online && !activeChat.isGroup && <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />}
            {isMuted && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#202c33] rounded-full border border-white/10 flex items-center justify-center"><BellOff size={9} className="text-[#8696a0]" /></span>}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#e9edef] group-hover:text-[#00a884] transition-colors truncate">{activeChat.name}</h2>
              {isPinned && <Pin size={12} className="text-amber-400 fill-amber-400" />}
              {isLocked && <Lock size={12} className="text-rose-400" />}
            </div>
            <p className={`text-xs truncate ${isTyping ? 'text-[#00a884] font-medium animate-pulse' : 'text-[#8696a0]'}`}>{formatSubtitle()}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#aebac1]">
          {!activeChat.isGroup && !activeChat.isAI && !activeChat.isSelf && (
            <>
              <button onClick={() => startCall(activeChat, 'voice')} className="p-2.5 hover:bg-white/10 rounded-full hover:text-[#00a884] transition-colors" title="Voice Call"><Phone size={19} /></button>
              <button onClick={() => startCall(activeChat, 'video')} className="p-2.5 hover:bg-white/10 rounded-full hover:text-[#00a884] transition-colors relative" title="4K Video Call">
                <Video size={20} />
                <span className="absolute -top-1 -right-1 px-1 text-[8px] font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-full">4K</span>
              </button>
            </>
          )}
          <button onClick={() => setShowGallery(true)} className="p-2.5 hover:bg-white/10 rounded-full hover:text-[#00a884] transition-colors" title="Media & Files"><Grid size={19} /></button>
          <button onClick={() => { onOpenSearch && onOpenSearch(); }} className="p-2.5 hover:bg-white/10 rounded-full transition-colors" title="Search in Chat"><Search size={19} /></button>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 hover:bg-white/10 rounded-full transition-colors"><MoreVertical size={19} /></button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 glass-modal rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in max-h-96 overflow-y-auto">
                  {menuItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={item.action} className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#e9edef] hover:bg-white/10 rounded-xl flex items-center gap-3">
                        <Icon size={15} className="text-[#8696a0]" /> {item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showDisappearingModal && <DisappearingMessagesModal chatId={activeChat.id} onClose={() => setShowDisappearingModal(false)} />}
      {showMuteModal && <MuteNotificationsModal chatId={activeChat.id} onClose={() => setShowMuteModal(false)} />}
      {showExportModal && <ChatExportModal onClose={() => setShowExportModal(false)} />}
      {showGallery && <MediaGallery onClose={() => setShowGallery(false)} />}
      {showStats && <ChatStatsDrawer onClose={() => setShowStats(false)} />}
      {showTranslate && <TranslationModal onClose={() => setShowTranslate(false)} />}
      {showLabels && <ChatLabelsModal chatId={activeChat.id} onClose={() => setShowLabels(false)} />}
    </>
  );
};
