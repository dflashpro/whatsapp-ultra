import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Smile, Paperclip, Mic, Send, Image, FileText, Trash2, BarChart2, MapPin, Clock, X, Reply, Sticker, DollarSign, Radio, Edit3, Zap, User, Eye, ShoppingBag, Palette } from 'lucide-react';
import { CreatePollModal } from '../Polls/CreatePollModal';
import { ShareLocationModal } from './ShareLocationModal';
import { ScheduleMessageModal } from './ScheduleMessageModal';
import { StickerGifPicker } from './StickerGifPicker';
import { WhatsAppPayModal } from './WhatsAppPayModal';
import { BroadcastListModal } from './BroadcastListModal';
import { QuickRepliesPanel } from './QuickRepliesPanel';
import { ShareContactModal } from './ContactCardMessage';
import { ProductCatalogModal } from './ProductCatalogModal';

const COMMON_EMOJIS = ['😀','😂','😍','🔥','👍','🙏','🎉','❤️','😎','🥳','🤔','🚀','💯','✨','👌','🙌','🌟','🇱🇰','👏','💖','💪','🤝','☕','⚡','🤩','😇','💡','🎵','🏆','👀'];

const WALLPAPER_OPTIONS = [
  { id: 'doodle', label: 'WhatsApp Doodles', preview: '#1a2330' },
  { id: 'dark', label: 'Dark Clean', preview: '#111b21' },
  { id: 'gradient1', label: 'Ocean Gradient', preview: 'linear-gradient(135deg, #0f3460, #16213e)' },
  { id: 'gradient2', label: 'Emerald', preview: 'linear-gradient(135deg, #0a3d2e, #1a5c42)' },
];

export const MessageInput = ({ replyMessage, onClearReply, editingMessage, onClearEdit }) => {
  const { activeChat, showToast, setChatWallpaper } = useAuth();
  const { sendMessage, sendTyping, editMessage } = useSocket();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [viewOnceMode, setViewOnceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const attachRef = useRef(null);

  useEffect(() => {
    if (editingMessage) { setText(editingMessage.text || ''); inputRef.current?.focus(); }
  }, [editingMessage]);

  useEffect(() => {
    if (replyMessage) inputRef.current?.focus();
  }, [replyMessage]);

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false);
      if (attachRef.current && !attachRef.current.contains(e.target)) setShowAttachMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    if (editingMessage) {
      editMessage(editingMessage.id, text.trim());
      setText('');
      onClearEdit && onClearEdit();
      return;
    }
    sendMessage({
      text: text.trim(),
      type: 'text',
      replyTo: replyMessage ? replyMessage.text?.substring(0, 60) : undefined
    });
    setText('');
    onClearReply && onClearReply();
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    else sendTyping();
    if (e.key === 'Escape') {
      onClearReply && onClearReply();
      onClearEdit && onClearEdit();
      setText('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(`Uploading ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const isImg = file.type.startsWith('image/');
      sendMessage({ type: isImg ? 'image' : 'document', mediaUrl: data.url, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(1)} KB`, viewOnce: viewOnceMode && isImg });
      setShowAttachMenu(false);
      setViewOnceMode(false);
      showToast('Sent ✅');
    } catch { showToast('Upload failed'); }
    e.target.value = '';
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          sendMessage({ type: 'audio', mediaUrl: URL.createObjectURL(blob), audioDuration: `0:${String(recordingDuration).padStart(2, '0')}` });
        }
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch {
      sendMessage({ type: 'audio', mediaUrl: 'https://actions.google.com/sounds/v1/water/water_bubble_pop.ogg', audioDuration: '0:06' });
      showToast('Voice note recorded 🎙️');
    }
  };

  const stopVoiceRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  const isEditing = Boolean(editingMessage);

  const attachItems = [
    { icon: Image, label: `Photos${viewOnceMode ? ' (View Once ✓)' : ''}`, color: 'text-cyan-400', action: () => { fileInputRef.current.accept = 'image/*,video/*'; fileInputRef.current.click(); setShowAttachMenu(false); } },
    { icon: Eye, label: viewOnceMode ? '👁️ View Once: ON' : 'View Once Mode', color: viewOnceMode ? 'text-[#00a884]' : 'text-slate-400', action: () => { setViewOnceMode(!viewOnceMode); } },
    { icon: FileText, label: 'Document', color: 'text-indigo-400', action: () => { fileInputRef.current.accept = '*/*'; fileInputRef.current.click(); setShowAttachMenu(false); } },
    { icon: User, label: 'Share Contact', color: 'text-emerald-400', action: () => { setShowContactModal(true); setShowAttachMenu(false); } },
    { icon: BarChart2, label: 'Create Poll', color: 'text-[#00a884]', action: () => { setShowPollModal(true); setShowAttachMenu(false); } },
    { icon: MapPin, label: 'Share Location', color: 'text-rose-400', action: () => { setShowLocationModal(true); setShowAttachMenu(false); } },
    { icon: Clock, label: 'Schedule Message', color: 'text-amber-400', action: () => { setShowScheduleModal(true); setShowAttachMenu(false); } },
    { icon: DollarSign, label: 'Send Payment', color: 'text-emerald-400', action: () => { setShowPayModal(true); setShowAttachMenu(false); } },
    { icon: Radio, label: 'Broadcast', color: 'text-violet-400', action: () => { setShowBroadcastModal(true); setShowAttachMenu(false); } },
    { icon: ShoppingBag, label: 'Product Catalog', color: 'text-amber-400', action: () => { setShowCatalogModal(true); setShowAttachMenu(false); } },
    { icon: Palette, label: 'Chat Wallpaper', color: 'text-pink-400', action: () => { setShowWallpaperPicker(true); setShowAttachMenu(false); } },
  ];

  return (
    <div className="flex flex-col glass-header border-t border-white/5 shrink-0">
      {replyMessage && !isEditing && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-black/20">
          <Reply size={16} className="text-[#00a884] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#00a884]">Replying to message</p>
            <p className="text-xs text-[#8696a0] truncate">{replyMessage.text?.substring(0, 60) || '(media)'}</p>
          </div>
          <button onClick={onClearReply} className="p-1 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={15} /></button>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-violet-900/20">
          <Edit3 size={16} className="text-violet-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-violet-400">Editing message</p>
            <p className="text-xs text-[#8696a0] truncate">{editingMessage.text?.substring(0, 60)}</p>
          </div>
          <button onClick={() => { onClearEdit && onClearEdit(); setText(''); }} className="p-1 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={15} /></button>
        </div>
      )}

      <div className="p-3 flex items-center gap-2 relative">
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />

        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-black/50 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="text-sm font-bold text-red-400">Recording 0:{String(recordingDuration).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { audioChunksRef.current = []; mediaRecorderRef.current?.stop(); clearInterval(recordingTimerRef.current); setIsRecording(false); }} className="p-2 text-[#8696a0] hover:text-rose-400"><Trash2 size={19} /></button>
              <button onClick={stopVoiceRecording} className="p-2 bg-[#00a884] text-black rounded-full shadow-md"><Send size={18} /></button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative" ref={emojiRef}>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-[#8696a0] hover:text-[#e9edef]"><Smile size={22} /></button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 w-72 glass-modal rounded-3xl p-3 z-50 animate-in fade-in">
                  <p className="text-[10px] font-bold text-[#8696a0] uppercase mb-2">Quick Emojis</p>
                  <div className="grid grid-cols-6 gap-2">
                    {COMMON_EMOJIS.map(e => (
                      <button key={e} onClick={() => { setText(p => p + e); setShowEmojiPicker(false); }} className="text-xl p-1.5 hover:bg-white/10 rounded-xl hover:scale-125">{e}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="p-2 text-[#8696a0] hover:text-[#e9edef]" title="Stickers & GIFs"><Sticker size={22} /></button>
              {showStickerPicker && <StickerGifPicker onClose={() => setShowStickerPicker(false)} />}
            </div>

            <div className="relative">
              <button onClick={() => setShowQuickReplies(!showQuickReplies)} className="p-2 text-[#8696a0] hover:text-amber-400 transition-colors" title="Quick Replies"><Zap size={21} /></button>
              {showQuickReplies && <QuickRepliesPanel onSelect={(r) => setText(r)} onClose={() => setShowQuickReplies(false)} />}
            </div>

            <div className="relative" ref={attachRef}>
              <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-2 text-[#8696a0] hover:text-[#e9edef]"><Paperclip size={22} /></button>
              {showAttachMenu && (
                <div className="absolute bottom-12 left-0 w-56 glass-modal rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in max-h-72 overflow-y-auto">
                  {attachItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={item.action} className="w-full px-3 py-2 flex items-center gap-3 text-xs font-semibold text-[#e9edef] hover:bg-white/10 rounded-xl">
                        <Icon size={17} className={item.color} /> {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`flex-1 bg-black/30 rounded-2xl px-4 py-2.5 flex items-center border focus-within:border-[#00a884]/40 ${isEditing ? 'border-violet-500/40' : 'border-white/5'}`}>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEditing ? 'Edit message... (use *bold* _italic_ ~strike~ `code`)' : 'Type a message... (*bold* _italic_)'}
                className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
            </div>

            {text.trim() ? (
              <button onClick={handleSend} className={`p-2.5 text-black rounded-full shadow-md transition-all ${isEditing ? 'bg-violet-600 hover:bg-violet-500' : 'bg-[#00a884] hover:bg-[#008f6f]'}`}>
                {isEditing ? <Edit3 size={18} /> : <Send size={18} />}
              </button>
            ) : (
              <button onClick={startVoiceRecording} className="p-2 text-[#8696a0] hover:text-[#00a884]"><Mic size={22} /></button>
            )}
          </>
        )}
      </div>

      {/* Chat Wallpaper Picker popup */}
      {showWallpaperPicker && (
        <div className="absolute bottom-20 left-4 glass-modal rounded-2xl p-3 shadow-2xl z-50 w-64 animate-in fade-in">
          <p className="text-xs font-bold text-[#e9edef] mb-2 px-1">Chat Wallpaper</p>
          <div className="grid grid-cols-2 gap-2">
            {WALLPAPER_OPTIONS.map(w => (
              <button key={w.id} onClick={() => { setChatWallpaper(activeChat.id, w.id); setShowWallpaperPicker(false); }}
                className="rounded-xl overflow-hidden border border-white/10 hover:border-[#00a884] p-2 text-left transition-all">
                <div className="h-8 rounded-lg mb-1.5" style={{ background: w.preview }} />
                <p className="text-[10px] text-[#8696a0] font-medium">{w.label}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setShowWallpaperPicker(false)} className="mt-2 w-full text-[10px] text-[#8696a0] py-1 hover:text-white">Close</button>
        </div>
      )}

      {showPollModal && <CreatePollModal onClose={() => setShowPollModal(false)} />}
      {showLocationModal && <ShareLocationModal onClose={() => setShowLocationModal(false)} />}
      {showScheduleModal && <ScheduleMessageModal onClose={() => setShowScheduleModal(false)} />}
      {showPayModal && <WhatsAppPayModal onClose={() => setShowPayModal(false)} />}
      {showBroadcastModal && <BroadcastListModal onClose={() => setShowBroadcastModal(false)} />}
      {showContactModal && <ShareContactModal onClose={() => setShowContactModal(false)} />}
      {showCatalogModal && <ProductCatalogModal onClose={() => setShowCatalogModal(false)} />}
    </div>
  );
};
