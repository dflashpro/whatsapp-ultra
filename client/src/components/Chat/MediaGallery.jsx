import React, { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { X, Image, FileText, Link, Grid, Download, Play } from "lucide-react";

const URL_RE = /https?:\/\/[^\s]+/g;

export const MediaGallery = ({ onClose }) => {
  const { messages } = useSocket();
  const { currentUser, activeChat } = useAuth();
  const [tab, setTab] = useState("media");
  const [preview, setPreview] = useState(null);

  const isGroup = Boolean(activeChat?.isGroup);
  const chatId = isGroup ? activeChat?.id : [currentUser?.id, activeChat?.id].sort().join("-");

  const chatMsgs = messages.filter(m => {
    if (m.deleted || m.deletedForMe) return false;
    if (isGroup) return m.receiverId === chatId || m.chatId === chatId;
    const mId = [m.senderId, m.receiverId].sort().join("-");
    return mId === chatId || m.chatId === chatId;
  });

  const media = chatMsgs.filter(m => m.type === "image" && m.mediaUrl);
  const docs = chatMsgs.filter(m => m.type === "document");
  const links = chatMsgs.filter(m => m.type === "text" && URL_RE.test(m.text || "")).flatMap(m => (m.text.match(URL_RE) || []).map(url => ({ url, timestamp: m.timestamp })));

  const tabs = [
    { id: "media", label: "Media", icon: Image, count: media.length },
    { id: "docs", label: "Docs", icon: FileText, count: docs.length },
    { id: "links", label: "Links", icon: Link, count: links.length },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md glass-modal rounded-3xl overflow-hidden shadow-2xl text-[#e9edef] max-h-[85vh] flex flex-col">
        <div className="h-14 px-5 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Grid size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Media & Files — {activeChat?.name}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="flex border-b border-white/5 shrink-0">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all border-b-2 ${tab === t.id ? "border-[#00a884] text-[#00a884]" : "border-transparent text-[#8696a0] hover:text-white"}`}>
                <Icon size={15} /> {t.label} {t.count > 0 && <span className="bg-[#00a884]/20 text-[#00a884] text-[10px] px-1.5 py-0.5 rounded-full">{t.count}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {tab === "media" && (
            media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#8696a0]">
                <Image size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No media in this chat</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {media.map((m, i) => (
                  <div key={m.id || i} onClick={() => setPreview(m.mediaUrl)} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group">
                    <img src={m.mediaUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play size={20} className="opacity-0 group-hover:opacity-100 text-white transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "docs" && (
            docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#8696a0]">
                <FileText size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No documents in this chat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((m, i) => (
                  <div key={m.id || i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center"><FileText size={20} className="text-indigo-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{m.fileName || "Document"}</p>
                      <p className="text-[10px] text-[#8696a0]">{m.fileSize} • {new Date(m.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full text-[#8696a0]"><Download size={16} /></button>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "links" && (
            links.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#8696a0]">
                <Link size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No links in this chat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center"><Link size={18} className="text-cyan-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#53bdeb] truncate">{l.url}</p>
                      <p className="text-[10px] text-[#8696a0]">{new Date(l.timestamp).toLocaleDateString()}</p>
                    </div>
                  </a>
                ))}
              </div>
            )
          )}
        </div>

        {preview && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center" onClick={() => setPreview(null)}>
            <img src={preview} alt="" className="max-w-full max-h-full object-contain" />
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white"><X size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
};
