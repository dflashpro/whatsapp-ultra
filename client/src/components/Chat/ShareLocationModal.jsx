import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, MapPin, Navigation, Send, Check } from 'lucide-react';

const PRESET_PLACES = [
  { name: 'Galle Face Green, Colombo', coords: '6.9271° N, 79.8612° E', address: 'Colombo 03, Western Province' },
  { name: 'Colombo City Center', coords: '6.9147° N, 79.8553° E', address: 'Sir James Pieris Mawatha, Colombo' },
  { name: 'Kandy Lake Round', coords: '7.2906° N, 80.6337° E', address: 'Kandy, Central Province' },
  { name: 'World Trade Center, Colombo', coords: '6.9344° N, 79.8428° E', address: 'Echelon Square, Colombo 01' }
];

export const ShareLocationModal = ({ onClose }) => {
  const { showToast } = useAuth();
  const { sendMessage } = useSocket();
  const [selectedPlace, setSelectedPlace] = useState(PRESET_PLACES[0]);

  const handleShare = () => {
    sendMessage({
      type: 'location',
      text: `📍 Location: ${selectedPlace.name}`,
      locationData: selectedPlace
    });
    showToast('Location shared successfully! 📍');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl space-y-4 text-[#e9edef]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-[#00a884]" />
            <h2 className="text-base font-bold">Share Location</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]">
            <X size={18} />
          </button>
        </div>

        <div className="h-40 bg-gradient-to-tr from-emerald-950/60 via-[#0b141a] to-cyan-950/60 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-4 text-center space-y-2 relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#00a884]/20 border border-[#00a884] flex items-center justify-center text-[#00a884] animate-bounce">
            <Navigation size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{selectedPlace.name}</h4>
            <p className="text-[11px] font-mono text-[#00a884]">{selectedPlace.coords}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Nearby Places</p>
          {PRESET_PLACES.map((place, i) => (
            <div
              key={i}
              onClick={() => setSelectedPlace(place)}
              className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                selectedPlace.name === place.name ? 'bg-[#00a884]/15 border-[#00a884]' : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-white">{place.name}</p>
                <p className="text-[10px] text-[#8696a0]">{place.address}</p>
              </div>
              {selectedPlace.name === place.name && <Check size={16} className="text-[#00a884]" />}
            </div>
          ))}
        </div>

        <button 
          onClick={handleShare}
          className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#00a884]/30 transition-transform active:scale-95"
        >
          <Send size={16} /> Share This Location
        </button>
      </div>
    </div>
  );
};
