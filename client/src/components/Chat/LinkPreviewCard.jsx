import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

const FAKE_PREVIEWS = {
  'youtube': { title: 'YouTube Video', description: 'Watch on YouTube', image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80', favicon: '🎥' },
  'github': { title: 'GitHub Repository', description: 'Open source code repository', image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&q=80', favicon: '🐙' },
  'stackoverflow': { title: 'Stack Overflow', description: 'Find programming answers', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', favicon: '📚' },
};

const getPreview = (url) => {
  const lower = url.toLowerCase();
  for (const [key, val] of Object.entries(FAKE_PREVIEWS)) {
    if (lower.includes(key)) return { ...val, url };
  }
  const domain = url.replace(/https?:\/\//,'').split('/')[0];
  return {
    title: domain,
    description: url.slice(0, 80) + (url.length > 80 ? '...' : ''),
    image: null,
    favicon: '🌐',
    url
  };
};

export const LinkPreviewCard = ({ url }) => {
  const preview = getPreview(url);
  
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 hover:bg-black/50 transition-colors cursor-pointer no-underline mt-2 group"
    >
      {preview.image && (
        <img src={preview.image} alt={preview.title} className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      )}
      <div className="p-2.5 flex items-start gap-2">
        <span className="text-lg mt-0.5 shrink-0">{preview.favicon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#e9edef] truncate">{preview.title}</p>
          <p className="text-[10px] text-[#8696a0] line-clamp-2 mt-0.5">{preview.description}</p>
        </div>
        <ExternalLink size={14} className="text-[#53bdeb] shrink-0 mt-0.5" />
      </div>
    </a>
  );
};
