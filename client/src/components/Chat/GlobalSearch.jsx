import React, { useState, useMemo } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { Search, X, MessageSquare, User, Image, FileText, BarChart2 } from "lucide-react";

const TYPE_ICONS = { text: MessageSquare, image: Image, document: FileText, poll: BarChart2 };
const TYPE_COLORS = { text: "text-[#00a884]", image: "text-cyan-400", document: "text-indigo-400", poll: "text-amber-400" };

export const GlobalSearch = ({ onClose }) => {
  const { messages } = useSocket();
  const { users, currentUser, openChat } = useAuth();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return { contacts: [], messages: [] };
    const q = query.toLowerCase();
    const contacts = users.filter(u => u.id !== currentUser?.id && u.name.toLowerCase().includes(q));
    const msgs = messages.filter(m =>
      m.text?.toLowerCase().includes(q) && !m.deleted && !m.deletedForMe
    ).slice(0, 20);
    return { contacts, messages: msgs };
  }, [query, messages, users, currentUser]);

  const getSenderName = (msg) => {
    const u = users.find(u => u.id === msg.senderId);
    return u?.name || "Unknown";
  };

  const getChatName = (msg) => {
    const other = users.find(u => u.id === (msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId));
    return other?.name || "Group";
  };

  const highlightText = (text = "", q) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-[#00a884]/30 text-[#00a884] rounded px-0.5">{part}</mark>
        : part
    );
  };

  const totalResults = results.contacts.length + results.messages.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 animate-in fade-in">
      <div className="w-full max-w-lg glass-modal rounded-3xl shadow-2xl overflow-hidden text-[#e9edef] max-h-[75vh] flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <Search size={18} className="text-[#00a884] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages, contacts..."
            className="flex-1 bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
          />
          {query && <span className="text-[10px] text-[#8696a0] shrink-0">{totalResults} results</span>}
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 text-[#8696a0]">
              <Search size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Type to search across all chats</p>
            </div>
          )}

          {results.contacts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider px-4 pt-4 pb-2">Contacts ({results.contacts.length})</p>
              {results.contacts.map(u => (
                <div key={u.id} onClick={() => { openChat(u); onClose(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer">
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{highlightText(u.name, query)}</p>
                    <p className="text-xs text-[#8696a0]">{u.phone || u.about}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.messages.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider px-4 pt-4 pb-2">Messages ({results.messages.length})</p>
              {results.messages.map(msg => {
                const Icon = TYPE_ICONS[msg.type] || MessageSquare;
                const color = TYPE_COLORS[msg.type] || "text-[#00a884]";
                return (
                  <div key={msg.id} onClick={() => { const chat = users.find(u => u.id === (msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId)); if(chat) { openChat(chat); onClose(); }}}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-full bg-black/30 flex items-center justify-center shrink-0 ${color}`}><Icon size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-xs font-bold text-[#53bdeb] truncate">{getChatName(msg)}</p>
                        <span className="text-[10px] text-[#8696a0] shrink-0">{new Date(msg.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-[#e9edef] truncate">{highlightText(msg.text, query)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {query.length >= 2 && totalResults === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#8696a0]">
              <Search size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No results for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
