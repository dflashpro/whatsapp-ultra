import React from 'react';
import { X, Download } from 'lucide-react';

export const MediaPreviewModal = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex items-center justify-between text-[#e9edef] z-10">
        <span className="text-sm font-medium">{media.filename || 'Media View'}</span>
        <div className="flex items-center gap-3">
          <a 
            href={media.url} 
            download={media.filename || 'whatsapp-media'}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Download size={20} />
          </a>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center max-h-[85vh]">
        {media.type === 'image' ? (
          <img 
            src={media.url} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <video 
            src={media.url} 
            controls 
            autoPlay 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        )}
      </div>

      <div className="h-6"></div>
    </div>
  );
};
