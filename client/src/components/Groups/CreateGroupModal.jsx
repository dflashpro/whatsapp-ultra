import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Users, ArrowRight, ArrowLeft, Check, Camera, Search, Plus } from 'lucide-react';

const PRESET_ICONS = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80'
];

export const CreateGroupModal = () => {
  const { 
    showCreateGroupModal, 
    setShowCreateGroupModal, 
    users, 
    currentUser, 
    createGroup,
    showToast 
  } = useAuth();

  const [step, setStep] = useState(1); // 1: Select members, 2: Group info
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(PRESET_ICONS[0]);

  if (!showCreateGroupModal) return null;

  const contacts = users.filter(u => u.id !== currentUser?.id && !u.isGroup && !u.isAI);
  const filteredContacts = contacts.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.phone && u.phone.includes(searchQuery))
  );

  const toggleSelectMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleNext = () => {
    if (selectedMembers.length === 0) {
      showToast('Select at least 1 member for the group');
      return;
    }
    setStep(2);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showToast('Please enter a group subject');
      return;
    }

    await createGroup({
      name: groupName.trim(),
      description: groupDescription.trim(),
      avatar: groupAvatar,
      members: selectedMembers,
      createdBy: currentUser.id
    });

    // Reset & close
    setStep(1);
    setSelectedMembers([]);
    setGroupName('');
    setGroupDescription('');
    setShowCreateGroupModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md glass-modal rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#e9edef] max-h-[85vh]">
        {/* Header */}
        <div className="h-16 px-6 glass-header border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="p-1 hover:bg-white/10 rounded-full">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#00a884]" />
              <h2 className="text-base font-bold">
                {step === 1 ? 'Add Group Participants' : 'New Group Info'}
              </h2>
            </div>
          </div>
          <button onClick={() => setShowCreateGroupModal(false)} className="p-1.5 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          /* STEP 1: Select Members */
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            {/* Selected Chips */}
            {selectedMembers.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {selectedMembers.map(id => {
                  const u = users.find(x => x.id === id);
                  return (
                    <div 
                      key={id} 
                      onClick={() => toggleSelectMember(id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#00a884]/20 border border-[#00a884]/40 rounded-full text-xs text-[#00a884] font-medium cursor-pointer hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 transition-all shrink-0"
                    >
                      <img src={u?.avatar} alt={u?.name} className="w-4 h-4 rounded-full object-cover" />
                      <span>{u?.name?.split(' ')[0]}</span>
                      <X size={12} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Search Input */}
            <div className="relative flex items-center bg-black/40 rounded-xl px-3 py-2 border border-white/5 focus-within:border-[#00a884]/40">
              <Search size={16} className="text-[#8696a0] shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type contact name..."
                className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] pl-3 focus:outline-none"
              />
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 space-y-1">
              {filteredContacts.map(user => {
                const isSelected = selectedMembers.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleSelectMember(user.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected ? 'bg-[#00a884]/10 border border-[#00a884]/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#e9edef]">{user.name}</h4>
                        <p className="text-xs text-[#8696a0]">{user.status}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#00a884] border-[#00a884] text-black' : 'border-[#8696a0]'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-full flex items-center gap-2 shadow-lg shadow-[#00a884]/30 transition-transform active:scale-95"
              >
                <span>Next ({selectedMembers.length})</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Group Details */
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Group Icon Selection */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer">
                <img 
                  src={groupAvatar} 
                  alt="Group Icon" 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#00a884]/40 shadow-xl"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2">
                {PRESET_ICONS.map((icon, i) => (
                  <img 
                    key={i} 
                    src={icon} 
                    alt="preset" 
                    onClick={() => setGroupAvatar(icon)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer transition-all ${
                      groupAvatar === icon ? 'ring-2 ring-[#00a884] scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Group Name Input */}
            <div>
              <label className="text-xs font-bold text-[#00a884] uppercase tracking-wider block mb-1.5">
                Group Subject
              </label>
              <input 
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
            </div>

            {/* Group Description */}
            <div>
              <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Group Description (Optional)
              </label>
              <textarea 
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="What is this group about?"
                rows={3}
                className="w-full bg-black/40 border border-white/10 focus:border-[#00a884] rounded-xl px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none resize-none"
              />
            </div>

            {/* Create Submit Button */}
            <button 
              onClick={handleCreate}
              className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#00a884]/30 transition-transform active:scale-95"
            >
              <Check size={18} /> Create Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
