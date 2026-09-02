import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

export const CommunitiesTab = () => {
  const { showToast, openChat, users } = useAuth();
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    fetch('/api/communities')
      .then(res => res.json())
      .then(data => setCommunities(data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 select-none">
      <div className="p-4 bg-gradient-to-r from-[#00a884]/20 to-cyan-500/10 rounded-2xl border border-[#00a884]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00a884] text-black flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e9edef]">New Community</h3>
            <p className="text-[11px] text-[#8696a0]">Bring related groups together</p>
          </div>
        </div>
        <button 
          onClick={() => showToast('Community creator ready')}
          className="p-2 bg-[#00a884] text-black rounded-full hover:bg-[#008f6f]"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {communities.map(comm => (
          <div key={comm.id} className="p-4 glass-card rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <img src={comm.avatar} alt={comm.name} className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/10" />
              <div>
                <h4 className="text-sm font-bold text-[#e9edef]">{comm.name}</h4>
                <p className="text-[11px] text-[#8696a0]">{comm.membersCount} Members • {comm.subgroups.length} Groups</p>
              </div>
            </div>

            <p className="text-xs text-[#8696a0]">{comm.description}</p>

            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider">Sub-Groups</p>
              {comm.subgroups.map((sg, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    const found = users.find(u => u.id === sg || u.name === sg);
                    if (found) openChat(found);
                    else showToast(`Opening ${sg}`);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/20 hover:bg-white/5 cursor-pointer text-xs font-semibold text-[#e9edef]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00a884]"></span>
                    <span>{sg.replace('group_', '').replace('_', ' ')}</span>
                  </div>
                  <ArrowRight size={14} className="text-[#8696a0]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
