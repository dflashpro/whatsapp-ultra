import React from 'react';

const LINK_RE = /(https?:\/\/[^\s]+)/g;
const BOLD_RE = /\*([^*]+)\*/g;
const ITALIC_RE = /_([^_]+)_/g;
const STRIKE_RE = /~([^~]+)~/g;
const CODE_RE = /`([^`]+)`/g;

const parseFormatting = (text) => {
  if (!text) return [];
  
  const segments = [];
  let remaining = text;
  
  // Combined regex for all patterns
  const COMBINED = /(\*[^*]+\*|_[^_]+_|~[^~]+~|`[^`]+`|https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;
  
  const re = new RegExp(COMBINED.source, 'g');
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'plain', text: text.slice(lastIndex, match.index) });
    }
    const val = match[0];
    if (val.startsWith('*') && val.endsWith('*')) {
      segments.push({ type: 'bold', text: val.slice(1, -1) });
    } else if (val.startsWith('_') && val.endsWith('_')) {
      segments.push({ type: 'italic', text: val.slice(1, -1) });
    } else if (val.startsWith('~') && val.endsWith('~')) {
      segments.push({ type: 'strike', text: val.slice(1, -1) });
    } else if (val.startsWith('`') && val.endsWith('`')) {
      segments.push({ type: 'code', text: val.slice(1, -1) });
    } else if (val.startsWith('http')) {
      segments.push({ type: 'link', text: val });
    }
    lastIndex = match.index + val.length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'plain', text: text.slice(lastIndex) });
  }
  return segments.length ? segments : [{ type: 'plain', text }];
};

export const FormattedText = ({ text, className = '' }) => {
  const segments = parseFormatting(text);
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'bold':    return <strong key={i} className="font-extrabold">{seg.text}</strong>;
          case 'italic':  return <em key={i} className="italic">{seg.text}</em>;
          case 'strike':  return <del key={i} className="line-through opacity-70">{seg.text}</del>;
          case 'code':    return <code key={i} className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-[#00a884] text-[0.9em]">{seg.text}</code>;
          case 'link':    return <a key={i} href={seg.text} target="_blank" rel="noopener noreferrer" className="text-[#53bdeb] underline underline-offset-2 hover:text-[#00a884] break-all">{seg.text}</a>;
          default:        return <span key={i}>{seg.text}</span>;
        }
      })}
    </span>
  );
};
