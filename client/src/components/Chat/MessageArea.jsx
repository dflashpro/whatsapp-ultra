import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Check, CheckCheck, Lock, Download, ChevronDown, BarChart2, MapPin, Star, Reply, Forward, Trash2, Timer, Eye } from 'lucide-react';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { MediaPreviewModal } from './MediaPreviewModal';
import { MessageContextMenu } from './MessageContextMenu';
import { ForwardMessageModal } from './ForwardMessageModal';
import { DeleteMessageModal } from './DeleteMessageModal';
import { MessageInfoDrawer } from './MessageInfoDrawer';
import { MultiSelectBar } from './MultiSelectBar';
import { TypingBubble } from './TypingBubble';
import { DateSeparator } from './DateSeparator';
import { FormattedText } from './FormattedText';
import { LinkPreviewCard } from './LinkPreviewCard';
import { ViewOnceMediaModal, ViewOncePlaceholder } from './ViewOnceMediaModal';
import { ContactCardBubble } from './ContactCardMessage';
import confetti from 'canvas-confetti';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const URL_RE = /https?:\/\/[^\s]+/;

const isSameDay = (ts1, ts2) => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

export const MessageArea = ({ onReply, replyMessage, setReplyMessage, showSearch, highlightedMsgId }) => {
  const { currentUser, activeChat, users, wallpaper, perChatWallpapers, starredMessages, toggleStarMessage, disappearingSettings } = useAuth();
  const { messages, reactToMessage, socket, deleteMessage } = useSocket();
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const msgRefs = useRef({});

  const [previewMedia, setPreviewMedia] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [viewOnceMsg, setViewOnceMsg] = useState(null);
  const [viewedOnce, setViewedOnce] = useState({});

  const isMultiSelecting = selectedMsgs.length > 0;
  const isGroup = Boolean(activeChat?.isGroup);
  const chatId = isGroup ? activeChat?.id : [currentUser?.id, activeChat?.id].sort().join('-');
  const disappearing = disappearingSettings?.[activeChat?.id];
  const activeWallpaper = perChatWallpapers?.[activeChat?.id] || wallpaper;

  const currentMessages = messages.filter(m => {
    if (m.deletedForMe && m.senderId !== currentUser?.id) return false;
    if (!activeChat || !currentUser) return false;
    if (isGroup) return m.receiverId === activeChat.id || m.chatId === activeChat.id;

    // Direct ID match
    if ((m.senderId === currentUser.id && m.receiverId === activeChat.id) ||
        (m.senderId === activeChat.id && m.receiverId === currentUser.id)) {
      return true;
    }

    const mChatId = [m.senderId, m.receiverId].sort().join('-');
    if (mChatId === chatId || m.chatId === chatId) return true;

    // Phone fallback match
    const cPhone = currentUser.phone ? currentUser.phone.replace(/\s+/g, '') : '';
    const aPhone = activeChat.phone ? activeChat.phone.replace(/\s+/g, '') : '';
    if (cPhone && aPhone) {
      if ((m.chatId && m.chatId.includes(cPhone) && m.chatId.includes(aPhone)) ||
          (m.senderId && m.receiverId && [m.senderId, m.receiverId].some(x => x.includes(cPhone)) && [m.senderId, m.receiverId].some(x => x.includes(aPhone)))) {
        return true;
      }
    }
    return false;
  });

  const scrollToBottom = (b = 'smooth') => bottomRef.current?.scrollIntoView({ behavior: b });

  useEffect(() => { scrollToBottom('auto'); setSelectedMsgs([]); }, [chatId]);
  useEffect(() => { scrollToBottom('smooth'); }, [currentMessages.length]);

  useEffect(() => {
    if (highlightedMsgId && msgRefs.current[highlightedMsgId]) {
      msgRefs.current[highlightedMsgId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedMsgId]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 200);
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({ msg, position: { x: e.clientX, y: e.clientY } });
  };

  const toggleSelectMsg = (msgId) => {
    setSelectedMsgs(prev => prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]);
  };

  const handleReaction = (msgId, emoji) => {
    reactToMessage(msgId, emoji);
    if (emoji === '❤️') confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  const handleVotePoll = (msgId, optionId) => {
    if (socket && currentUser) {
      socket.emit('vote-poll', { messageId: msgId, optionId, userId: currentUser.id, chatId });
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <>
      {isMultiSelecting && (
        <MultiSelectBar
          selectedCount={selectedMsgs.length}
          onCancel={() => setSelectedMsgs([])}
          onDeleteAll={() => { selectedMsgs.forEach(id => deleteMessage(id, 'me')); setSelectedMsgs([]); }}
          onForwardAll={() => { const first = messages.find(m => m.id === selectedMsgs[0]); setForwardMsg(first); setSelectedMsgs([]); }}
          onStarAll={() => { selectedMsgs.forEach(id => toggleStarMessage(id)); setSelectedMsgs([]); }}
        />
      )}

      <div ref={scrollContainerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative wa-wallpaper-${activeWallpaper}`}>
        <div className="flex justify-center mb-2">
          <div className="glass-card text-[#ffd279] text-xs px-4 py-2 rounded-2xl shadow-sm max-w-md text-center flex items-center gap-2 select-none border border-amber-500/20">
            <Lock size={14} className="shrink-0 text-amber-400" />
            <span>End-to-end encrypted{disappearing && disappearing !== 'off' ? ` • Disappearing: ${disappearing}` : ''}</span>
          </div>
        </div>

        {currentMessages.map((msg, index) => {
          const isSender = msg.senderId === currentUser?.id;
          const senderUser = isGroup ? users.find(u => u.id === msg.senderId) : null;
          const hasReactions = msg.reactions && msg.reactions.length > 0;
          const isStarred = starredMessages.includes(msg.id);
          const isSelected = selectedMsgs.includes(msg.id);
          const isHighlighted = highlightedMsgId === msg.id;
          const prevMsg = currentMessages[index - 1];
          const showDateSep = !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp);
          const hasLink = msg.type === 'text' && URL_RE.test(msg.text || '');
          const linkUrl = hasLink ? msg.text.match(URL_RE)?.[0] : null;
          const isViewOnce = msg.viewOnce;
          const wasViewed = viewedOnce[msg.id];

          if (msg.deletedForMe && msg.senderId === currentUser?.id) return null;
          if (msg.deleted || msg.type === 'deleted') {
            return (
              <div key={msg.id}>
                {showDateSep && <DateSeparator timestamp={msg.timestamp} />}
                <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                  <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-[#8696a0] text-xs italic flex items-center gap-2">
                    <Trash2 size={13} /> This message was deleted
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id || index}>
              {showDateSep && <DateSeparator timestamp={msg.timestamp} />}
              <div
                ref={el => { if (el) msgRefs.current[msg.id] = el; }}
                className={`flex flex-col group ${isSender ? 'items-end' : 'items-start'} relative mb-1`}
                onClick={() => isMultiSelecting && toggleSelectMsg(msg.id)}
                onContextMenu={(e) => !isMultiSelecting && handleContextMenu(e, msg)}
              >
                {isMultiSelecting && (
                  <div className={`absolute ${isSender ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#00a884] border-[#00a884] text-black' : 'border-[#8696a0]'}`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-lg relative transition-all ${isSelected ? 'ring-2 ring-[#00a884]' : ''} ${isHighlighted ? 'ring-2 ring-amber-400/70' : ''} ${isSender ? 'bg-gradient-to-r from-[#005c4b] to-[#00705a] text-[#e9edef] rounded-tr-none' : 'glass-card text-[#e9edef] rounded-tl-none'}`}>
                  {isGroup && !isSender && (
                    <p className="text-xs font-bold text-[#53bdeb] mb-1">{senderUser?.name || 'Member'}</p>
                  )}

                  {msg.replyTo && (
                    <div className="mb-2 p-2 rounded-lg bg-black/30 border-l-2 border-[#00a884] text-[10px] text-[#8696a0] truncate">
                      ↩ {msg.replyTo}
                    </div>
                  )}

                  {msg.forwarded && (
                    <div className="flex items-center gap-1 mb-1 text-[10px] text-[#8696a0] italic">
                      <Forward size={11} /> Forwarded
                    </div>
                  )}

                  {/* Message Content */}
                  {msg.type === 'text' && (
                    <div className="pr-12">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        <FormattedText text={msg.text} />
                      </p>
                      {linkUrl && <LinkPreviewCard url={linkUrl} />}
                    </div>
                  )}

                  {msg.type === 'poll' && msg.pollData && (
                    <div className="space-y-3 min-w-[260px] py-1">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                        <BarChart2 size={18} className="text-[#00a884]" />
                        <h4 className="text-sm font-bold">{msg.pollData.question}</h4>
                      </div>
                      <div className="space-y-2">
                        {msg.pollData.options.map(opt => {
                          const total = msg.pollData.options.reduce((a, o) => a + o.votes.length, 0);
                          const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                          const voted = opt.votes.includes(currentUser?.id);
                          return (
                            <div key={opt.id} onClick={() => handleVotePoll(msg.id, opt.id)} className={`p-2.5 rounded-xl border cursor-pointer relative overflow-hidden transition-all ${voted ? 'bg-[#00a884]/20 border-[#00a884]' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}>
                              <div style={{ width: `${pct}%` }} className="absolute inset-0 bg-[#00a884]/25 transition-all duration-500 rounded-xl" />
                              <div className="relative z-10 flex items-center justify-between text-xs">
                                <span className="font-semibold">{opt.text}</span>
                                <span className="font-bold font-mono text-[#00a884]">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-[#8696a0] text-right">Tap option to vote</p>
                    </div>
                  )}

                  {msg.type === 'location' && msg.locationData && (
                    <div className="h-28 bg-gradient-to-tr from-emerald-950 via-black/40 to-cyan-950 rounded-xl border border-white/10 flex flex-col items-center justify-center p-3 text-center min-w-[200px]">
                      <MapPin size={24} className="text-rose-400 animate-bounce" />
                      <p className="text-xs font-bold text-white mt-1">{msg.locationData.name}</p>
                      <p className="text-[10px] font-mono text-[#00a884]">{msg.locationData.coords}</p>
                    </div>
                  )}

                  {msg.type === 'image' && !isViewOnce && (
                    <div className="space-y-1.5">
                      <img src={msg.mediaUrl} alt="attachment" onClick={() => setPreviewMedia({ type: 'image', url: msg.mediaUrl })} className="rounded-lg max-h-72 w-full object-cover cursor-pointer hover:opacity-90" />
                      {msg.text && <p className="text-sm pt-1"><FormattedText text={msg.text} /></p>}
                    </div>
                  )}

                  {msg.type === 'image' && isViewOnce && !wasViewed && (
                    <ViewOncePlaceholder onOpen={() => setViewOnceMsg(msg)} />
                  )}

                  {msg.type === 'image' && isViewOnce && wasViewed && (
                    <div className="flex items-center gap-2 text-[#8696a0] text-xs px-1 py-1">
                      <Eye size={14} /> Photo opened
                    </div>
                  )}

                  {msg.type === 'audio' && <VoiceNotePlayer audioUrl={msg.mediaUrl} duration={msg.audioDuration} isSender={isSender} />}

                  {msg.type === 'document' && (
                    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg pr-12">
                      <div className="w-10 h-10 rounded bg-[#00a884]/20 flex items-center justify-center text-[#00a884]"><Download size={20} /></div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{msg.fileName || 'Document'}</p>
                        <p className="text-[10px] text-[#8696a0]">{msg.fileSize}</p>
                      </div>
                    </div>
                  )}

                  {msg.type === 'contact' && msg.contactData && (
                    <ContactCardBubble contactData={msg.contactData} />
                  )}

                  {/* Timestamp + status */}
                  <div className="flex items-center justify-end gap-1 float-right ml-2 mt-1 text-[11px] text-[#8696a0]">
                    {isStarred && <Star size={12} className="text-amber-400 fill-amber-400" />}
                    {msg.edited && <span className="text-[10px] italic">edited</span>}
                    <span>{formatTime(msg.timestamp)}</span>
                    {isSender && (
                      msg.status === 'read'
                        ? <CheckCheck size={14} className="text-[#53bdeb]" />
                        : <Check size={14} className="text-[#8696a0]" />
                    )}
                  </div>

                  {hasReactions && (
                    <div className="absolute -bottom-3 right-3 flex items-center gap-0.5 bg-[#182229] border border-[#2a3942] rounded-full px-1.5 py-0.5 shadow-lg text-xs">
                      {Array.from(new Set(msg.reactions.map(r => r.reaction))).map((e, i) => <span key={i}>{e}</span>)}
                      {msg.reactions.length > 1 && <span className="text-[10px] text-[#8696a0] ml-0.5">{msg.reactions.length}</span>}
                    </div>
                  )}
                </div>

                {/* Quick hover actions */}
                {!isMultiSelecting && (
                  <div className={`hidden group-hover:flex items-center gap-1.5 glass-modal rounded-full px-2.5 py-1 shadow-2xl absolute -top-8 ${isSender ? 'right-2' : 'left-2'} z-10 animate-in fade-in`}>
                    {EMOJI_REACTIONS.map(emoji => (
                      <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="hover:scale-125 transition-transform text-sm p-0.5">{emoji}</button>
                    ))}
                    <div className="w-px h-3 bg-white/20 my-auto" />
                    <button onClick={() => onReply && onReply(msg)} className="p-0.5 text-[#8696a0] hover:text-[#00a884]"><Reply size={13} /></button>
                    <button onClick={() => setForwardMsg(msg)} className="p-0.5 text-[#8696a0] hover:text-[#53bdeb]"><Forward size={13} /></button>
                    <button onClick={() => toggleStarMessage(msg.id)} className={`p-0.5 ${isStarred ? 'text-amber-400' : 'text-[#8696a0] hover:text-amber-400'}`}>
                      <Star size={13} fill={isStarred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ANIMATED TYPING BUBBLE */}
        <TypingBubble />

        <div ref={bottomRef} />

        {showScrollBottom && (
          <button onClick={() => scrollToBottom('smooth')} className="fixed bottom-24 right-8 w-10 h-10 glass-modal border border-[#00a884] text-[#00a884] rounded-full shadow-2xl flex items-center justify-center z-20">
            <ChevronDown size={20} />
          </button>
        )}

        {previewMedia && <MediaPreviewModal media={previewMedia} onClose={() => setPreviewMedia(null)} />}

        {viewOnceMsg && (
          <ViewOnceMediaModal
            mediaUrl={viewOnceMsg.mediaUrl}
            onClose={() => setViewOnceMsg(null)}
            onViewed={() => setViewedOnce(prev => ({ ...prev, [viewOnceMsg.id]: true }))}
          />
        )}
      </div>

      {contextMenu && (
        <MessageContextMenu
          msg={contextMenu.msg}
          isSender={contextMenu.msg.senderId === currentUser?.id}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onReply={(m) => onReply && onReply(m)}
          onForward={(m) => setForwardMsg(m)}
          onDelete={(m, mode) => setDeleteMsg({ msg: m, mode })}
          onEdit={(m) => {}}
          onStar={(id) => toggleStarMessage(id)}
          onCopy={(t) => navigator.clipboard.writeText(t || '')}
          onInfo={(m) => setInfoMsg(m)}
          isStarred={starredMessages.includes(contextMenu.msg?.id)}
        />
      )}

      {forwardMsg && <ForwardMessageModal message={forwardMsg} onClose={() => setForwardMsg(null)} />}
      {deleteMsg && <DeleteMessageModal message={deleteMsg.msg} isSender={deleteMsg.msg.senderId === currentUser?.id} onClose={() => setDeleteMsg(null)} />}
      {infoMsg && (
        <div className="fixed inset-y-0 right-0 z-50 animate-in slide-in-from-right">
          <MessageInfoDrawer message={infoMsg} onClose={() => setInfoMsg(null)} />
        </div>
      )}
    </>
  );
};
