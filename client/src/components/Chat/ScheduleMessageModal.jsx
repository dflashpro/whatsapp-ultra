import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Clock, Calendar, Send } from 'lucide-react';

export const ScheduleMessageModal = ({ onClose }) => {
  const { activeChat, currentUser, showToast } = useAuth();
  const [text, setText] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(1);

  const handleSchedule = async () => {
    if (!text.trim()) {
      showToast('Please enter message text');
      return;
    }

    try {
      const sendAt = Date.now() + (delayMinutes * 60 * 1000);
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: activeChat.id,
          text: text.trim(),
          sendAt
        })
      });
      showToast(`Message scheduled for ${delayMinutes} minute(s) from now! ⏰`);
      onClose();
    } catch (e) {
      showToast('Failed to schedule message');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl space-y-4 text-[#e9edef]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-amber-400" />
            <h2 className="text-base font-bold">Schedule Message</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-[#00a884] uppercase tracking-wider block mb-1.5">
            Message
          </label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to schedule..."
            rows={3}
            className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block">
            Send In
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 15, 60].map(m => (
              <button
                key={m}
                onClick={() => setDelayMinutes(m)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  delayMinutes === m ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]' : 'bg-white/5 border-transparent text-[#8696a0]'
                }`}
              >
                {m === 60 ? '1 Hour' : `${m} Min`}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSchedule}
          className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#00a884]/30 transition-transform active:scale-95"
        >
          <Calendar size={16} /> Schedule Message
        </button>
      </div>
    </div>
  );
};
