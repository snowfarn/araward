'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Home, 
  LogIn, 
  Search, 
  Users, 
  Shield, 
  Sparkles, 
  Globe, 
  Bell, 
  Radio, 
  Flame,
  Skull,
  Crown,
  Star,
  Zap,
  Swords,
  Crosshair,
  Gem,
  Ghost,
  Trophy,
  User,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import MemberCard from '@/components/MemberCard';
import { useLanguage } from '@/context/LanguageContext';
import { BRAND_SVGS } from '@/components/BrandIcons';

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

export default function RosterContent({ settings, initialMembers, initialRoles }) {
  const { t, lang, toggleLang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('all');

  const primaryColor = settings?.primaryColor || '#ff2a44';
  const contrastColor = settings?.contrastColor || '#ffffff';
  const siteName = settings?.siteName || 'Sluzmzick';
  const announcement = settings?.announcement;
  const announcementTitle = settings?.announcementTitle || (lang === 'th' ? 'ประกาศสำคัญ' : 'ANNOUNCEMENT');

  // Process Banners (Multi-banner support with GIF & fallback)
  const banners = useMemo(() => {
    if (settings?.banners && Array.isArray(settings.banners) && settings.banners.length > 0) {
      return settings.banners;
    }
    if (settings?.announcementBannerUrl) {
      return [{ id: 'b-legacy', url: settings.announcementBannerUrl, caption: '' }];
    }
    return [];
  }, [settings]);

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const slideIntervalSec = Math.max(2, settings?.bannerSlideInterval || 5);

  // Auto-slide effect for banner carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, slideIntervalSec * 1000);
    return () => clearInterval(timer);
  }, [banners.length, slideIntervalSec]);

  // Filter members by search query and role
  const filteredMembers = useMemo(() => {
    return initialMembers.filter(m => {
      const matchSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.slug?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRoleId === 'all' || m.roleId === selectedRoleId;
      return matchSearch && matchRole;
    });
  }, [initialMembers, searchQuery, selectedRoleId]);

  return (
    <>
      {/* Top Navbar with integrated Language Switcher & Gang Discord button */}
      <motion.nav 
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-3.5 sm:gap-4 px-4 sm:px-8 py-3.5 sm:py-5 relative z-50 max-w-7xl mx-auto w-full"
      >
        <div className="w-full sm:w-auto flex justify-center sm:justify-start">
          <Link href="/" className="font-extrabold text-base sm:text-xl text-white flex items-center gap-2.5 tracking-tight group">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-105 transition-transform overflow-hidden p-0.5 border shrink-0"
              style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}60` }}
            >
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={siteName} className="w-full h-full object-contain rounded-full" />
              ) : (
                <Crown size={18} style={{ color: primaryColor }} />
              )}
            </div>
            <span style={{ color: primaryColor, filter: `drop-shadow(0 0 12px ${primaryColor}70)` }}>
              {siteName}
            </span>
          </Link>
        </div>

        {/* Navigation Action Buttons */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-end gap-2 sm:gap-2.5 items-center flex-wrap">
          
          {/* Gang Discord Contact Button */}
          {settings?.discordInviteUrl && (
            <a 
              href={settings.discordInviteUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2]/20 hover:bg-[#5865F2]/35 border border-[#5865F2]/45 hover:border-[#5865F2] text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(88,101,242,0.25)] hover:scale-105 active:scale-95"
              title="Discord"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0 block">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="leading-none">Discord</span>
            </a>
          )}

          <Link 
            href="/" 
            className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-3.5 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
          >
            <Home size={14} /> 
            <span>{t.nav?.home || 'HOME'}</span>
          </Link>

          <Link 
            href="/dashboard" 
            className="bg-white text-black px-4 sm:px-4.5 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all hover:bg-neutral-200 flex items-center gap-1.5 shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:scale-105"
          >
            <LogIn size={14} /> 
            <span>{t.nav?.dashboard || 'LOGIN'}</span>
          </Link>

          {/* Integrated Language Switcher */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white text-xs font-bold tracking-wider transition-all cursor-pointer shadow-md hover:scale-105"
            title="Switch Language / เปลี่ยนภาษา"
          >
            <Globe size={13} className="text-[#ff2a44]" />
            <span className={lang === 'th' ? 'text-white' : 'text-white/40'}>TH</span>
            <span className="text-white/20 text-[10px]">/</span>
            <span className={lang === 'en' ? 'text-white' : 'text-white/40'}>EN</span>
          </button>
        </div>
      </motion.nav>

      {/* Main Roster Container */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 z-10 font-sans">
        
        {/* Header Title & Slogan */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-bold text-white/80 tracking-widest uppercase mb-2.5"
          >
            <Sparkles size={12} className="text-[#ff2a44]" />
            <span>{t.roster?.badge || 'OFFICIAL ROSTER'}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-extrabold tracking-tight mb-2 text-transparent bg-clip-text"
            style={{ 
              fontSize: 'clamp(2.2rem, 7vw, 4rem)',
              backgroundImage: `linear-gradient(180deg, ${contrastColor} 20%, #ffffff 60%, ${primaryColor} 100%)`,
              filter: `drop-shadow(0 0 25px ${primaryColor}60)`
            }}
          >
            {t.roster?.title || 'ROSTER'}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/60 text-xs sm:text-sm font-light tracking-wide uppercase max-w-md mx-auto"
          >
            {t.roster?.subtitle || 'MEET OUR MEMBERS'}
          </motion.p>
        </div>

        {/* 1. AUTO-SLIDING BANNER CAROUSEL (Above Announcement, Supports Multi-image & GIF) */}
        {banners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-3xl overflow-hidden relative border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] group bg-black/60 backdrop-blur-2xl"
          >
            {/* Auto-fit Aspect Ratio Banner Container */}
            <div className="w-full h-44 sm:h-64 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={banners[activeBannerIdx]?.id || activeBannerIdx}
                  src={banners[activeBannerIdx]?.url}
                  alt="Syndicate Banner"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Edge Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Manual Nav Arrows (visible on hover) */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveBannerIdx(prev => (prev - 1 + banners.length) % banners.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveBannerIdx(prev => (prev + 1) % banners.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Carousel Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {banners.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveBannerIdx(dotIdx)}
                        className={`transition-all rounded-full cursor-pointer ${
                          activeBannerIdx === dotIdx 
                            ? 'w-6 h-1.5 bg-[#ff2a44]' 
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* 2. SCROLLING TEXT ANNOUNCEMENT TICKER (Above Search Bar) */}
        {announcement && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl bg-black/55 border border-white/10 px-3.5 sm:px-4 py-2.5 flex items-center gap-3 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            {/* Announcement Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff2a44]/20 border border-[#ff2a44]/40 text-[#ff2a44] text-[11px] font-bold tracking-wider shrink-0 uppercase font-mono">
              <Radio size={12} className="animate-pulse" />
              <span>{announcementTitle}</span>
            </div>

            {/* Continuous Scrolling Text Marquee */}
            <div className="overflow-hidden whitespace-nowrap flex-1 relative">
              <div className="inline-block animate-marquee font-medium text-xs sm:text-sm text-white/90">
                {announcement}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. SEARCH & ROLE FILTER BAR (Below Announcement) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col sm:flex-row gap-3.5 items-center justify-between bg-black/45 backdrop-blur-2xl border border-white/10 p-3 sm:p-4 rounded-3xl shadow-xl"
        >
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.roster?.searchPlaceholder || 'Search member name...'}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-[#ff2a44] rounded-full py-2.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none transition-colors placeholder:text-white/30"
            />
          </div>

          {/* Role Filter Tabs (Scrollable on mobile) */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedRoleId('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRoleId === 'all' 
                  ? 'bg-white text-black shadow-md font-bold' 
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              {t.roster?.allRoles || 'ALL'} ({initialMembers.length})
            </button>

            {initialRoles.map(role => {
              const count = initialMembers.filter(m => m.roleId === role.id).length;
              const isSelected = selectedRoleId === role.id;
              const RoleIconComponent = (role.icon && ICON_MAP[role.icon]) ? ICON_MAP[role.icon] : Shield;
              const isCustomIconImage = role.icon && (role.icon.startsWith('http') || role.icon.startsWith('/'));
              const roleColor = (role.color && role.color !== '#000000' && role.color.toLowerCase() !== '#000') ? role.color : '#ff2a44';
              const contrastColor = role.contrastColor || '#ffffff';

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    isSelected 
                      ? 'shadow-md font-bold' 
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                  }`}
                  style={isSelected ? { 
                    backgroundColor: roleColor, 
                    color: contrastColor,
                    boxShadow: `0 0 15px ${roleColor}60`,
                    border: `1px solid ${contrastColor}50`
                  } : {}}
                >
                  {isCustomIconImage ? (
                    <img src={role.icon} alt="" className="w-3 h-3 object-contain shrink-0" />
                  ) : (
                    <RoleIconComponent size={12} className="shrink-0" style={isSelected ? { color: contrastColor } : {}} />
                  )}
                  <span>{role.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 4. ROLES DISPLAY WITH MEMBERS GRID (Respecting Role Order) */}
        {initialRoles.map(role => {
          const roleMembers = filteredMembers.filter(m => m.roleId === role.id);
          if (roleMembers.length === 0) return null;

          const RoleIconComponent = (role.icon && ICON_MAP[role.icon]) ? ICON_MAP[role.icon] : Shield;
          const isCustomIconImage = role.icon && (role.icon.startsWith('http') || role.icon.startsWith('/'));
          const roleColor = (role.color && role.color !== '#000000' && role.color.toLowerCase() !== '#000') ? role.color : '#ff2a44';
          const contrastColor = role.contrastColor || '#ffffff';

          return (
            <div key={role.id} className="mb-10">
              {/* Role Section Divider Header */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${roleColor}80)` }} />
                
                <div 
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-xs sm:text-sm font-bold tracking-wider shadow-sm border"
                  style={{ 
                    color: contrastColor, 
                    backgroundColor: roleColor,
                    borderColor: `${contrastColor}40`,
                    boxShadow: `0 0 20px ${roleColor}35` 
                  }}
                >
                  {isCustomIconImage ? (
                    <img src={role.icon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                  ) : (
                    <RoleIconComponent size={14} className="shrink-0" style={{ color: contrastColor }} />
                  )}
                  <span>{role.name}</span>
                  <span className="text-[11px] opacity-80 font-normal ml-1">
                    [{roleMembers.length}]
                  </span>
                </div>

                <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(-90deg, transparent, ${roleColor}80)` }} />
              </div>

              {/* Members Grid (1 person per row on mobile, 3 people per row on PC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                {roleMembers.map(member => (
                  <MemberCard key={member.id} member={member} role={role} />
                ))}
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <Users size={40} className="mx-auto text-white/20 mb-2.5" />
            <p className="text-white/40 text-xs sm:text-sm font-medium">
              {t.roster?.noMembers || 'No members found matching your search.'}
            </p>
          </div>
        )}

        {/* Footer Credit (DEV UFA SLUMZICK -> Instagram: @gkbyontop) */}
        <div className="mt-12 flex justify-center pb-8">
          <a 
            href="https://www.instagram.com/gkbyontop/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 hover:bg-black/90 border border-white/10 hover:border-[#ff2a44]/50 backdrop-blur-md text-[11px] font-mono tracking-widest text-white/60 hover:text-white transition-all shadow-md group cursor-pointer"
            title="Developer Instagram: @gkbyontop"
          >
            <Skull size={13} className="text-[#ff2a44] group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-white/80 group-hover:text-white transition-colors">DEV UFA SLUMZICK</span>
          </a>
        </div>

      </div>
    </>
  );
}
