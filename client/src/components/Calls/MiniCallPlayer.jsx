import React, { useRef, useEffect } from 'react';
import { useCall } from '../../context/CallContext';
import { Maximize2, Mic, MicOff, PhoneOff, Video } from 'lucide-react';

export const MiniCallPlayer = () => {
  const { 
    callState, 
    callType, 
    peerUser, 
    remoteStream, 
    localStream, 
    isMinimized, 
    setIsMinimized, 
    isMuted, 
    toggleMute, 
    endCall,
    callDuration 
  } = useCall();

  const miniVideoRef = useRef(null);

  useEffect(() => {
    if (miniVideoRef.current) {
      miniVideoRef.current.srcObject = remoteStream || localStream;
    }
  }, [remoteStream, localStream, isMinimized]);

  if (callState === 'idle' || !isMinimized) return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 h-44 glass-modal rounded-3xl overflow-hidden shadow-2xl border border-[#00a884]/50 flex flex-col justify-between animate-in zoom-in-95 select-none">
      {/* Video / Avatar */}
      <div className="absolute inset-0 bg-[#080c10] flex items-center justify-center">
        {callType === 'video' && (remoteStream || localStream) ? (
          <video ref={miniVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <img src={peerUser?.avatar} alt={peerUser?.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00a884]" />
            <p className="text-xs font-bold text-white mt-1">{peerUser?.name}</p>
          </div>
        )}
      </div>

      {/* Top Floating Bar */}
      <div className="relative z-10 px-3 py-2 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
        <span className="text-[11px] font-mono font-bold bg-[#00a884]/30 px-2 py-0.5 rounded-full text-[#00a884]">
          {formatDuration(callDuration)}
        </span>
        <button 
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:bg-white/20 rounded-full"
          title="Maximize Call"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Bottom Floating Actions */}
      <div className="relative z-10 px-3 py-2 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-3">
        <button 
          onClick={toggleMute}
          className={`p-2 rounded-full ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/20 text-white'}`}
        >
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
        <button 
          onClick={endCall}
          className="p-2 bg-rose-600 text-white rounded-full shadow-lg"
        >
          <PhoneOff size={14} />
        </button>
      </div>
    </div>
  );
};
