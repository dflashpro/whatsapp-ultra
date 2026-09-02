import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';

export const ViewOnceMediaModal = ({ mediaUrl, onClose, onViewed }) => {
  const [viewed, setViewed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  useEffect(() => {
    if (viewed) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            onViewed && onViewed();
            onClose();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [viewed]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4">
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><X size={20} /></button>
      </div>

      {!viewed ? (
        <div className="flex flex-col items-center gap-6 text-white text-center p-8">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <Eye size={40} className="text-[#00a884]" />
          </div>
          <div>
            <h3 className="text-lg font-bold">View Once Photo</h3>
            <p className="text-sm text-white/60 mt-2 max-w-xs">This photo can only be viewed once. Once you open it, you have 15 seconds before it disappears forever.</p>
          </div>
          <button
            onClick={() => setViewed(true)}
            className="px-8 py-3 bg-[#00a884] text-black font-extrabold rounded-2xl hover:bg-[#008f6f] transition-all"
          >
            View Photo
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <img src={mediaUrl} alt="View once" className="max-w-full max-h-full object-contain" />

          {/* Countdown overlay */}
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/70 flex items-center justify-center border-2 border-[#00a884]">
            <span className="text-white font-black text-sm">{timeLeft}s</span>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="px-4 py-2 bg-black/70 rounded-full text-white text-xs flex items-center gap-2">
              <EyeOff size={14} className="text-rose-400" />
              This photo will disappear in {timeLeft}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ViewOncePlaceholder = ({ onOpen }) => (
  <div onClick={onOpen} className="flex items-center gap-3 p-2 cursor-pointer min-w-[160px]">
    <div className="w-12 h-12 rounded-xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center">
      <Eye size={22} className="text-[#00a884]" />
    </div>
    <div>
      <p className="text-xs font-bold text-[#e9edef]">Photo</p>
      <p className="text-[10px] text-[#8696a0] flex items-center gap-1"><Lock size={10} /> View once</p>
    </div>
  </div>
);
