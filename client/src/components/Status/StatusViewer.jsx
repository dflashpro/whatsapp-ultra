import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const StatusViewer = ({ user, statuses, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const currentStatus = statuses[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const interval = 50;
    const totalTime = 5000;
    const step = (interval / totalTime) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex(c => c + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused, statuses.length, onClose]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentStatus) return null;

  return (
    <div 
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none animate-in fade-in"
    >
      <div className="flex items-center gap-1.5 z-20">
        {statuses.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
              }}
              className="h-full bg-white transition-all duration-75"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 text-white z-20">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/50" />
          <div>
            <h3 className="text-sm font-semibold">{user.name}</h3>
            <p className="text-[11px] text-white/70">
              {new Date(currentStatus.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative my-4">
        <button 
          onClick={handlePrev} 
          className="absolute left-4 p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors z-20"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext} 
          className="absolute right-4 p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors z-20"
        >
          <ChevronRight size={24} />
        </button>

        {currentStatus.type === 'image' ? (
          <div className="flex flex-col items-center max-h-[75vh]">
            <img 
              src={currentStatus.mediaUrl} 
              alt="status" 
              className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {currentStatus.caption && (
              <p className="mt-4 text-white text-base font-medium px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-center max-w-md">
                {currentStatus.caption}
              </p>
            )}
          </div>
        ) : (
          <div 
            style={{ backgroundColor: currentStatus.bgColor || '#128c7e' }}
            className="w-full max-w-md aspect-[9/16] max-h-[70vh] rounded-3xl p-8 flex items-center justify-center text-center shadow-2xl"
          >
            <p className="text-2xl sm:text-3xl font-bold text-white leading-relaxed whitespace-pre-wrap">
              {currentStatus.content}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 max-w-md mx-auto w-full z-20">
        <input 
          type="text" 
          placeholder="Reply to status..."
          className="flex-1 bg-white/20 placeholder-white/60 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
        />
        <button className="p-2 text-rose-400 hover:scale-125 transition-transform">
          <Heart size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};
