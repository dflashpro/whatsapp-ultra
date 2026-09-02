import React from 'react';
import { Lock, ShieldCheck, Laptop, PhoneCall, Video } from 'lucide-react';

export const EmptyChatState = () => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-[#222e35] text-center select-none border-b-8 border-[#00a884]">
      <div className="max-w-md flex flex-col items-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-[#111b21] flex items-center justify-center ring-8 ring-[#202c33] shadow-2xl">
          <Laptop size={44} className="text-[#00a884]" />
        </div>

        <h2 className="text-2xl font-light text-[#e9edef] mb-3">
          WhatsApp Web Pro
        </h2>
        <p className="text-sm text-[#8696a0] leading-relaxed mb-6">
          Send and receive messages without keeping your phone online. Use WhatsApp with full HD WebRTC Video Calls, Voice Notes, and Stories.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111b21]/70 rounded-full border border-[#2a3942] text-xs text-[#00a884]">
            <Video size={14} /> HD Video Calling
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111b21]/70 rounded-full border border-[#2a3942] text-xs text-[#53bdeb]">
            <PhoneCall size={14} /> Voice Notes & Calls
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111b21]/70 rounded-full border border-[#2a3942] text-xs text-amber-400">
            <ShieldCheck size={14} /> End-to-End Encrypted
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8696a0]">
          <Lock size={12} /> End-to-end encrypted
        </div>
      </div>
    </div>
  );
};
