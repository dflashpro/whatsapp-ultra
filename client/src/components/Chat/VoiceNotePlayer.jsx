import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export const VoiceNotePlayer = ({ audioUrl, duration = '0:05', isSender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setProgress((cur / dur) * 100);
    setCurrentTime(formatTime(cur));
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const toggleSpeed = (e) => {
    e.stopPropagation();
    const rates = [1, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  return (
    <div className="flex items-center gap-3 py-1 min-w-[240px] select-none">
      <audio 
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-md"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div 
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = clickPos * (audioRef.current.duration || 5);
          }}
          className="h-6 flex items-center gap-0.5 cursor-pointer"
        >
          {Array.from({ length: 28 }).map((_, i) => {
            const barHeight = 8 + ((i * 17) % 18);
            const isFilled = (i / 28) * 100 <= progress;
            return (
              <div 
                key={i}
                style={{ height: `${barHeight}px` }}
                className={`w-1 rounded-full transition-colors ${
                  isFilled 
                    ? isSender ? 'bg-[#00a884]' : 'bg-[#53bdeb]' 
                    : 'bg-[#8696a0]/40'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8696a0]">
          <span>{isPlaying ? currentTime : duration}</span>
          <button 
            onClick={toggleSpeed}
            className="px-1.5 py-0.5 rounded bg-[#202c33]/50 hover:bg-[#202c33] text-[10px] font-bold text-[#e9edef]"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};
