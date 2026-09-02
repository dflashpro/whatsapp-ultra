import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, UserPlus, Phone, Search, Check, MessageSquare, Sparkles } from 'lucide-react';

export const NewChatContactModal = ({ onClose }) => {
  const { users, currentUser, openChat, setUsers, showToast } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const existingContacts = users.filter(u => u.id !== currentUser?.id && !u.isAI);
  const filtered = existingContacts.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const handleAddNewContact = async () => {
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 5) {
      showToast('Enter a valid phone number ⚠️');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          name: contactName.trim() || cleanPhone,
          addedBy: currentUser?.id
        })
      });
      const data = await res.json();
      
      const newContact = data.contact || {
        id: `user_${Date.now()}`,
        name: contactName.trim() || cleanPhone,
        phone: cleanPhone,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanPhone}`,
        status: 'Hey there! I am using WhatsApp Ultra 🚀',
        online: true,
        lastSeen: Date.now()
      };

      setUsers(prev => [newContact, ...prev.filter(u => u.id !== newContact.id)]);
      openChat(newContact);
      showToast(`Started chat with ${newContact.name}! 💬✨`);
      onClose();
    } catch {
      const fallback = {
        id: `user_${Date.now()}`,
        name: contactName.trim() || cleanPhone,
        phone: cleanPhone,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanPhone}`,
        status: 'Available',
        online: true
      };
      setUsers(prev => [fallback, ...prev]);
      openChat(fallback);
      showToast(`Started chat with ${fallback.name}! 💬`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl text-[#e9edef] max-h-[85vh] flex flex-col">
        <div className="h-14 px-5 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">New Chat / Contact</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        {/* Enter Phone to chat */}
        <div className="p-4 border-b border-white/5 space-y-3 shrink-0 bg-black/20">
          <p className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider">Chat with any phone number</p>
          <div className="space-y-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number (e.g. +94 77 123 4567)"
              className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl px-4 py-2.5 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
            />
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Contact name (optional)"
              className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-2xl px-4 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
            />
            <button
              onClick={handleAddNewContact}
              disabled={loading || !phoneNumber.trim()}
              className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <MessageSquare size={14} /> Start Chatting
            </button>
          </div>
        </div>

        {/* Search existing contacts */}
        <div className="p-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-white/5">
            <Search size={14} className="text-[#8696a0]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search registered contacts..."
              className="bg-transparent text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none flex-1"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map(u => (
            <div
              key={u.id}
              onClick={() => { openChat(u); onClose(); }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                <div>
                  <p className="text-xs font-bold text-[#e9edef]">{u.name}</p>
                  <p className="text-[10px] text-[#8696a0]">{u.phone}</p>
                </div>
              </div>
              <span className="text-[10px] text-[#00a884] font-bold px-2 py-1 bg-[#00a884]/10 rounded-lg">Chat</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
