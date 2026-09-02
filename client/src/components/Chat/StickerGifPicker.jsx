import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { X, Sparkles } from 'lucide-react';

const STICKER_PACKS = [
  { emoji: '😀', label: 'Happy' },
  { emoji: '😂', label: 'LOL' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👍', label: 'OK' },
  { emoji: '🙏', label: 'Thanks' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '💯', label: '100' },
  { emoji: '🤔', label: 'Think' },
  { emoji: '😭', label: 'Cry' },
  { emoji: '🥳', label: 'Yay' },
  { emoji: '🚀', label: 'Go' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '🤝', label: 'Deal' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🇱🇰', label: 'SL' },
  { emoji: '😇', label: 'Angel' },
  { emoji: '🏆', label: 'Win' },
  { emoji: '💡', label: 'Idea' },
  { emoji: '⚡', label: 'Zap' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '✨', label: 'Magic' }
];

const GIFS = [
  { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', label: 'Happy Dance' },
  { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', label: 'Thumbs Up' },
  { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', label: 'Excited' },
  { url: 'https://media.giphy.com/media/xT9IgG50Lg7russbDa/giphy.gif', label: 'Cat Yes' },
  { url: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif', label: 'Oh Yeah' },
  { url: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif', label: 'Mind Blown' },
];

export const StickerGifPicker = ({ onClose }) => {
  const { sendMessage } = useSocket();
  const [tab, setTab] = useState('stickers');

  const sendSticker = (sticker) => {
    sendMessage({ type: 'text', text: sticker.emoji + ' ' + sticker.label });
    onClose();
  };

  const sendGif = (gif) => {
    sendMessage({ type: 'image', mediaUrl: gif.url, text: gif.label });
    onClose();
  };

  return (
    <div className="absolute bottom-16 left-0 w-80 glass-modal rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex gap-2">
          <button onClick={() => setTab('stickers')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${tab === 'stickers' ? 'bg-[#00a884] text-black' : 'text-[#8696a0] hover:text-white'}`}>Stickers</button>
          <button onClick={() => setTab('gifs')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${tab === 'gifs' ? 'bg-[#00a884] text-black' : 'text-[#8696a0] hover:text-white'}`}>GIFs</button>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={16} /></button>
      </div>

      <div className="p-3 max-h-56 overflow-y-auto">
        {tab === 'stickers' ? (
          <div className="grid grid-cols-6 gap-2">
            {STICKER_PACKS.map((s, i) => (
              <button key={i} onClick={() => sendSticker(s)} title={s.label} className="text-2xl p-1.5 hover:bg-white/10 rounded-xl hover:scale-125 transition-all">{s.emoji}</button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {GIFS.map((g, i) => (
              <button key={i} onClick={() => sendGif(g)} className="rounded-xl overflow-hidden hover:scale-105 transition-transform border border-white/10">
                <img src={g.url} alt={g.label} className="w-full h-20 object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
