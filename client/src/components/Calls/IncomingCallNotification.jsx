import React from 'react';
import { useCall } from '../../context/CallContext';
import { Phone, PhoneOff, Video } from 'lucide-react';

export const IncomingCallNotification = () => {
  const { callState, callType, peerUser, acceptCall, rejectCall } = useCall();

  if (callState !== 'incoming' || !peerUser) return null;

  return (
    <div className="fixed top-6 right-6 z-50 w-84 sm:w-96 bg-[#202c33] border-2 border-[#00a884] rounded-2xl shadow-2xl p-4 text-[#e9edef] animate-bounce">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={peerUser.avatar} 
            alt={peerUser.name} 
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00a884] animate-ring-wave"
          />
          <span className="absolute bottom-0 right-0 p-1 bg-[#00a884] rounded-full text-black">
            {callType === 'video' ? <Video size={12} /> : <Phone size={12} />}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-[#e9edef] truncate">{peerUser.name}</h3>
          <p className="text-xs text-[#00a884] font-medium animate-pulse">
            Incoming WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call...
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#374248]">
        <button 
          onClick={rejectCall}
          className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-rose-600/30"
        >
          <PhoneOff size={15} /> Decline
        </button>

        <button 
          onClick={acceptCall}
          className="flex-1 py-2 px-3 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#00a884]/40"
        >
          {callType === 'video' ? <Video size={16} /> : <Phone size={16} />} Accept
        </button>
      </div>
    </div>
  );
};
