'use client';

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
  ChevronRight
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

export default function MemberCard({ member, role }) {
  if (!member || !role) return null;

  // Safe color fallback (if role.color is black, fallback to vibrant crimson)
  const roleColor = (role.color && role.color !== '#000000' && role.color.toLowerCase() !== '#000') ? role.color : '#ff2a44';
  const RoleIconComponent = (role.icon && ICON_MAP[role.icon]) ? ICON_MAP[role.icon] : Shield;
  const isCustomIconImage = role.icon && (role.icon.startsWith('http') || role.icon.startsWith('/'));

  return (
    <Link 
      href={`/bio/${member.slug || member.id}`} 
      prefetch={true}
      className="block w-full text-left no-underline select-none"
    >
      <motion.div 
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        className="group rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer relative overflow-hidden backdrop-blur-2xl transition-all duration-300 border shadow-lg hover:shadow-2xl active:scale-[0.98] w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 16, 22, 0.92), rgba(9, 9, 13, 0.97))',
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

      {/* Background Soft Rank Crest Watermark (Subtle depth, 0px flex layout impact) */}
      <div 
        className="absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 pointer-events-none select-none transition-all duration-500 group-hover:scale-105 opacity-[0.06] group-hover:opacity-[0.14]"
        style={{ color: roleColor }}
      >
        {isCustomIconImage ? (
          <img src={role.icon} alt="" className="w-16 h-16 sm:w-18 sm:h-18 object-contain" />
        ) : (
          <RoleIconComponent size={64} />
        )}
      </div>

      {/* Left + Center Area: Avatar & Member Info (Roomy, Clean, Never Cramped) */}
      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0 mr-3 z-10">
        {/* Avatar with Status Dot + Rank Icon Ornament on top-left (Role's own icon!) */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
          {/* Ornamental Rank Icon on Avatar Corner (Straight & Perfectly Aligned) */}
          <div 
            className="absolute -top-1.5 -left-1.5 z-20 w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c1c28] to-[#0a0a0f] border flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ 
              borderColor: role.contrastColor || '#ffffff',
              boxShadow: `0 0 10px ${roleColor}60, 0 2px 6px rgba(0,0,0,0.8)`
            }}
            title={role.name}
          >
            {isCustomIconImage ? (
              <img src={role.icon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
            ) : (
              <RoleIconComponent size={13} className="shrink-0" style={{ color: role.contrastColor || '#ffffff' }} />
            )}
          </div>

          <img 
            src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
            alt={member.name}
            loading="lazy"
            className="w-full h-full rounded-2xl object-cover border border-white/15 bg-black/60 shadow-md group-hover:scale-105 transition-transform duration-300" 
          />
          <div 
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0e0e14] flex items-center justify-center shadow-md"
            style={{ backgroundColor: roleColor, boxShadow: `0 0 10px ${roleColor}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Member Name & Role Badge (Full width, no cramping, never squished!) */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-red-200 transition-colors truncate">
            {member.name}
          </h3>
          
          <div className="flex items-center">
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
                <img src={role.icon} alt="" className="w-3 h-3 object-contain shrink-0" />
              ) : (
                <RoleIconComponent size={12} className="shrink-0" />
              )}
              <span>{role.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Area: Compact Cyber Action Arrow */}
      <div className="shrink-0 z-10">
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
