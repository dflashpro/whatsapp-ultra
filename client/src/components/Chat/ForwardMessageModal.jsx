import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, Forward, Check, Search } from 'lucide-react';

export const ForwardMessageModal = ({ message, onClose }) => {
  const { users, currentUser, showToast } = useAuth();
  const { socket } = useSocket();
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  const contacts = users.filter(u => u.id !== currentUser?.id && !u.isAI);
  const filtered = contacts.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleForward = () => {
    if (selected.length === 0) { showToast('Select at least one contact'); return; }
    selected.forEach(receiverId => {
      socket.emit('send-message', {
        senderId: currentUser.id,
        receiverId,
        text: message.text,
        type: message.type === 'poll' ? 'text' : message.type,
        mediaUrl: message.mediaUrl,
        fileName: message.fileName,
        forwarded: true
      });
    });
    showToast(`Forwarded to ${selected.length} chat${selected.length > 1 ? 's' : ''} ⏩`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl text-[#e9edef] max-h-[80vh] flex flex-col">
        <div className="h-14 px-5 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Forward size={18} className="text-[#53bdeb]" />
            <h2 className="text-sm font-bold">Forward Message</h2>
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
            <div key={u.id} onClick={() => toggle(u.id)} className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${selected.includes(u.id) ? 'bg-[#00a884]/15 border border-[#00a884]/30' : 'hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold">{u.name}</p>
                  <p className="text-[10px] text-[#8696a0]">{u.isGroup ? 'Group' : u.phone}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected.includes(u.id) ? 'bg-[#00a884] border-[#00a884] text-black' : 'border-[#8696a0]'}`}>
                {selected.includes(u.id) && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="p-4 border-t border-white/5 shrink-0">
            <button onClick={handleForward} className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
              <Forward size={16} /> Forward to {selected.length} Chat{selected.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
