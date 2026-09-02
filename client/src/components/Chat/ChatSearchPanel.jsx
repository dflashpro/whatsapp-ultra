import React, { useState, useMemo } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';

export const ChatSearchPanel = ({ onClose, onScrollToMessage }) => {
  const { messages } = useSocket();
  const { currentUser, activeChat } = useAuth();
  const [query, setQuery] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);

  const isGroup = Boolean(activeChat?.isGroup);
  const chatId = isGroup ? activeChat?.id : [currentUser?.id, activeChat?.id].sort().join('-');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return messages.filter(m => {
      const mChatId = m.chatId || [m.senderId, m.receiverId].sort().join('-');
      return (mChatId === chatId || m.chatId === chatId) && m.text?.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, messages, chatId]);

  const navigate = (dir) => {
    if (results.length === 0) return;
    const next = (currentIdx + dir + results.length) % results.length;
    setCurrentIdx(next);
    onScrollToMessage(results[next].id);
  };

  return (
    <div className="px-4 py-2 glass-header border-b border-white/5 flex items-center gap-3 shrink-0 animate-in slide-in-from-top">
      <Search size={16} className="text-[#8696a0] shrink-0" />
      <input
        autoFocus
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setCurrentIdx(0); }}
        placeholder="Search in conversation..."
        className="flex-1 bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
      />
      {results.length > 0 && (
        <span className="text-xs text-[#8696a0] shrink-0 font-mono">{currentIdx + 1}/{results.length}</span>
      )}
      {query && results.length === 0 && (
        <span className="text-xs text-rose-400 shrink-0">No results</span>
      )}
      <button onClick={() => navigate(-1)} disabled={results.length === 0} className="p-1 hover:bg-white/10 rounded-lg text-[#aebac1] disabled:opacity-30"><ChevronUp size={16} /></button>
      <button onClick={() => navigate(1)} disabled={results.length === 0} className="p-1 hover:bg-white/10 rounded-lg text-[#aebac1] disabled:opacity-30"><ChevronDown size={16} /></button>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
    </div>
  );
};
