import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Info } from 'lucide-react';

export const Toast = () => {
  const { toastMessage } = useAuth();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#202c33] text-[#e9edef] px-4 py-2.5 rounded-lg shadow-2xl border border-[#374248] text-sm animate-bounce">
      <Info size={18} className="text-[#00a884]" />
      <span>{toastMessage}</span>
    </div>
  );
};
