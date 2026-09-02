import React, { useMemo } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { X, BarChart2, MessageSquare, Image, Mic, Star, TrendingUp } from "lucide-react";

export const ChatStatsDrawer = ({ onClose }) => {
  const { messages } = useSocket();
  const { currentUser, activeChat, users, starredMessages } = useAuth();

  const isGroup = Boolean(activeChat?.isGroup);
  const chatId = isGroup ? activeChat?.id : [currentUser?.id, activeChat?.id].sort().join("-");

  const stats = useMemo(() => {
    const chatMsgs = messages.filter(m => {
      if (m.deleted || m.deletedForMe) return false;
      if (isGroup) return m.receiverId === chatId || m.chatId === chatId;
      const mId = [m.senderId, m.receiverId].sort().join("-");
      return mId === chatId || m.chatId === chatId;
    });

    const mine = chatMsgs.filter(m => m.senderId === currentUser?.id);
    const theirs = chatMsgs.filter(m => m.senderId !== currentUser?.id);
    const images = chatMsgs.filter(m => m.type === "image");
    const voices = chatMsgs.filter(m => m.type === "audio");
    const polls = chatMsgs.filter(m => m.type === "poll");
    const starred = chatMsgs.filter(m => starredMessages.includes(m.id));

    const allText = chatMsgs.filter(m => m.type === "text").map(m => m.text || "").join(" ");
    const words = allText.split(/\s+/).filter(Boolean).length;

    const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
    const emojis = (allText.match(emojiRe) || []);
    const emojiCount = {};
    emojis.forEach(e => { emojiCount[e] = (emojiCount[e] || 0) + 1; });
    const topEmoji = Object.entries(emojiCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { total: chatMsgs.length, mine: mine.length, theirs: theirs.length, images: images.length, voices: voices.length, polls: polls.length, starred: starred.length, words };
  }, [messages, chatId, currentUser, isGroup, starredMessages]);

  const totalSafe = stats.total || 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl p-5 shadow-2xl text-[#e9edef] space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-[#00a884]" />
            <h2 className="text-sm font-bold">Chat Statistics</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-[#00a884]/15 to-emerald-900/20 rounded-2xl border border-[#00a884]/20">
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-xs text-[#8696a0] mt-1">Total Messages</p>
          <p className="text-[10px] text-[#8696a0] mt-0.5">{stats.words.toLocaleString()} words exchanged</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "You sent", value: stats.mine, color: "text-[#00a884]", bg: "bg-[#00a884]/10", pct: Math.round((stats.mine/totalSafe)*100) },
            { label: "Received", value: stats.theirs, color: "text-[#53bdeb]", bg: "bg-[#53bdeb]/10", pct: Math.round((stats.theirs/totalSafe)*100) },
            { label: "Photos", value: stats.images, color: "text-cyan-400", bg: "bg-cyan-500/10", icon: Image },
            { label: "Voice Notes", value: stats.voices, color: "text-violet-400", bg: "bg-violet-500/10", icon: Mic },
            { label: "Polls", value: stats.polls, color: "text-amber-400", bg: "bg-amber-500/10", icon: BarChart2 },
            { label: "Starred", value: stats.starred, color: "text-amber-400", bg: "bg-amber-500/10", icon: Star },
          ].map((s, i) => {
            const Icon = s.icon || TrendingUp;
            return (
              <div key={i} className={`p-3 ${s.bg} rounded-2xl border border-white/5`}>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-[#8696a0] font-medium">{s.label}</p>
                {s.pct !== undefined && (
                  <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-current rounded-full transition-all" style={{ width: `${s.pct}%`, color: s.color === "text-[#00a884]" ? "#00a884" : "#53bdeb" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
