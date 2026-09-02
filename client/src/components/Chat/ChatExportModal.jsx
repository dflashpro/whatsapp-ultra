import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, Download, FileText, CheckCheck } from 'lucide-react';

export const ChatExportModal = ({ onClose }) => {
  const { currentUser, activeChat, users } = useAuth();
  const { messages } = useSocket();
  const [includeMedia, setIncludeMedia] = useState(false);
  const [exported, setExported] = useState(false);

  const isGroup = Boolean(activeChat?.isGroup);
  const chatId = isGroup ? activeChat?.id : [currentUser?.id, activeChat?.id].sort().join('-');

  const chatMessages = messages.filter(m => {
    const mId = m.chatId || [m.senderId, m.receiverId].sort().join('-');
    return mId === chatId || m.chatId === chatId;
  });

  const handleExport = () => {
    const lines = [`WhatsApp Ultra Chat Export`, `Chat: ${activeChat?.name}`, `Exported: ${new Date().toLocaleString()}`, `Messages: ${chatMessages.length}`, ``, `--- Messages ---`, ``];
    chatMessages.forEach(m => {
      const sender = users.find(u => u.id === m.senderId);
      const time = new Date(m.timestamp).toLocaleString();
      lines.push(`[${time}] ${sender?.name || m.senderId}: ${m.text || '(media)'}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WhatsApp_${activeChat?.name}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => { setExported(false); onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-6 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Export Chat</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl space-y-2 border border-white/5">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-[#53bdeb]" />
            <div>
              <p className="text-xs font-bold">{activeChat?.name}</p>
              <p className="text-[10px] text-[#8696a0]">{chatMessages.length} messages</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-xs font-semibold">Include media references</span>
          <button onClick={() => setIncludeMedia(!includeMedia)} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${includeMedia ? 'bg-[#00a884]' : 'bg-white/20'}`}>
            <div className={`w-4 h-4 rounded-full bg-black transition-transform ${includeMedia ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <button onClick={handleExport} className={`w-full py-3 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${exported ? 'bg-emerald-500 text-white' : 'bg-[#00a884] hover:bg-[#008f6f] text-black'}`}>
          {exported ? <><CheckCheck size={16} /> Exported!</> : <><Download size={16} /> Export as .txt</>}
        </button>
      </div>
    </div>
  );
};
