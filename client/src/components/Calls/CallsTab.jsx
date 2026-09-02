import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Link, Plus, Check, Copy } from 'lucide-react';

export const CallsTab = () => {
  const { users, currentUser, showToast } = useAuth();
  const { startCall } = useCall();
  const [calls, setCalls] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => setCalls(data))
      .catch(() => {});
  }, []);

  const callLink = 'https://call.whatsapp.com/v/ultra-4k-room-94';

  const copyLink = () => {
    navigator.clipboard.writeText(callLink);
    setCopied(true);
    showToast('Call Link copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-white/5 select-none">
      {/* Create Call Link Card */}
      <div 
        onClick={() => setShowLinkModal(true)}
        className="flex items-center gap-3.5 px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#00a884] text-black flex items-center justify-center shadow-lg shadow-[#00a884]/30">
          <Link size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#e9edef]">Create Call Link</h3>
          <p className="text-xs text-[#8696a0] truncate">Share a link for your WhatsApp 4K video call</p>
        </div>
      </div>

      {/* Recent Calls Section */}
      <div className="px-4 py-2">
        <p className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">Recent Calls</p>
      </div>

      {calls.map(call => {
        const isIncoming = call.status === 'incoming';
        const isMissed = call.status === 'missed';
        const isOutgoing = call.status === 'outgoing';
        const targetUser = users.find(u => u.id === (call.callerId === currentUser?.id ? call.receiverId : call.callerId)) || users[1];

        return (
          <div key={call.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3.5">
              <img src={targetUser?.avatar} alt={targetUser?.name} className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10" />
              <div>
                <h4 className={`text-sm font-bold ${isMissed ? 'text-rose-400' : 'text-[#e9edef]'}`}>
                  {targetUser?.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#8696a0] mt-0.5">
                  {isMissed && <PhoneMissed size={14} className="text-rose-400" />}
                  {isIncoming && <PhoneIncoming size={14} className="text-[#00a884]" />}
                  {isOutgoing && <PhoneOutgoing size={14} className="text-[#53bdeb]" />}
                  <span>{new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {call.duration || '00:00'}</span>
                </div>
              </div>
            </div>

            {/* 1-Click Redial Button */}
            <button 
              onClick={() => startCall(targetUser, call.callType)}
              className="p-2.5 hover:bg-white/10 rounded-full text-[#00a884] transition-transform active:scale-95"
              title={`Call back with ${call.callType}`}
            >
              {call.callType === 'video' ? <Video size={18} /> : <Phone size={18} />}
            </button>
          </div>
        );
      })}

      {/* Create Call Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl space-y-4 text-[#e9edef] text-center">
            <div className="w-14 h-14 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center mx-auto">
              <Link size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold">WhatsApp Call Link</h3>
              <p className="text-xs text-[#8696a0] mt-1">Anyone with WhatsApp can use this link to join your HD call.</p>
            </div>

            <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono text-[#00a884]">
              <span className="truncate">{callLink}</span>
              <button onClick={copyLink} className="p-1.5 hover:bg-white/10 rounded-lg text-white ml-2">
                {copied ? <Check size={16} className="text-[#00a884]" /> : <Copy size={16} />}
              </button>
            </div>

            <button 
              onClick={() => setShowLinkModal(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
