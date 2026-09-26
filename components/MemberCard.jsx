'use client';

import { useState } from 'react';
import { 
  Shield, 
  Crown, 
  Flame, 
  Star, 
  Zap, 
  Skull, 
  Swords, 
  Crosshair, 
  Gem, 
  Ghost, 
  Trophy, 
  Globe, 
  User, 
  Award, 
  Sparkles, 
  ChevronRight,
  Music,
  Eye,
  Check,
  Share2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Icon map for role icons
const ICON_MAP = {
  Crown,
  Shield,
  Flame,
  Star,
  Zap,
  Skull,
  Swords,
  Crosshair,
  Gem,
  Ghost,
  Trophy,
  Globe,
  User,
  Award,
  Sparkles
};

export default function MemberCard({ member, role, viewMode = 'grid' }) {
  const [copied, setCopied] = useState(false);

  if (!member || !role) return null;

  // Safe color fallback (if role.color is black, fallback to vibrant crimson)
  const roleColor = (role.color && role.color !== '#000000' && role.color.toLowerCase() !== '#000') ? role.color : '#ff2a44';
  const contrastColor = role.contrastColor || '#ffffff';
  const RoleIconComponent = (role.icon && ICON_MAP[role.icon]) ? ICON_MAP[role.icon] : Shield;
  const isCustomIconImage = role.icon && (role.icon.startsWith('http') || role.icon.startsWith('/'));

  const bioUrl = `/bio/${member.slug || member.id}`;
  const hasMusic = Boolean(member.musicUrl);
  const statusText = member.discordStatusText || member.bio || '';

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${bioUrl}`;
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // ==========================================
  // VIEW MODE 1: BENTO / SHOWCASE CARD (Rich Layout)
  // ==========================================
  if (viewMode === 'bento') {
    return (
      <Link 
        href={bioUrl} 
        prefetch={true}
        className="block w-full text-left no-underline select-none"
      >
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          className="group rounded-3xl overflow-hidden cursor-pointer relative bg-gradient-to-b from-[#14141e]/95 via-[#0d0d14]/98 to-[#07070b] border shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between content-visibility-auto"
          style={{
            borderColor: `${roleColor}40`,
            boxShadow: `0 12px 30px rgba(0,0,0,0.6), 0 0 15px ${roleColor}10`
          }}
        >
          {/* Header Banner Backdrop */}
          <div className="relative h-20 sm:h-24 w-full bg-neutral-900 overflow-hidden">
            {member.backgroundUrl ? (
              <img 
                src={member.backgroundUrl} 
                alt="" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div 
                className="w-full h-full"
                style={{ 
                  background: `linear-gradient(135deg, #161622 0%, #1a0b12 50%, ${roleColor}35 100%)` 
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e16] via-black/40 to-transparent" />
            
            {/* Top Right: Views Counter & Share Button */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
              {member.views > 0 && (
                <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80 flex items-center gap-1">
                  <Eye size={10} className="text-amber-400" />
                  <span>{member.views}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Copy Profile Link"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Share2 size={11} />}
              </button>
            </div>
          </div>

          {/* Bento Body */}
          <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
            <div>
              {/* Floating Avatar Overlapping Banner */}
              <div className="flex items-end justify-between -mt-8 mb-2.5">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0e0e16] shadow-xl bg-black shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                  {/* Status Indicator */}
                  <div 
                    className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0e0e14] flex items-center justify-center shadow-md"
                    style={{ backgroundColor: roleColor }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Role Badge */}
                <div 
                  className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider inline-flex items-center gap-1.5 shadow-md border"
                  style={{ 
                    backgroundColor: roleColor, 
                    color: contrastColor,
                    borderColor: `${contrastColor}30`,
                    boxShadow: `0 0 15px ${roleColor}40`
                  }}
                >
                  {isCustomIconImage ? (
                    <img src={role.icon} alt="" loading="lazy" decoding="async" className="w-3.5 h-3.5 object-contain shrink-0" />
                  ) : (
                    <RoleIconComponent size={12} className="shrink-0" style={{ color: contrastColor }} />
                  )}
                  <span>{role.name}</span>
                </div>
              </div>

              {/* Member Name */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white tracking-wide group-hover:text-red-200 transition-colors truncate">
                  {member.name}
                </h3>
                {member.discordBadge && (
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold text-white/90 border border-white/15">
                    {member.discordBadge}
                  </span>
                )}
              </div>

              {/* Status / Quote */}
              {statusText ? (
                <p className="text-xs text-white/60 font-light line-clamp-1 italic mb-3">
                  "{statusText}"
                </p>
              ) : (
                <div className="h-4 mb-2" />
              )}
            </div>

            {/* Bottom Row: Handles, Audio Wave, & Arrow */}
            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] text-white/50 font-mono">
              <div className="flex items-center gap-2 truncate">
                {member.robloxUsername && (
                  <span className="truncate">RBX: {member.robloxUsername}</span>
                )}
                {hasMusic && (
                  <span className="inline-flex items-center gap-1 text-[#ff2a44] font-semibold bg-[#ff2a44]/15 px-2 py-0.5 rounded-full border border-[#ff2a44]/30">
                    <Music size={10} className="animate-bounce" />
                    <span>AUDIO</span>
                  </span>
                )}
              </div>

              <div className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-[#ff2a44] text-white/60 group-hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // ==========================================
  // VIEW MODE 2: COMPACT LIST MODE (Tournament / Fast Scan)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <Link 
        href={bioUrl} 
        prefetch={true}
        className="block w-full text-left no-underline select-none"
      >
        <motion.div 
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.99 }}
          className="group rounded-2xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer relative overflow-hidden bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all duration-200 shadow-md content-visibility-auto"
        >
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0">
              <img 
                src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                alt={member.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover" 
              />
              <span 
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black"
                style={{ backgroundColor: roleColor }}
              />
            </div>

            <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide truncate group-hover:text-red-200">
                  {member.name}
                </h4>
                {member.discordBadge && (
                  <span className="text-[10px] font-mono px-1 rounded bg-white/10 text-white/80">
                    {member.discordBadge}
                  </span>
                )}
              </div>

              {statusText && (
                <span className="text-xs text-white/40 truncate max-w-xs hidden md:inline-block">
                  {statusText}
                </span>
              )}
            </div>
          </div>

          {/* Right: Role Pill + Link */}
          <div className="flex items-center gap-3 shrink-0">
            <span 
              className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
              style={{ 
                color: roleColor, 
                backgroundColor: `${roleColor}15`, 
                borderColor: `${roleColor}40` 
              }}
            >
              {role.name}
            </span>

            {hasMusic && (
              <span className="hidden sm:inline-flex text-[#ff2a44]" title="Music Available">
                <Music size={13} />
              </span>
            )}

            <ChevronRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      </Link>
    );
  }

  // ==========================================
  // VIEW MODE 3: GRID MODE (Standard Cyberpunk 3D Card)
  // ==========================================
  return (
    <Link 
      href={bioUrl} 
      prefetch={true}
      className="block w-full text-left no-underline select-none"
    >
      <motion.div 
        whileHover={{ y: -3, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="group rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer relative overflow-hidden backdrop-blur-2xl transition-all duration-300 border shadow-lg hover:shadow-2xl active:scale-[0.98] w-full content-visibility-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 16, 24, 0.94), rgba(9, 9, 14, 0.98))',
          borderColor: `${roleColor}35`,
          boxShadow: `0 10px 25px rgba(0,0,0,0.5), 0 0 15px ${roleColor}10`,
        }}
      >
        {/* Top Edge Ambient Neon Accent Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${roleColor}, transparent)` }}
        />

        {/* Ambient background hover glow */}
        <div 
          className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: roleColor }}
        />

        {/* Background Soft Rank Crest Watermark */}
        <div 
          className="absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 pointer-events-none select-none transition-all duration-500 group-hover:scale-105 opacity-[0.05] group-hover:opacity-[0.14]"
          style={{ color: roleColor }}
        >
          {isCustomIconImage ? (
            <img src={role.icon} alt="" loading="lazy" decoding="async" className="w-16 h-16 sm:w-18 sm:h-18 object-contain" />
          ) : (
            <RoleIconComponent size={64} />
          )}
        </div>

        {/* Left + Center Area: Avatar & Member Info */}
        <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0 mr-2 z-10">
          {/* Avatar with Status Dot + Rank Icon Ornament */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
            {/* Ornamental Rank Icon on Avatar Corner */}
            <div 
              className="absolute -top-1.5 -left-1.5 z-20 w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c1c28] to-[#0a0a0f] border flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{ 
                borderColor: role.contrastColor || '#ffffff',
                boxShadow: `0 0 10px ${roleColor}60, 0 2px 6px rgba(0,0,0,0.8)`
              }}
              title={role.name}
            >
              {isCustomIconImage ? (
                <img src={role.icon} alt="" loading="lazy" decoding="async" className="w-3.5 h-3.5 object-contain shrink-0" />
              ) : (
                <RoleIconComponent size={13} className="shrink-0" style={{ color: role.contrastColor || '#ffffff' }} />
              )}
            </div>

            <img 
              src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
              alt={member.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full rounded-2xl object-cover border border-white/15 bg-black/60 shadow-md group-hover:scale-105 transition-transform duration-300" 
            />
            {/* Live Indicator */}
            <div 
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0e0e14] flex items-center justify-center shadow-md"
              style={{ backgroundColor: roleColor, boxShadow: `0 0 10px ${roleColor}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Member Name & Role Badge */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-red-200 transition-colors truncate">
                {member.name}
              </h3>
              {member.discordBadge && (
                <span className="text-[9px] font-mono px-1 rounded bg-white/10 text-white/70">
                  {member.discordBadge}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span 
                className="text-[10px] sm:text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                style={{ 
                  color: roleColor, 
                  border: `1px solid ${roleColor}55`,
                  background: `${roleColor}15`,
                  boxShadow: `0 0 12px ${roleColor}20`
                }}
              >
                {isCustomIconImage ? (
                  <img src={role.icon} alt="" loading="lazy" decoding="async" className="w-3 h-3 object-contain shrink-0" />
                ) : (
                  <RoleIconComponent size={12} className="shrink-0" />
                )}
                <span>{role.name}</span>
              </span>

              {hasMusic && (
                <span className="text-[#ff2a44] text-[10px] flex items-center gap-0.5 font-mono" title="Custom Music">
                  <Music size={10} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Action Arrow & Quick Share */}
        <div className="shrink-0 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-8 h-8 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Copy profile link"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
          </button>

          <div 
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl sm:rounded-2xl bg-white/5 group-hover:bg-[#ff2a44] border border-white/10 group-hover:border-[#ff2a44] text-white/50 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(255,42,68,0.4)]"
          >
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
