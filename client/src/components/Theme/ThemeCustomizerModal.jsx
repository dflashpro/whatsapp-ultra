import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, Check } from 'lucide-react';

export const ThemeCustomizerModal = () => {
  const { 
    showThemeModal, 
    setShowThemeModal, 
    theme, 
    changeTheme, 
    wallpaper, 
    changeWallpaper 
  } = useAuth();

  if (!showThemeModal) return null;

  const themes = [
    { id: 'emerald', name: 'Emerald Obsidian', color: '#00a884', desc: 'Signature WhatsApp VIP Dark' },
    { id: 'gold', name: 'Luxury Gold & Slate', color: '#d4af37', desc: 'Champagne & Metallic Accents' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#06b6d4', desc: 'Electric Cyan & Deep Violet' },
    { id: 'ocean', name: 'Sapphire Ocean', color: '#38bdf8', desc: 'Midnight Marine & Sky Blue' },
    { id: 'light', name: 'Pearl Cream Light', color: '#128c7e', desc: 'Crisp Luxury Light Mode' }
  ];

  const wallpapers = [
    { id: 'doodle', name: 'Classic Doodle Pattern' },
    { id: 'matrix', name: 'Cyber Matrix Grid' },
    { id: 'stars', name: 'Midnight Deep Space' },
    { id: 'minimal', name: 'Pure Obsidian Minimal' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl space-y-6 text-[#e9edef]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles size={22} className="text-amber-400" />
            <h2 className="text-base font-bold">Theme & Wallpaper Studio</h2>
          </div>
          <button onClick={() => setShowThemeModal(false)} className="p-1.5 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Theme Options */}
        <div>
          <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-3">
            Choose Color Palette
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {themes.map(t => (
              <div
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                  theme === t.id 
                    ? 'bg-white/10 border-[#00a884] shadow-lg' 
                    : 'bg-black/30 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: t.color }}></span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-[#8696a0]">{t.desc}</p>
                  </div>
                </div>
                {theme === t.id && <Check size={18} className="text-[#00a884]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Wallpaper Options */}
        <div>
          <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-3">
            Chat Wallpaper
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {wallpapers.map(w => (
              <button
                key={w.id}
                onClick={() => changeWallpaper(w.id)}
                className={`p-3 rounded-xl text-xs font-medium text-left border transition-all ${
                  wallpaper === w.id
                    ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884]'
                    : 'bg-black/30 border-white/5 text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
