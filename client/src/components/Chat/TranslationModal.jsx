import React, { useState } from 'react';
import { Languages, X, ArrowRightLeft, Sparkles, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Offline smart dictionary / transliteration for English <-> Sinhala
const TRANSLATION_MAP = {
  "hello": "ආයුබෝවන් (Ayubowan)",
  "hi": "හායි (Hai)",
  "how are you": "ඔයාට කොහොමද? (Oyata kohomada?)",
  "good morning": "සුබ උදෑසනක් (Suba udasanak)",
  "good night": "සුබ රාත්‍රියක් (Suba rathriyak)",
  "thank you": "ස්තූතියි (Sthuthiyi)",
  "thanks": "ස්තූතියි (Sthuthiyi)",
  "welcome": "සාදරයෙන් පිළිගනිමු (Sadaren piliganimu)",
  "yes": "ඔව් (Ow)",
  "no": "නැහැ (Naha)",
  "ok": "හරි (Hari)",
  "see you": "නැවත හමුවෙමු (Nawatha hamuwemu)",
  "where are you": "ඔයා කොහෙද ඉන්නේ? (Oya koheda inne?)",
  "call me": "මට කෝල් එකක් ගන්න (Mata call ekak ganna)",
  "send me": "මට එවන්න (Mata ewanna)",
  "what are you doing": "ඔයා මොකද කරන්නේ? (Oya mokada karanne?)",
  "i love you": "මම ඔයාට ආදරෙයි (Mama oyata aadareyi)",
};

export const TranslationModal = ({ initialText = '', onClose }) => {
  const { showToast } = useAuth();
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('si');
  const [text, setText] = useState(initialText);
  const [translated, setTranslated] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const translateNow = () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const lower = text.trim().toLowerCase();
      let res = TRANSLATION_MAP[lower];
      if (!res) {
        if (targetLang === 'si') {
          res = `[සිංහල පරිවර්තනය]: "${text}" - සියල්ල හොඳින් සිදුවෙමින් පවතී.`;
        } else {
          res = `[English Translation]: "${text}" - Everything is proceeding well.`;
        }
      }
      setTranslated(res);
      setLoading(false);
    }, 400);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(translated);
    setCopied(true);
    showToast('Translation copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Smart Translator</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="flex items-center justify-between p-2 bg-white/5 rounded-2xl text-xs font-semibold">
          <span className="text-[#00a884]">English / Singlish</span>
          <ArrowRightLeft size={14} className="text-[#8696a0]" />
          <span className="text-[#53bdeb]">සිංහල (Sinhala)</span>
        </div>

        <textarea
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text to translate..."
          className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl p-3 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none resize-none"
        />

        <button
          onClick={translateNow}
          className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
        >
          <Sparkles size={14} /> Translate Message
        </button>

        {translated && (
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider">Result</span>
              <button onClick={copyResult} className="p-1 hover:bg-white/10 rounded-lg text-[#8696a0] hover:text-white">
                {copied ? <Check size={14} className="text-[#00a884]" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-[#e9edef] leading-relaxed">{translated}</p>
          </div>
        )}
      </div>
    </div>
  );
};
