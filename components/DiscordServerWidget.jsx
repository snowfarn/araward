'use client';

import { Users, Radio, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscordServerWidget({
  serverData,
  style = 'banner_card',
  primaryColor = '#ff2a44',
  textColor = '#ffffff',
  previewMode = false,
  cardStyle = 'glass'
}) {
  if (!serverData || !serverData.name) return null;

  const {
    name,
    description,
    icon,
    banner,
    memberCount,
    presenceCount,
    inviteUrl
  } = serverData;

  const formatCount = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const handleJoin = (e) => {
    if (previewMode) {
      e.preventDefault();
      return;
    }
    if (inviteUrl) {
      window.open(inviteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Card background styling based on cardStyle
  const cardBgClasses = cardStyle === 'transparent'
    ? 'bg-transparent border border-white/10'
    : cardStyle === 'ultra_glass'
    ? 'bg-black/20 backdrop-blur-3xl border border-white/15'
    : cardStyle === 'dark'
    ? 'bg-black/90 backdrop-blur-3xl border border-white/20 shadow-2xl'
    : 'bg-black/60 backdrop-blur-2xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8)]';

  // ==========================================
  // STYLE 1: BANNER CARD (Hero Server Card)
  // ==========================================
  if (style === 'banner_card') {
    return (
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-[420px] rounded-3xl overflow-hidden relative group my-2 ${cardBgClasses} ${previewMode ? 'select-none pointer-events-none' : ''}`}
      >
        {/* Banner Area */}
        <div className="relative h-24 sm:h-28 w-full bg-neutral-900 overflow-hidden">
          {banner ? (
            <img 
              src={banner} 
              alt={name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, #1e1f2b 0%, #2b2d42 50%, ${primaryColor}40 100%)` }}
            />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Top Discord Server Tag Badge */}
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white/80 flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-pulse" />
            <span>DISCORD SERVER</span>
          </div>
        </div>

        {/* Server Content */}
        <div className="p-4 pt-0 relative">
          {/* Floating Icon overlapping banner */}
          <div className="flex items-end justify-between -mt-9 mb-3">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-[#09090e] shadow-2xl bg-black p-0.5">
              {icon ? (
                <img src={icon} alt={name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-[#5865F2] flex items-center justify-center rounded-xl font-bold text-xl text-white font-mono">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Member Stats Badges */}
            <div className="flex items-center gap-2 pb-1">
              <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 flex items-center gap-1.5 text-[10px] font-mono text-white/80 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-bold">{formatCount(presenceCount)}</span>
                <span className="text-white/40 hidden sm:inline">Online</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 flex items-center gap-1.5 text-[10px] font-mono text-white/70 shadow-sm">
                <Users size={12} className="text-white/50" />
                <span className="font-bold">{formatCount(memberCount)}</span>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-left space-y-1 mb-3.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-white tracking-wide truncate" style={{ color: textColor }}>
                {name}
              </h3>
              <ShieldCheck size={16} className="text-[#5865F2] shrink-0" />
            </div>
            {description && (
              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed font-light">
                {description}
              </p>
            )}
          </div>

          {/* Action Join Button */}
          <button
            type="button"
            onClick={handleJoin}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              previewMode ? 'cursor-default opacity-85' : 'cursor-pointer hover:shadow-[0_0_20px_rgba(88,101,242,0.5)]'
            }`}
            style={{ 
              backgroundColor: '#5865F2',
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' 
            }}
          >
            <span>เข้าร่วมเซิร์ฟเวอร์ (Join Discord)</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ==========================================
  // STYLE 2: COMPACT GLASS DOCK (Minimal Bar)
  // ==========================================
  if (style === 'compact_dock') {
    return (
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-[420px] rounded-2xl p-3 flex items-center justify-between gap-3 my-2 border border-white/15 backdrop-blur-2xl ${cardBgClasses} ${previewMode ? 'select-none pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black">
            {icon ? (
              <img src={icon} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#5865F2] flex items-center justify-center font-bold text-sm text-white">
                {name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate" style={{ color: textColor }}>
              {name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {formatCount(presenceCount)}
              </span>
              <span>•</span>
              <span>{formatCount(memberCount)} members</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleJoin}
          className="px-3.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shrink-0 transition-all shadow-md flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <span>Join</span>
          <ExternalLink size={11} />
        </button>
      </motion.div>
    );
  }

  // ==========================================
  // STYLE 3: CYBER SPOTLIGHT (Neon High-Tech)
  // ==========================================
  if (style === 'cyber_spotlight') {
    return (
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-[420px] rounded-3xl p-4 sm:p-5 relative overflow-hidden my-2 border border-[#5865F2]/40 bg-[#080912]/90 backdrop-blur-3xl shadow-[0_0_30px_rgba(88,101,242,0.25)] ${previewMode ? 'select-none pointer-events-none' : ''}`}
      >
        {/* Animated Cyber Corner Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#5865F2]/30 via-transparent to-transparent pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-[#5865F2]/60 shadow-[0_0_15px_rgba(88,101,242,0.4)] bg-black p-0.5">
              {icon ? (
                <img src={icon} alt={name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-[#5865F2] flex items-center justify-center font-bold text-lg text-white">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-left min-w-0">
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#818cf8] flex items-center gap-1">
                <Sparkles size={10} />
                VERIFIED GUILD
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white truncate" style={{ color: textColor }}>
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {formatCount(presenceCount)} Online
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  {formatCount(memberCount)} Members
                </span>
              </div>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-xs text-white/60 line-clamp-2 text-left mb-3.5 font-light leading-relaxed">
            {description}
          </p>
        )}

        <button
          type="button"
          onClick={handleJoin}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#5865F2] to-[#7983f5] shadow-[0_0_15px_rgba(88,101,242,0.5)] hover:shadow-[0_0_25px_rgba(88,101,242,0.8)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>เข้าร่วมเซิร์ฟเวอร์ดิสคอร์ด</span>
          <ExternalLink size={13} />
        </button>
      </motion.div>
    );
  }

  // ==========================================
  // STYLE 4: MINIMAL CHIP (Clean minimal tag)
  // ==========================================
  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      onClick={handleJoin}
      className={`w-full max-w-[420px] rounded-2xl p-2.5 px-3.5 flex items-center justify-between gap-3 my-2 border border-white/10 hover:border-[#5865F2]/50 bg-black/50 hover:bg-black/70 backdrop-blur-xl transition-all group ${
        previewMode ? 'select-none pointer-events-none' : 'cursor-pointer hover:scale-[1.01]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black">
          {icon ? (
            <img src={icon} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#5865F2] flex items-center justify-center font-bold text-xs text-white">
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="text-left min-w-0">
          <p className="text-xs font-bold text-white truncate group-hover:text-[#818cf8] transition-colors">
            {name}
          </p>
          <p className="text-[10px] font-mono text-white/40">
            {formatCount(memberCount)} members
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-white/50 group-hover:text-white font-mono">
        <span className="text-[10px] uppercase font-bold text-[#818cf8]">JOIN</span>
        <ExternalLink size={11} />
      </div>
    </motion.div>
  );
}
