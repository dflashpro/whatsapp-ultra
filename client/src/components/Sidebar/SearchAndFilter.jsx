import React from 'react';
import { Search, X, MessageSquare, Phone, Radio, Users } from 'lucide-react';

export const SearchAndFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  filterTab, 
  setFilterTab,
  sidebarSection,
  setSidebarSection 
}) => {
  const sections = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'channels', label: 'Channels', icon: Radio },
    { id: 'communities', label: 'Communities', icon: Users }
  ];

  const chatFilterTabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' }
  ];

  return (
    <div className="px-3 pt-2 pb-2 glass-header flex flex-col gap-2.5 shrink-0 border-b border-white/5">
      <div className="relative flex items-center bg-black/40 rounded-xl px-3 py-1.5 border border-white/5 focus-within:border-[#00a884]/40">
        <Search size={16} className="text-[#8696a0] shrink-0" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${sidebarSection}...`}
          className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] pl-3 pr-6 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 text-[#8696a0]">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-2xl border border-white/5">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = sidebarSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setSidebarSection(sec.id)}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                isActive 
                  ? 'bg-[#00a884] text-black shadow-md shadow-[#00a884]/30' 
                  : 'text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Icon size={14} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {sidebarSection === 'chats' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {chatFilterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
                filterTab === tab.id
                  ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40'
                  : 'bg-white/5 text-[#8696a0] hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
