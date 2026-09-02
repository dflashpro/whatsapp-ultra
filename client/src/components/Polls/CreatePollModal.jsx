import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, BarChart2, Plus, Trash2, Check } from 'lucide-react';

export const CreatePollModal = ({ onClose }) => {
  const { activeChat, showToast } = useAuth();
  const { sendMessage } = useSocket();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      showToast('Maximum 6 options allowed');
    }
  };

  const removeOption = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreatePoll = () => {
    if (!question.trim()) {
      showToast('Please enter a question');
      return;
    }

    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      showToast('Please provide at least 2 options');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions.map((opt, i) => ({
        id: `opt_${i + 1}`,
        text: opt,
        votes: []
      })),
      allowMultiple
    };

    sendMessage({
      type: 'poll',
      text: question.trim(),
      pollData
    });

    showToast('Poll created successfully! 📊');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl space-y-5 text-[#e9edef] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={20} className="text-[#00a884]" />
            <h2 className="text-base font-bold">Create a Poll</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]">
            <X size={18} />
          </button>
        </div>

        {/* Poll Question */}
        <div>
          <label className="text-xs font-bold text-[#00a884] uppercase tracking-wider block mb-1.5">
            Question
          </label>
          <input 
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
          />
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block">
            Options ({options.length}/6)
          </label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8696a0] w-4">{i + 1}.</span>
              <input 
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-3 py-2 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} className="p-2 text-[#8696a0] hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {options.length < 6 && (
            <button 
              onClick={addOption}
              className="text-xs font-bold text-[#00a884] hover:text-[#008f6f] flex items-center gap-1.5 pt-1"
            >
              <Plus size={15} /> Add Option
            </button>
          )}
        </div>

        {/* Allow Multiple Answers Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-xs font-semibold">Allow multiple answers</span>
          <button
            onClick={() => setAllowMultiple(!allowMultiple)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${allowMultiple ? 'bg-[#00a884]' : 'bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform ${allowMultiple ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Submit */}
        <button 
          onClick={handleCreatePoll}
          className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#00a884]/30 transition-transform active:scale-95"
        >
          <Check size={18} /> Send Poll
        </button>
      </div>
    </div>
  );
};
