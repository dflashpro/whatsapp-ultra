import React from 'react';

const getDateLabel = (timestamp) => {
  const msgDate = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86400000);
  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

  if (msgDay.getTime() === today.getTime()) return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return msgDate.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const DateSeparator = ({ timestamp }) => {
  return (
    <div className="flex items-center justify-center my-3 select-none">
      <div className="glass-card text-[#8696a0] text-[11px] font-semibold px-4 py-1 rounded-full border border-white/5 shadow-sm">
        {getDateLabel(timestamp)}
      </div>
    </div>
  );
};
