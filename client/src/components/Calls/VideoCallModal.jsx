import React, { useRef, useEffect } from 'react';
import { useCall } from '../../context/CallContext';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MonitorUp, 
  Minimize2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const REACTION_EMOJIS = ['❤️', '🔥', '👏', '🎉', '😂', '👍'];

export const VideoCallModal = () => {
  const {
    callState,
    callType,
    peerUser,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isMinimized,
    setIsMinimized,
    callReactions,
    sendCallReaction,
    callDuration,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isMinimized]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isMinimized]);

  if (callState === 'idle' || callState === 'incoming' || isMinimized) return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080d11] flex flex-col justify-between overflow-hidden animate-in fade-in select-none">
      {/* Top Header */}
      <div className="h-16 px-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-[#e9edef] z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs text-[#00a884] border border-white/10">
            <ShieldCheck size={14} />
            <span>4K Ultra HD • Encrypted</span>
          </div>
          <span className="text-sm font-mono text-[#aebac1]">
            {callState === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Minimize to Picture-in-Picture"
          >
            <Minimize2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {remoteStream && callType === 'video' ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <img 
              src={peerUser?.avatar} 
              alt={peerUser?.name} 
              className="w-36 h-36 rounded-full object-cover ring-4 ring-[#00a884] shadow-2xl animate-ring-wave"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#e9edef]">{peerUser?.name}</h2>
              <p className="text-sm text-[#00a884] font-medium mt-1">
                {callState === 'connected' ? 'Connected • Studio Audio' : 'Calling...'}
              </p>
            </div>
          </div>
        )}

        {/* Local Pip */}
        {callType === 'video' && (
          <div className="absolute bottom-24 right-6 w-48 sm:w-60 h-36 sm:h-44 glass-modal rounded-2xl overflow-hidden border-2 border-[#00a884]/60 shadow-2xl z-20">
            {isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-[#8696a0] gap-1 bg-black/60">
                <VideoOff size={22} className="text-rose-400" />
                <span>Camera Off</span>
              </div>
            ) : (
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-bold">
              You
            </div>
          </div>
        )}

        {/* Floating Call Reactions Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          {callReactions.map(r => (
            <span key={r.id} className="text-5xl animate-float-up absolute">
              {r.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Floating Controls Bar */}
      <div className="h-28 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center justify-center gap-3 z-20">
        {/* In-Call Reactions Bar */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => sendCallReaction(emoji)}
              className="text-lg hover:scale-125 transition-transform px-1.5"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-rose-500 text-white' : 'glass-card text-[#e9edef] hover:bg-white/15'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {callType === 'video' && (
            <button 
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoOff ? 'bg-rose-500 text-white' : 'glass-card text-[#e9edef] hover:bg-white/15'
              }`}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}

          <button 
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing ? 'bg-[#00a884] text-black font-bold' : 'glass-card text-[#e9edef] hover:bg-white/15'
            }`}
          >
            <MonitorUp size={20} />
          </button>

          <button 
            onClick={endCall}
            className="w-13 h-13 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
