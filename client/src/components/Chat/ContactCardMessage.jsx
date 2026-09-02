import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, User, Phone, Share2, Check, Search } from 'lucide-react';

export const ShareContactModal = ({ onClose }) => {
  const { users, currentUser, showToast } = useAuth();
  const { sendMessage } = useSocket();
  const [search, setSearch] = useState('');

  const contacts = users.filter(u => u.id !== currentUser?.id && !u.isGroup && !u.isAI);
  const filtered = contacts.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  const shareContact = (contact) => {
    sendMessage({
      type: 'contact',
      text: `👤 Contact: ${contact.name}`,
      contactData: { name: contact.name, phone: contact.phone, avatar: contact.avatar, id: contact.id }
    });
    showToast(`Contact "${contact.name}" shared 📇`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl text-[#e9edef] max-h-[80vh] flex flex-col">
        <div className="h-14 px-5 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Share Contact</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>
        <div className="p-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-white/5">
            <Search size={14} className="text-[#8696a0]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="bg-transparent text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none flex-1" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map(u => (
            <div key={u.id} onClick={() => shareContact(u)} className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                <div>
                  <p className="text-xs font-bold">{u.name}</p>
                  <p className="text-[10px] text-[#8696a0]">{u.phone}</p>
                </div>
              </div>
              <Share2 size={16} className="text-[#8696a0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContactCardBubble = ({ contactData }) => {
  const { openChat, users } = useAuth();
  const contact = users.find(u => u.id === contactData?.id);

  return (
    <div className="min-w-[200px] space-y-2">
      <div className="flex items-center gap-3 p-1">
        <img src={contactData.avatar} alt={contactData.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-[#00a884]/40" />
        <div>
          <p className="text-xs font-bold text-[#e9edef]">{contactData.name}</p>
          <p className="text-[10px] text-[#8696a0]">{contactData.phone}</p>
        </div>
      </div>
      {contact && (
        <button onClick={() => openChat(contact)} className="w-full py-1.5 bg-[#00a884]/20 hover:bg-[#00a884]/30 text-[#00a884] text-xs font-bold rounded-xl border border-[#00a884]/30 transition-all">
          Open Chat
        </button>
      )}
    </div>
  );
};
