import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, KeyRound, ShieldAlert } from 'lucide-react';

export const ChatLockModal = () => {
  const { showLockModal, setShowLockModal, pendingLockChat, unlockChatWithPin, showToast } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!showLockModal || !pendingLockChat) return null;

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Default PIN for VIP Lock is 1234
        if (nextPin === '1234') {
          unlockChatWithPin(pendingLockChat.id);
          setPin('');
          setError(false);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5 text-[#e9edef]">
        <button 
          onClick={() => setShowLockModal(false)}
          className="self-end p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884]">
          <Lock size={28} />
        </div>

        <div>
          <h2 className="text-lg font-bold">{pendingLockChat.name} is Locked</h2>
          <p className="text-xs text-[#8696a0] mt-1">Enter 4-Digit Security PIN (Default: 1234)</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-3">
          {[0, 1, 2, 3].map(i => (
            <span 
              key={i} 
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                error 
                  ? 'bg-rose-500 border-rose-500 animate-bounce' 
                  : i < pin.length 
                    ? 'bg-[#00a884] border-[#00a884] scale-110' 
                    : 'border-[#8696a0]/50'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 animate-pulse">Incorrect PIN. Try again</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleKeyPress(n.toString())}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 text-lg font-bold transition-transform active:scale-90"
            >
              {n}
            </button>
          ))}
          <button 
            onClick={() => setPin('')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-rose-400"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 text-lg font-bold transition-transform active:scale-90"
          >
            0
          </button>
          <button 
            onClick={() => setPin(prev => prev.slice(0, -1))}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-[#8696a0]"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};
