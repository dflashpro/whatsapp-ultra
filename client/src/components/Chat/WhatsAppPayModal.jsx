import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, DollarSign, Send, ShieldCheck, CreditCard, Check } from 'lucide-react';

export const WhatsAppPayModal = ({ onClose }) => {
  const { currentUser, activeChat, showToast } = useAuth();
  const { sendMessage } = useSocket();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');

  const handleSend = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount');
      return;
    }
    setStep(2);
  };

  const confirmPayment = () => {
    if (pin !== '1234') {
      showToast('Incorrect payment PIN ❌');
      return;
    }
    sendMessage({
      type: 'text',
      text: `💸 *WhatsApp Pay* sent LKR ${parseFloat(amount).toLocaleString()}${note ? `\n📝 ${note}` : ''}`
    });
    showToast(`LKR ${parseFloat(amount).toLocaleString()} sent to ${activeChat?.name}! 💸`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">{step === 1 ? 'Send Money' : 'Confirm Payment'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Recipient */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
              <img src={activeChat?.avatar} alt={activeChat?.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold">{activeChat?.name}</p>
                <p className="text-[10px] text-[#8696a0]">WhatsApp Ultra Pay Recipient</p>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider block mb-1.5">Amount (LKR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8696a0]">Rs.</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-[#e9edef] placeholder-[#8696a0] focus:outline-none text-center"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 2500].map(q => (
                  <button key={q} onClick={() => setAmount(q.toString())} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${amount === q.toString() ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]' : 'bg-white/5 border-transparent text-[#8696a0]'}`}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
            />

            <div className="flex items-center gap-2 text-[10px] text-[#8696a0]">
              <ShieldCheck size={13} className="text-[#00a884]" /> End-to-end encrypted payment
            </div>

            <button onClick={handleSend} className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2">
              <Send size={16} /> Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gradient-to-br from-[#00a884]/20 to-cyan-500/10 rounded-2xl border border-[#00a884]/30 text-center">
              <p className="text-2xl font-black text-white">LKR {parseFloat(amount).toLocaleString()}</p>
              <p className="text-xs text-[#8696a0] mt-1">to {activeChat?.name}</p>
              {note && <p className="text-xs text-[#00a884] mt-1">📝 {note}</p>}
            </div>

            {/* PIN Entry */}
            <div>
              <label className="text-[10px] font-bold text-[#8696a0] block mb-1.5 text-center">Enter Payment PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                maxLength={4}
                placeholder="••••"
                className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
              <p className="text-[10px] text-center text-[#8696a0] mt-1">Default PIN: 1234</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-white/10 rounded-xl text-xs font-bold">Back</button>
              <button onClick={confirmPayment} className="flex-1 py-2.5 bg-[#00a884] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5">
                <Check size={15} /> Confirm Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
