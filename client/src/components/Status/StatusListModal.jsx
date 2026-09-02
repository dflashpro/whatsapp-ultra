import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, CircleDashed } from 'lucide-react';
import { StatusViewer } from './StatusViewer';
import { CreateStatusModal } from './CreateStatusModal';

export const StatusListModal = () => {
  const { showStatusModal, setShowStatusModal, currentUser, users } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [selectedUserStatuses, setSelectedUserStatuses] = useState(null);
  const [showCreateStatus, setShowCreateStatus] = useState(false);

  const fetchStatuses = async () => {
    try {
      const res = await fetch('/api/statuses');
      const data = await res.json();
      setStatuses(data);
    } catch (e) {
      console.error('Failed to load statuses:', e);
    }
  };

  useEffect(() => {
    if (showStatusModal) {
      fetchStatuses();
    }
  }, [showStatusModal]);

  if (!showStatusModal) return null;

  const myStatuses = statuses.filter(s => s.userId === currentUser?.id);
  
  const otherUsersWithStatus = users
    .filter(u => u.id !== currentUser?.id && !u.isGroup)
    .map(user => {
      const userStatuses = statuses.filter(s => s.userId === user.id);
      return { user, statuses: userStatuses };
    })
    .filter(item => item.statuses.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#202c33] rounded-2xl shadow-2xl border border-[#374248] flex flex-col max-h-[85vh] overflow-hidden text-[#e9edef]">
        <div className="h-16 px-6 bg-[#111b21] border-b border-[#2a3942] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CircleDashed size={22} className="text-[#00a884]" />
            <h2 className="text-base font-semibold">Status / Stories</h2>
          </div>
          <button 
            onClick={() => setShowStatusModal(false)}
            className="p-1.5 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-[#e9edef] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">My Status</p>
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#111b21]/60 transition-colors">
              <div 
                onClick={() => myStatuses.length > 0 && setSelectedUserStatuses({ user: currentUser, list: myStatuses })}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div className="relative">
                  <img 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name} 
                    className={`w-12 h-12 rounded-full object-cover ${myStatuses.length > 0 ? 'ring-2 ring-[#00a884] p-0.5' : ''}`}
                  />
                  {myStatuses.length === 0 && (
                    <span className="absolute bottom-0 right-0 p-0.5 bg-[#00a884] text-[#111b21] rounded-full">
                      <Plus size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{currentUser?.name}</h3>
                  <p className="text-xs text-[#8696a0]">
                    {myStatuses.length > 0 ? `${myStatuses.length} updates` : 'Tap to add status update'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowCreateStatus(true)}
                className="p-2 bg-[#00a884]/20 text-[#00a884] hover:bg-[#00a884]/30 rounded-full transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">Recent Updates</p>
            {otherUsersWithStatus.length === 0 ? (
              <p className="text-xs text-[#8696a0] italic px-2">No recent updates from contacts</p>
            ) : (
              <div className="space-y-1">
                {otherUsersWithStatus.map(({ user, statuses: list }) => (
                  <div 
                    key={user.id}
                    onClick={() => setSelectedUserStatuses({ user, list })}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#111b21]/60 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00a884] p-0.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{user.name}</h3>
                      <p className="text-xs text-[#8696a0]">
                        {new Date(list[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUserStatuses && (
        <StatusViewer 
          user={selectedUserStatuses.user}
          statuses={selectedUserStatuses.list}
          onClose={() => setSelectedUserStatuses(null)}
        />
      )}

      {showCreateStatus && (
        <CreateStatusModal 
          onClose={() => setShowCreateStatus(false)}
          onCreated={() => {
            fetchStatuses();
            setShowCreateStatus(false);
          }}
        />
      )}
    </div>
  );
};
