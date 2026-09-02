import React from 'react';
import { X, Trash2, Forward, Star, Share2 } from 'lucide-react';

export const MultiSelectBar = ({ selectedCount, onCancel, onDeleteAll, onForwardAll, onStarAll }) => {
  return (
    <div className="h-14 px-4 glass-header border-b border-white/5 flex items-center justify-between shrink-0 animate-in slide-in-from-top select-none bg-[#1f2c34]/90 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-1.5 hover:bg-white/10 rounded-full text-[#aebac1]"><X size={20} /></button>
        <span className="text-sm font-bold text-[#e9edef]">{selectedCount} selected</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onStarAll} title="Star selected" className="p-2 hover:bg-white/10 rounded-full text-amber-400"><Star size={18} /></button>
        <button onClick={onForwardAll} title="Forward selected" className="p-2 hover:bg-white/10 rounded-full text-[#53bdeb]"><Forward size={18} /></button>
        <button onClick={onDeleteAll} title="Delete selected" className="p-2 hover:bg-white/10 rounded-full text-rose-400"><Trash2 size={18} /></button>
      </div>
    </div>
  );
};
