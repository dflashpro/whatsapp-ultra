import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Palette } from 'lucide-react';

const BG_COLORS = ['#128c7e', '#075e54', '#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#14b8a6', '#6366f1'];

export const CreateStatusModal = ({ onClose, onCreated }) => {
  const { currentUser, showToast } = useAuth();
  const [mode, setMode] = useState('text');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handlePost = async () => {
    if (mode === 'text' && !content.trim()) return;
    if (mode === 'image' && !imageUrl.trim()) return;

    try {
      await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: mode,
          content: content.trim(),
          mediaUrl: imageUrl.trim(),
          caption: caption.trim(),
          bgColor
        })
      });
      showToast('Status posted successfully');
      onCreated();
    } catch (e) {
      console.error('Failed to post status:', e);
      showToast('Failed to post status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-6 backdrop-blur-md animate-in fade-in">
      <div className="flex items-center justify-between text-white z-20">
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
          <X size={24} />
        </button>

        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-full">
          <button 
            onClick={() => setMode('text')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${mode === 'text' ? 'bg-[#00a884] text-[#111b21]' : 'text-white'}`}
          >
            Text Status
          </button>
          <button 
            onClick={() => setMode('image')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${mode === 'image' ? 'bg-[#00a884] text-[#111b21]' : 'text-white'}`}
          >
            Photo Status
          </button>
        </div>

        {mode === 'text' && (
          <button 
            onClick={() => {
              const nextIdx = (BG_COLORS.indexOf(bgColor) + 1) % BG_COLORS.length;
              setBgColor(BG_COLORS[nextIdx]);
            }}
            className="p-2 hover:bg-white/20 rounded-full"
            title="Change background color"
          >
            <Palette size={22} />
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center my-4">
        {mode === 'text' ? (
          <div 
            style={{ backgroundColor: bgColor }}
            className="w-full max-w-md aspect-[9/16] max-h-[65vh] rounded-3xl p-8 flex items-center justify-center shadow-2xl transition-colors duration-300"
          >
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a status..."
              className="w-full bg-transparent text-white text-2xl sm:text-3xl font-bold text-center placeholder-white/60 focus:outline-none resize-none"
              rows={4}
            />
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col gap-4">
            <input 
              type="text" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL (e.g. https://...)"
              className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:outline-none border border-white/20 text-sm"
            />
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="max-h-60 rounded-xl object-cover shadow-2xl" />
            )}
            <input 
              type="text" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-2.5 rounded-xl focus:outline-none border border-white/20 text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end max-w-md mx-auto w-full z-20">
        <button 
          onClick={handlePost}
          className="px-6 py-3 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] rounded-full font-bold flex items-center gap-2 shadow-2xl transition-transform active:scale-95"
        >
          <Send size={18} /> Post Status
        </button>
      </div>
    </div>
  );
};
