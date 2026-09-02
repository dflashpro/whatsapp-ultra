import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export const DeleteMessageModal = ({ message, isSender, onClose }) => {
  const { deleteMessage } = useSocket();
  const { showToast } = useAuth();

  const handleDelete = (mode) => {
    deleteMessage(message.id, mode);
    showToast(mode === 'everyone' ? 'Message deleted for everyone 🗑️' : 'Message deleted for you');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xs glass-modal rounded-3xl p-5 shadow-2xl text-[#e9edef] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Delete Message?</h3>
            <p className="text-[11px] text-[#8696a0]">This action cannot be undone</p>
          </div>
        </div>

        <div className="p-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-[#8696a0] italic truncate">
          "{message.text?.substring(0, 60) || 'Media message'}"
        </div>

        <div className="space-y-2">
          {isSender && (
            <button onClick={() => handleDelete('everyone')} className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-rose-500/30">
              <Trash2 size={15} /> Delete for Everyone
            </button>
          )}
          <button onClick={() => handleDelete('me')} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-[#e9edef] font-bold text-xs rounded-xl">
            Delete for Me Only
          </button>
          <button onClick={onClose} className="w-full py-2.5 text-[#8696a0] font-semibold text-xs rounded-xl hover:bg-white/5">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
