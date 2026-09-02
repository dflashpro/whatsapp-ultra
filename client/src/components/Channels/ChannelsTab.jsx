import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Check, Plus, Heart, Share2 } from 'lucide-react';

export const ChannelsTab = () => {
  const { showToast } = useAuth();
  const [channels, setChannels] = useState([]);

  const fetchChannels = () => {
    fetch('/api/channels')
      .then(res => res.json())
      .then(data => setChannels(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const toggleFollow = async (channelId) => {
    try {
      const res = await fetch('/api/channel/toggle-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
      });
      const updated = await res.json();
      setChannels(prev => prev.map(c => c.id === updated.id ? updated : c));
      showToast(updated.isFollowing ? `Following ${updated.name}` : `Unfollowed ${updated.name}`);
    } catch (e) {}
  };

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-4 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#e9edef] flex items-center gap-1.5">
            Channels <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">Verified</span>
          </h3>
          <p className="text-xs text-[#8696a0]">Stay updated on topics you care about</p>
        </div>
      </div>

      <div className="space-y-4 pt-3">
        {channels.map(channel => (
          <div key={channel.id} className="p-4 glass-card rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={channel.avatar} alt={channel.name} className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#e9edef]">{channel.name}</h4>
                    <span className="w-2 h-2 rounded-full bg-[#00a884]"></span>
                  </div>
                  <p className="text-[11px] text-[#8696a0]">{channel.followers}</p>
                </div>
              </div>

              <button 
                onClick={() => toggleFollow(channel.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  channel.isFollowing 
                    ? 'bg-white/10 text-[#00a884] border border-[#00a884]/30' 
                    : 'bg-[#00a884] text-black hover:bg-[#008f6f]'
                }`}
              >
                {channel.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs text-[#d1d7db] leading-relaxed">
              {channel.latestPost}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
