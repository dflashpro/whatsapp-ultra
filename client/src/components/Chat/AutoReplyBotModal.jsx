import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, Bot, Plus, Trash2, Check, Zap } from "lucide-react";

const DEFAULT_REPLIES = [
  { trigger: "hi", reply: "Hi! I am currently unavailable. I will get back to you shortly. 🙏" },
  { trigger: "hello", reply: "Hello! Auto-reply: I am away right now. Talk soon! 👋" },
  { trigger: "price", reply: "Please check our catalog or contact us during business hours. 📋" },
];

export const AutoReplyBotModal = ({ onClose }) => {
  const { autoReplies = DEFAULT_REPLIES, setAutoReplies, autoReplyEnabled, setAutoReplyEnabled, showToast } = useAuth();
  const [replies, setReplies] = useState(autoReplies.length ? autoReplies : DEFAULT_REPLIES);
  const [enabled, setEnabled] = useState(autoReplyEnabled || false);
  const [newTrigger, setNewTrigger] = useState("");
  const [newReply, setNewReply] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleSave = () => {
    setAutoReplies && setAutoReplies(replies);
    setAutoReplyEnabled && setAutoReplyEnabled(enabled);
    showToast(enabled ? "Auto-reply bot enabled 🤖" : "Auto-reply bot disabled");
    onClose();
  };

  const addRule = () => {
    if (!newTrigger.trim() || !newReply.trim()) return;
    setReplies(prev => [...prev, { trigger: newTrigger.trim().toLowerCase(), reply: newReply.trim() }]);
    setNewTrigger(""); setNewReply(""); setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl text-[#e9edef] max-h-[85vh] flex flex-col">
        <div className="h-14 px-5 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-violet-400" />
            <h2 className="text-sm font-bold">Auto-Reply Bot</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="p-4 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
            <div>
              <p className="text-xs font-bold">Enable Auto-Reply</p>
              <p className="text-[10px] text-[#8696a0]">Automatically reply when you are offline</p>
            </div>
            <button onClick={() => setEnabled(!enabled)} className={`w-12 h-6 rounded-full p-0.5 transition-colors ${enabled ? "bg-[#00a884]" : "bg-white/20"}`}>
              <div className={`w-5 h-5 rounded-full bg-black transition-transform ${enabled ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider px-1">Reply Rules ({replies.length})</p>
          {replies.map((r, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#00a884] px-2 py-0.5 bg-[#00a884]/10 rounded-full">"{r.trigger}"</span>
                <button onClick={() => setReplies(prev => prev.filter((_, idx) => idx !== i))} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 size={13} /></button>
              </div>
              <p className="text-xs text-[#e9edef] leading-relaxed">{r.reply}</p>
            </div>
          ))}

          {showAdd ? (
            <div className="p-3 bg-white/5 rounded-2xl space-y-2">
              <input value={newTrigger} onChange={e => setNewTrigger(e.target.value)} placeholder="Trigger word (e.g. hello)" className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none" />
              <textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Auto-reply message..." rows={2} className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-3 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 bg-white/5 rounded-xl text-xs font-bold text-[#8696a0]">Cancel</button>
                <button onClick={addRule} className="flex-1 py-1.5 bg-[#00a884] rounded-xl text-xs font-bold text-black">Add Rule</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[#8696a0] flex items-center justify-center gap-2">
              <Plus size={14} /> Add Rule
            </button>
          )}
        </div>

        <div className="p-4 border-t border-white/5 shrink-0">
          <button onClick={handleSave} className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2">
            <Check size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
