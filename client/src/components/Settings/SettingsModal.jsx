import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  Lock, 
  Bell, 
  HardDrive, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck, 
  Check, 
  ChevronRight, 
  Camera, 
  Phone, 
  KeyRound, 
  Smartphone
} from 'lucide-react';

export const SettingsModal = () => {
  const { 
    showSettingsModal, 
    setShowSettingsModal, 
    currentUser, 
    updateProfile, 
    privacy, 
    updatePrivacy, 
    blockedUsers, 
    unblockUser,
    users, 
    showToast 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('privacy');

  const [lastSeen, setLastSeen] = useState(currentUser?.privacy?.lastSeen || 'everyone');
  const [profilePhotoPrivacy, setProfilePhotoPrivacy] = useState(currentUser?.privacy?.profilePhoto || 'everyone');
  const [readReceipts, setReadReceipts] = useState(currentUser?.privacy?.readReceipts !== false);
  const [disappearingTimer, setDisappearingTimer] = useState(currentUser?.privacy?.disappearingTimer || 'off');

  const [conversationTones, setConversationTones] = useState(true);
  const [reactionNotifications, setReactionNotifications] = useState(true);
  const [enterIsSend, setEnterIsSend] = useState(true);
  const [fontSize, setFontSize] = useState('medium');

  if (!showSettingsModal) return null;

  const handleSavePrivacy = (key, val) => {
    if (key === 'lastSeen') setLastSeen(val);
    if (key === 'profilePhoto') setProfilePhotoPrivacy(val);
    if (key === 'readReceipts') setReadReceipts(val);
    if (key === 'disappearingTimer') setDisappearingTimer(val);

    updatePrivacy({ [key]: val });
    showToast('Privacy setting updated');
  };

  const navItems = [
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'storage', label: 'Storage and Data', icon: HardDrive },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'help', label: 'Help & App Info', icon: HelpCircle }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-3xl h-[600px] glass-modal rounded-3xl overflow-hidden shadow-2xl flex text-[#e9edef] border border-white/10">
        <div className="w-64 glass-header border-r border-white/5 flex flex-col justify-between p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-xl bg-[#00a884]/20 text-[#00a884] flex items-center justify-center font-black text-sm">
                ⚙️
              </div>
              <h2 className="text-base font-bold">Settings</h2>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
              <img src={currentUser?.avatar} alt={currentUser?.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00a884]" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-[#8696a0] truncate">{currentUser?.phone}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      isActive 
                        ? 'bg-[#00a884] text-black font-extrabold shadow-md shadow-[#00a884]/30' 
                        : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <button 
            onClick={() => setShowSettingsModal(false)}
            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[#8696a0] hover:text-white transition-colors"
          >
            Close Settings
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
          <div className="h-16 px-6 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-[#e9edef] uppercase tracking-wider">
              {navItems.find(i => i.id === activeTab)?.label}
            </h3>
            <button onClick={() => setShowSettingsModal(false)} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#00a884] uppercase tracking-wider block">
                    Last Seen & Online Visibility
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['everyone', 'contacts', 'nobody'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSavePrivacy('lastSeen', opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                          lastSeen === opt 
                            ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]' 
                            : 'bg-white/5 border-transparent text-[#8696a0] hover:bg-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#00a884] uppercase tracking-wider block">
                    Profile Photo Visibility
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['everyone', 'contacts', 'nobody'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSavePrivacy('profilePhoto', opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                          profilePhotoPrivacy === opt 
                            ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]' 
                            : 'bg-white/5 border-transparent text-[#8696a0] hover:bg-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-[#e9edef]">Read Receipts (Blue Checks)</h4>
                    <p className="text-[11px] text-[#8696a0] mt-0.5">If turned off, you won't send or receive read receipts</p>
                  </div>
                  <button
                    onClick={() => handleSavePrivacy('readReceipts', !readReceipts)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${readReceipts ? 'bg-[#00a884]' : 'bg-white/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${readReceipts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#00a884] uppercase tracking-wider block">
                    Default Disappearing Message Timer
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['off', '24h', '7d', '90d'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSavePrivacy('disappearingTimer', opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold uppercase border transition-all ${
                          disappearingTimer === opt 
                            ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]' 
                            : 'bg-white/5 border-transparent text-[#8696a0] hover:bg-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-[#e9edef]">Blocked Contacts ({(blockedUsers || []).length})</h4>
                  {(blockedUsers || []).length === 0 ? (
                    <p className="text-[11px] text-[#8696a0] italic">No blocked contacts</p>
                  ) : (
                    <div className="space-y-2">
                      {blockedUsers.map(id => {
                        const target = users.find(u => u.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between p-2 rounded-xl bg-black/30">
                            <div className="flex items-center gap-2">
                              <img src={target?.avatar} alt={target?.name} className="w-7 h-7 rounded-full object-cover" />
                              <span className="text-xs font-semibold">{target?.name}</span>
                            </div>
                            <button
                              onClick={() => unblockUser(id)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-[#00a884] text-xs font-bold rounded-lg"
                            >
                              Unblock
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-[#00a884]" />
                    <div>
                      <h4 className="text-xs font-bold">Security Notifications</h4>
                      <p className="text-[11px] text-[#8696a0]">Get notified when your security code changes</p>
                    </div>
                  </div>
                  <Check size={18} className="text-[#00a884]" />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <KeyRound size={20} className="text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold">Two-Step Verification</h4>
                      <p className="text-[11px] text-[#8696a0]">PIN protection enabled for your account</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-amber-400/20 text-amber-400 rounded-full font-bold">Enabled</span>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone size={20} className="text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold">Phone Number</h4>
                      <p className="text-[11px] text-[#8696a0]">{currentUser?.phone}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#8696a0]" />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold">Conversation Tones</h4>
                    <p className="text-[11px] text-[#8696a0]">Play sounds for incoming and outgoing messages</p>
                  </div>
                  <button
                    onClick={() => setConversationTones(!conversationTones)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${conversationTones ? 'bg-[#00a884]' : 'bg-white/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${conversationTones ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold">Reaction Notifications</h4>
                    <p className="text-[11px] text-[#8696a0]">Show notifications for reactions to messages you send</p>
                  </div>
                  <button
                    onClick={() => setReactionNotifications(!reactionNotifications)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${reactionNotifications ? 'bg-[#00a884]' : 'bg-white/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${reactionNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold">Storage Usage</h4>
                    <span className="text-xs font-mono text-[#00a884]">1.8 GB / 64 GB</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#00a884] w-[45%]" />
                    <div className="h-full bg-cyan-400 w-[25%]" />
                    <div className="h-full bg-amber-400 w-[15%]" />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[#8696a0]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00a884]"></span> Media (850 MB)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Messages (420 MB)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Docs (210 MB)</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold">Low Data Usage for Calls</h4>
                    <p className="text-[11px] text-[#8696a0]">Optimize WebRTC bandwidth on slower networks</p>
                  </div>
                  <Check size={18} className="text-[#00a884]" />
                </div>
              </div>
            )}

            {activeTab === 'chats' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold">Enter is Send</h4>
                    <p className="text-[11px] text-[#8696a0]">Enter key will send your message immediately</p>
                  </div>
                  <button
                    onClick={() => setEnterIsSend(!enterIsSend)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${enterIsSend ? 'bg-[#00a884]' : 'bg-white/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${enterIsSend ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block">Chat Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['small', 'medium', 'large'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                          fontSize === s ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]' : 'bg-white/5 border-transparent text-[#8696a0]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-[#00a884]/20 via-transparent to-cyan-500/10 rounded-3xl border border-[#00a884]/30 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#00a884] text-black font-black text-2xl flex items-center justify-center mx-auto shadow-xl">
                    👑
                  </div>
                  <h3 className="text-base font-bold text-white">WhatsApp Web Ultra Pro</h3>
                  <p className="text-xs text-[#00a884] font-semibold">Version 2.26.8 (VIP Production Build)</p>
                  <p className="text-xs text-[#8696a0] max-w-sm mx-auto">
                    Full WebRTC 4K Video Calling, Meta AI Assistance, End-to-End Encryption, Group Creation, and Privacy Engine.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold">End-to-End Encryption Certificate</span>
                  <span className="text-xs text-[#00a884] font-mono">VERIFIED 🔒</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
