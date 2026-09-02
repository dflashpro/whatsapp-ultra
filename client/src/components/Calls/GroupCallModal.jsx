import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mic, MicOff, Video, VideoOff, Phone, UserPlus, Crown } from 'lucide-react';

const generateSynthStream = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 320; canvas.height = 240;
  const ctx = canvas.getContext('2d');
  const drawFrame = () => {
    const hue = (Date.now() / 20) % 360;
    ctx.fillStyle = `hsl(${hue}, 30%, 15%)`;
    ctx.fillRect(0, 0, 320, 240);
    requestAnimationFrame(drawFrame);
  };
  drawFrame();
  return canvas.captureStream(30);
};

export const GroupCallModal = ({ group, onClose }) => {
  const { users, currentUser } = useAuth();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [participants, setParticipants] = useState([]);

  const members = (group?.members || []).slice(0, 8).map(id => users.find(u => u.id === id)).filter(Boolean);

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    // Simulate participants joining
    const joinTimer = setTimeout(() => {
      setParticipants(members.slice(0, 3));
    }, 1500);
    return () => { clearInterval(timer); clearTimeout(joinTimer); };
  }, []);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/40">
        <div>
          <h2 className="text-white font-bold text-base">{group?.name}</h2>
          <p className="text-[#00a884] text-xs">{formatDuration(duration)} • Group Call</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-full text-xs text-white">
          <UserPlus size={12} /> {members.length} participants
        </div>
      </div>

      {/* Participant Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
        {/* Self */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-900 aspect-video flex items-center justify-center ring-2 ring-[#00a884]">
          <img src={currentUser?.avatar} alt={currentUser?.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00a884]/50" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="text-[10px] text-white font-bold bg-black/50 px-1.5 py-0.5 rounded-md">You</span>
            <Crown size={10} className="text-amber-400" />
          </div>
          {!isMicOn && <div className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center"><MicOff size={10} className="text-white" /></div>}
        </div>

        {/* Group members */}
        {members.filter(m => m.id !== currentUser?.id).map((member, i) => {
          const isJoined = i < 2;
          return (
            <div key={member.id} className={`relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center ${isJoined ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-black/50 opacity-40'}`}>
              <img src={member.avatar} alt={member.name} className={`w-12 h-12 rounded-full object-cover transition-all ${isJoined ? 'ring-2 ring-white/20' : 'grayscale'}`} />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] text-white font-semibold bg-black/50 px-1.5 py-0.5 rounded-md">{member.name.split(' ')[0]}</span>
              </div>
              {!isJoined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-white/50">Calling...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-4 bg-black/40">
        <button onClick={() => setIsMicOn(!isMicOn)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isMicOn ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'}`}>
          {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button onClick={onClose} className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center shadow-xl">
          <Phone size={26} className="text-white rotate-135" />
        </button>
        <button onClick={() => setIsCameraOn(!isCameraOn)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isCameraOn ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'}`}>
          {isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
      </div>
    </div>
  );
};
