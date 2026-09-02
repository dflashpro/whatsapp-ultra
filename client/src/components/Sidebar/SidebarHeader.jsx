import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquarePlus, MoreVertical, Settings, Users, ChevronDown, Bot, QrCode, Circle, Search, LogOut, Sun, Moon, Sparkles } from 'lucide-react';
import { OnlineStatusModal } from '../Profile/OnlineStatusModal';

const STATUS_COLORS = { online: '#00a884', away: '#f59e0b', busy: '#ef4444', offline: '#8696a0' };

export const SidebarHeader = ({ onOpenLinkedDevices, onOpenQR, onOpenNewChat, onOpenGlobalSearch }) => {
  const {
    currentUser, users, switchUser,
    setShowProfileModal, setShowThemeModal, setShowSettingsModal, setShowCreateGroupModal,
    setActiveChat, onlineStatus = 'online', showToast, changeTheme, theme, logout
  } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const realUsers = users.filter(u => !u.isAI && !u.isGroup);

  const openAI = () => {
    const ai = users.find(u => u.isAI);
    if (ai) setActiveChat(ai);
  };

  const menuItems = [
    { label: '🔍 Global Search', action: () => { onOpenGlobalSearch && onOpenGlobalSearch(); setShowMenu(false); } },
    { label: '💬 New Chat / Number', action: () => { onOpenNewChat && onOpenNewChat(); setShowMenu(false); } },
    { label: '👥 New Group', action: () => { setShowCreateGroupModal(true); setShowMenu(false); } },
    { label: '👤 Profile & Status', action: () => { setShowProfileModal(true); setShowMenu(false); } },
    { label: '🎨 Theme Studio', action: () => { setShowThemeModal(true); setShowMenu(false); } },
    { label: '⚙️ Settings', action: () => { setShowSettingsModal(true); setShowMenu(false); } },
    { label: '📱 Linked Devices', action: () => { onOpenLinkedDevices(); setShowMenu(false); } },
    { label: '📲 My QR Code', action: () => { onOpenQR(); setShowMenu(false); } },
    { label: '🌐 Online Status', action: () => { setShowStatusModal(true); setShowMenu(false); } },
    { label: theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode', action: () => { changeTheme(theme === 'light' ? 'emerald' : 'light'); setShowMenu(false); } },
    { label: '🚪 Logout / Switch Number', action: () => { logout && logout(); setShowMenu(false); }, color: 'text-rose-400' },
  ];

  return (
    <>
      <div className="h-16 px-4 glass-header border-b border-white/5 flex items-center justify-between shrink-0 z-20 select-none">
        {/* User Avatar & Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowUserSwitch(!showUserSwitch)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-all">
              <div className="relative">
                <img src={currentUser?.avatar} alt={currentUser?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00a884]/40 shadow-sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111b21]" style={{ backgroundColor: STATUS_COLORS[onlineStatus || 'online'] }} />
              </div>
              <ChevronDown size={14} className={`text-[#8696a0] transition-transform ${showUserSwitch ? 'rotate-180' : ''}`} />
            </button>

            {showUserSwitch && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserSwitch(false)} />
                <div className="absolute top-12 left-0 w-56 glass-modal rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in max-h-72 overflow-y-auto">
                  <p className="text-[10px] font-bold text-[#8696a0] px-3 py-1 uppercase tracking-wider">Switch Account</p>
                  {realUsers.map(u => (
                    <button key={u.id} onClick={() => { switchUser(u.id); setShowUserSwitch(false); }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all ${u.id === currentUser?.id ? 'bg-white/10 border border-white/10' : ''}`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#e9edef] truncate">{u.name}</p>
                        <p className="text-[10px] text-[#8696a0] truncate">{u.phone}</p>
                      </div>
                      {u.id === currentUser?.id && <span className="text-[10px] text-[#00a884] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#e9edef] leading-tight">{currentUser?.name?.split(' ')[0]}</span>
            <span className="text-[10px] font-medium capitalize leading-tight" style={{ color: STATUS_COLORS[onlineStatus || 'online'] }}>
              ● {onlineStatus === 'offline' ? 'Invisible' : onlineStatus || 'online'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button onClick={() => onOpenNewChat && onOpenNewChat()} title="New Chat" className="p-2 text-[#8696a0] hover:text-[#00a884] hover:bg-white/10 rounded-full transition-all">
            <MessageSquarePlus size={20} />
          </button>
          <button onClick={openAI} title="Meta AI (Gemini Pro)" className="p-2 text-[#8696a0] hover:text-purple-400 hover:bg-white/10 rounded-full transition-all">
            <Bot size={20} />
          </button>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-[#8696a0] hover:text-[#e9edef] hover:bg-white/10 rounded-full transition-all">
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 glass-modal rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in max-h-96 overflow-y-auto">
                  {menuItems.map((item, i) => (
                    <button key={i} onClick={item.action} className={`w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center justify-between ${item.color || 'text-[#e9edef]'}`}>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showStatusModal && <OnlineStatusModal onClose={() => setShowStatusModal(false)} />}
    </>
  );
};
