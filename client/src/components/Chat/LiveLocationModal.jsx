import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, Navigation, Radio, Check, MapPin } from 'lucide-react';

const DURATIONS = [
  { label: '15 Minutes', value: 15 },
  { label: '1 Hour', value: 60 },
  { label: '8 Hours', value: 480 },
];

export const LiveLocationModal = ({ onClose }) => {
  const { showToast } = useAuth();
  const { sendMessage } = useSocket();
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [comment, setComment] = useState('');

  const handleShare = () => {
    sendMessage({
      type: 'location',
      text: `📍 *Live Location* (${selectedDuration >= 60 ? (selectedDuration/60) + ' hr' : selectedDuration + ' min'})${comment ? `\n💬 ${comment}` : ''}`,
      locationData: {
        name: 'Live GPS Location (Active)',
        coords: '6.9271° N, 79.8612° E (Colombo)',
        isLive: true,
        durationMinutes: selectedDuration,
        startedAt: Date.now()
      }
    });
    showToast('Live location shared! 📍🛰️');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-[#00a884] animate-pulse" />
            <h2 className="text-sm font-bold">Share Live Location</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        {/* Radar Map Simulation */}
        <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-950 via-slate-900 to-cyan-950 border border-white/10 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-[#00a884]/30 animate-ping" />
          <div className="absolute w-16 h-16 rounded-full border border-[#00a884]/50 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center shadow-lg shadow-[#00a884]/50 z-10">
            <Navigation size={20} className="text-black transform -rotate-45" />
          </div>
          <div className="absolute bottom-2 left-3 text-[10px] text-white/70 font-mono">
            GPS Signal: High Accuracy • Realtime
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider block mb-2">Live Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setSelectedDuration(d.value)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedDuration === d.value
                    ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]'
                    : 'bg-white/5 border-transparent text-[#8696a0] hover:bg-white/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment (optional)..."
          className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-2.5 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
        />

        <button
          onClick={handleShare}
          className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2"
        >
          <Navigation size={16} /> Share Live Location
        </button>
      </div>
    </div>
  );
};
