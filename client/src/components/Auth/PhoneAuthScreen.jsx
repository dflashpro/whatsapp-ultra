import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../config';
import { ShieldCheck, Phone, ArrowRight, Check, Sparkles, User, Camera, Lock, RefreshCw, Smartphone, Key, Copy } from 'lucide-react';

const COUNTRIES = [
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', placeholder: '77 123 4567' },
  { name: 'United States', code: '+1', flag: '🇺🇸', placeholder: '555 123 4567' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { name: 'India', code: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', placeholder: '416 123 4567' },
  { name: 'UAE', code: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
];

export const PhoneAuthScreen = ({ onAuthSuccess }) => {
  const { showToast, setUsers } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [name, setName] = useState('');
  const [about, setAbout] = useState('Hey there! I am using WhatsApp Ultra 🚀');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [loading, setLoading] = useState(false);

  const otpInputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const handleSendOtp = async () => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    if (!cleanNumber || cleanNumber.length < 6) {
      showToast('Please enter a valid phone number ⚠️');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.code} ${cleanNumber}`;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });
      const data = await res.json();
      const code = data.otp || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setStep(2);
      setResendCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      showToast(`🔑 Verification Code: ${code}`);
    } catch {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallbackCode);
      setStep(2);
      setResendCountdown(60);
      setCanResend(false);
      showToast(`🔑 Verification Code: ${fallbackCode}`);
    } finally {
      setLoading(false);
    }
  };

  const autoFillOtp = () => {
    const digits = generatedOtp.split('');
    setOtp(digits);
    verifyOtpCode(generatedOtp);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '') && index === 5) {
      verifyOtpCode(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtpCode = async (enteredCode = otp.join('')) => {
    if (enteredCode.length !== 6) {
      showToast('Please enter 6-digit code');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.code} ${phoneNumber.replace(/\s+/g, '')}`;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp: enteredCode })
      });
      const data = await res.json();

      if (data.success) {
        if (data.user && data.user.name) {
          localStorage.setItem('wa_current_user', JSON.stringify(data.user));
          onAuthSuccess(data.user);
          showToast(`Welcome back, ${data.user.name}! 👋✨`);
        } else {
          setStep(3);
        }
      } else if (enteredCode === generatedOtp || enteredCode === '123456') {
        setStep(3);
      } else {
        showToast('Incorrect code ❌');
      }
    } catch {
      if (enteredCode === generatedOtp || enteredCode === '123456') {
        setStep(3);
      } else {
        showToast('Incorrect code ❌ (Use on-screen code or 123456)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinishProfile = async () => {
    if (!name.trim()) {
      showToast('Please enter your name ⚠️');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.code} ${phoneNumber.replace(/\s+/g, '')}`;

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      phone: fullPhone,
      avatar,
      status: about.trim() || 'Hey there! I am using WhatsApp Ultra 🚀',
      online: true,
      lastSeen: Date.now()
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/setup-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      const userToSave = data.user || newUser;
      localStorage.setItem('wa_current_user', JSON.stringify(userToSave));
      setUsers(prev => [userToSave, ...prev.filter(u => u.id !== userToSave.id)]);
      onAuthSuccess(userToSave);
      showToast(`Welcome to WhatsApp Ultra, ${userToSave.name}! 🎉✨`);
    } catch {
      localStorage.setItem('wa_current_user', JSON.stringify(newUser));
      setUsers(prev => [newUser, ...prev]);
      onAuthSuccess(newUser);
      showToast(`Welcome, ${newUser.name}! 🚀`);
    } finally {
      setLoading(false);
    }
  };

  const AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0c1317] via-[#111b21] to-[#0c1317] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 text-[#e9edef] space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00a884] to-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-[#00a884]/30">
            <Smartphone size={28} className="text-black" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">WhatsApp Ultra</h1>
          <p className="text-xs text-[#8696a0]">
            {step === 1 && 'Verify your phone number to get started'}
            {step === 2 && `Enter the 6-digit code for ${selectedCountry.code} ${phoneNumber}`}
            {step === 3 && 'Provide your name and profile picture'}
          </p>
        </div>

        {/* STEP 1: Phone Number Input */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider block mb-1">Country / Region</label>
              <select
                value={selectedCountry.name}
                onChange={e => setSelectedCountry(COUNTRIES.find(c => c.name === e.target.value) || COUNTRIES[0])}
                className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl px-4 py-3 text-sm text-[#e9edef] focus:outline-none cursor-pointer"
              >
                {COUNTRIES.map(c => (
                  <option key={c.name} value={c.name} className="bg-[#111b21] text-white">
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider block mb-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="w-20 bg-black/40 border border-white/10 rounded-2xl px-3 py-3 text-sm font-mono text-[#00a884] flex items-center justify-center font-bold">
                  {selectedCountry.code}
                </div>
                <input
                  autoFocus
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  placeholder={selectedCountry.placeholder}
                  className="flex-1 bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl px-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#8696a0]">
              <ShieldCheck size={14} className="text-[#00a884] shrink-0" />
              <span>Instant Verification code will be generated on screen.</span>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <>Next <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {/* STEP 2: 6-Digit OTP Box + AUTO-FILL BANNER */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Auto Code Banner */}
            <div 
              onClick={autoFillOtp}
              className="p-3 bg-gradient-to-r from-emerald-950/80 to-[#00a884]/20 border border-[#00a884]/40 rounded-2xl cursor-pointer hover:border-[#00a884] transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00a884]/20 flex items-center justify-center text-[#00a884]">
                  <Key size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-[#8696a0] uppercase font-bold">Your Verification Code</p>
                  <p className="text-base font-black text-white tracking-widest">{generatedOtp}</p>
                </div>
              </div>
              <span className="text-[10px] bg-[#00a884] text-black font-extrabold px-2.5 py-1 rounded-lg group-hover:scale-105 transition-transform">
                Auto-Fill ⚡
              </span>
            </div>

            {/* 6 OTP input boxes */}
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => otpInputRefs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 bg-black/40 border-2 border-white/10 focus:border-[#00a884] rounded-xl text-center text-xl font-bold text-white focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <div className="text-center space-y-1.5">
              <p className="text-xs text-[#8696a0]">
                Didn't receive code?{' '}
                {canResend ? (
                  <button onClick={handleSendOtp} className="text-[#00a884] font-bold hover:underline">
                    Resend Code
                  </button>
                ) : (
                  <span className="text-[#8696a0]">Resend in {resendCountdown}s</span>
                )}
              </p>
              <button onClick={() => setStep(1)} className="text-[11px] text-[#53bdeb] hover:underline block mx-auto">
                Wrong number? Edit number
              </button>
            </div>

            <button
              onClick={() => verifyOtpCode()}
              disabled={loading || otp.some(d => d === '')}
              className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <>Verify & Continue <Check size={18} /></>}
            </button>
          </div>
        )}

        {/* STEP 3: Profile Setup */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative group cursor-pointer">
                <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-[#00a884]/40 shadow-xl" />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                {AVATARS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    onClick={() => setAvatar(av)}
                    className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition-all ${avatar === av ? 'border-[#00a884] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider block mb-1">Your Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Type your name here"
                maxLength={30}
                className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl px-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider block mb-1">About / Bio</label>
              <input
                type="text"
                value={about}
                onChange={e => setAbout(e.target.value)}
                placeholder="Hey there! I am using WhatsApp Ultra 🚀"
                maxLength={80}
                className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl px-4 py-2.5 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
            </div>

            <button
              onClick={handleFinishProfile}
              disabled={loading || !name.trim()}
              className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <>Finish & Start Chatting <Sparkles size={18} /></>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
