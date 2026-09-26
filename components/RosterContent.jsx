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
  ChevronRight,
  LayoutGrid,
  List,
  Columns,
  ArrowUpDown,
  X,
  Play,
  Pause,
  Maximize2,
  Copy,
  Check,
  Handshake
} from 'lucide-react';
import MemberCard from '@/components/MemberCard';
import PartnerShowcase from '@/components/PartnerShowcase';
import { useLanguage } from '@/context/LanguageContext';

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

export default function RosterContent({ settings, initialMembers = [], initialRoles = [], siteViews = 0 }) {
  const { t, lang, toggleLang } = useLanguage();

  // Search, Role, Sort, and View Modes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('all');
  const [sortBy, setSortBy] = useState('role'); // 'role', 'name', 'views'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'bento', 'list'

  // Announcement Modal State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);

  // Banner Lightbox / Zoom State
  const [isBannerZoomOpen, setIsBannerZoomOpen] = useState(false);
  const [isBannerPlaying, setIsBannerPlaying] = useState(true);

  const primaryColor = settings?.primaryColor || '#ff2a44';
  const contrastColor = settings?.contrastColor || '#ffffff';
  const siteName = settings?.siteName || 'Slumzick';
  const announcement = settings?.announcement;
  const announcementTitle = settings?.announcementTitle || (lang === 'th' ? 'ประกาศสำคัญ' : 'ANNOUNCEMENT');

  // Process Banners (Multi-banner with GIF, image, caption)
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
  const slideIntervalSec = Math.max(3, settings?.bannerSlideInterval || 5);

  // High-performance auto-slide: ONLY fires once every slideIntervalSec seconds (0% CPU impact)
  useEffect(() => {
    if (banners.length <= 1 || !isBannerPlaying) return;

    const timer = setInterval(() => {
      setActiveBannerIdx(current => (current + 1) % banners.length);
    }, slideIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [banners.length, slideIntervalSec, isBannerPlaying]);

  const handleBannerChange = (newIdx) => {
    setActiveBannerIdx(newIdx);
  };

  // Syndicate Statistics Calculations (Bio views of all members + total website visits)
  const stats = useMemo(() => {
    const totalMembers = initialMembers.length;
    const memberBioViews = initialMembers.reduce((sum, m) => sum + (Number(m.views) || 0), 0);
    const siteVisitViews = Math.max(0, Number(siteViews) || Number(settings?.siteViews) || 0);
    const totalViews = memberBioViews + siteVisitViews;
    const totalRoles = initialRoles.length;
    const totalPartners = Array.isArray(settings?.partners) ? settings.partners.length : 0;
    return {
      totalMembers,
      totalViews,
      memberBioViews,
      siteVisitViews,
      totalRoles,
      totalPartners
    };
  }, [initialMembers, initialRoles, settings, siteViews]);

  // Filtering & Sorting members
  const filteredMembers = useMemo(() => {
    let result = initialMembers.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) {
        return selectedRoleId === 'all' || m.roleId === selectedRoleId;
      }
      const matchSearch =
        m.name?.toLowerCase().includes(q) ||
        m.slug?.toLowerCase().includes(q) ||
        m.robloxUsername?.toLowerCase().includes(q) ||
        m.discordUsername?.toLowerCase().includes(q) ||
        m.discordStatusText?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q);
      const matchRole = selectedRoleId === 'all' || m.roleId === selectedRoleId;
      return matchSearch && matchRole;
    });

    // Sort result
    if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // Default: sort by role order defined in initialRoles
      const roleOrderMap = new Map();
      initialRoles.forEach((r, idx) => roleOrderMap.set(r.id, idx));
      result.sort((a, b) => {
        const orderA = roleOrderMap.has(a.roleId) ? roleOrderMap.get(a.roleId) : 999;
        const orderB = roleOrderMap.has(b.roleId) ? roleOrderMap.get(b.roleId) : 999;
        return orderA - orderB;
      });
    }

    return result;
  }, [initialMembers, searchQuery, selectedRoleId, sortBy, initialRoles]);

  const handleCopyAnnouncement = () => {
    if (typeof window !== 'undefined' && announcement) {
      navigator.clipboard.writeText(`${announcementTitle}\n\n${announcement}`).then(() => {
        setCopiedAnnouncement(true);
        setTimeout(() => setCopiedAnnouncement(false), 2000);
      });
    }
  };

  return (
    <>
      {/* 
        ============================================================
        1. TOP COMMAND BAR (Logo, Syndicate Discord, Home, Dashboard, Lang)
        ============================================================
      */}
      <motion.nav
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-3.5 sm:gap-4 px-4 sm:px-8 py-3.5 sm:py-5 relative z-50 max-w-7xl mx-auto w-full"
      >
        <div className="w-full sm:w-auto flex justify-between sm:justify-start items-center">
          <Link href="/" className="font-extrabold text-base sm:text-xl text-white flex items-center gap-2.5 tracking-tight group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-105 transition-transform overflow-hidden p-0.5 border shrink-0 bg-black/60"
              style={{ borderColor: `${primaryColor}60` }}
            >
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={siteName} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Crown size={20} style={{ color: primaryColor }} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold tracking-wider leading-none" style={{ color: primaryColor, filter: `drop-shadow(0 0 12px ${primaryColor}70)` }}>
                {siteName}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase mt-0.5">
                SYNDICATE HQ
              </span>
            </div>
          </Link>

          {/* Mobile Direct Discord Link */}
          {settings?.discordInviteUrl && (
            <a
              href={settings.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden bg-[#5865F2]/20 border border-[#5865F2]/45 text-white p-2 rounded-xl text-xs flex items-center justify-center shadow-md"
              title="Official Discord"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white block">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-end gap-2 sm:gap-2.5 items-center flex-wrap">
          {settings?.discordInviteUrl && (
            <a
              href={settings.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex bg-[#5865F2]/20 hover:bg-[#5865F2] border border-[#5865F2]/45 hover:border-[#5865F2] text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all items-center justify-center gap-2 shadow-[0_4px_15px_rgba(88,101,242,0.25)] hover:scale-105 active:scale-95"
              title="Official Syndicate Discord"
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
            <Globe size={13} style={{ color: primaryColor }} />
            <span className={lang === 'th' ? 'text-white' : 'text-white/40'}>TH</span>
            <span className="text-white/20 text-[10px]">/</span>
            <span className={lang === 'en' ? 'text-white' : 'text-white/40'}>EN</span>
          </button>
        </div>
      </motion.nav>

      {/* 
        ============================================================
        MAIN ROSTER CONTAINER
        ============================================================
      */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 z-10 font-sans">

        {/* 
          ============================================================
          2. GRAND SYNDICATE HERO (Majestic Crown Crest, Status Beacon)
          ============================================================
        */}
        <div className="text-center mb-6 sm:mb-8 relative">

          {/* Ambient Crown Crest Centerpiece */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-3"
          >
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-60 scale-150 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${primaryColor} 20%, transparent 75%)` }}
            />

            <div className="relative flex items-center justify-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#18050c] via-black to-[#0d0206] border-2 flex items-center justify-center backdrop-blur-2xl shadow-2xl p-2.5"
                style={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 30px ${primaryColor}50, inset 0 0 20px ${primaryColor}30`
                }}
              >
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt={siteName} className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <Crown size={28} className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                )}
              </div>

              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }} />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-black" style={{ backgroundColor: primaryColor }} />
              </span>
            </div>
          </motion.div>

          {/* Operational Status Pill */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono font-bold tracking-widest uppercase text-white/80 shadow-lg">
              <Sparkles size={12} style={{ color: primaryColor }} />
              <span>{lang === 'th' ? 'ทำเนียบสายเลือดแท้ • SYNDICATE DIRECTORY' : 'OFFICIAL SYNDICATE DIRECTORY'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Commanding Hero Title */}
          <h1
            className="font-heading font-extrabold tracking-tight mb-2 text-transparent bg-clip-text uppercase select-none"
            style={{
              fontSize: 'clamp(2.4rem, 7.5vw, 4.4rem)',
              lineHeight: 1.1,
              backgroundImage: `linear-gradient(180deg, #ffffff 10%, #f1f5f9 55%, ${primaryColor} 100%)`,
              filter: `drop-shadow(0 0 35px ${primaryColor}65)`
            }}
          >
            {t.roster?.title || 'ทำเนียบสมาชิก'}
          </h1>

          <p className="text-white/60 text-xs sm:text-sm font-light tracking-wide uppercase max-w-lg mx-auto leading-relaxed">
            {t.roster?.subtitle || 'รายนามผู้มีเกียรติและตำแหน่งบังคับบัญชาทั้งหมดในองค์กร'}
          </p>
        </div>

        {/* 
          ============================================================
          3. HUD SYNDICATE STATISTICS BAR
          ============================================================
        */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-6">
          {/* Stat 1: Total Operatives */}
          <div className="rounded-2xl p-3 sm:p-3.5 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 shadow-lg">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor
              }}
            >
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                {lang === 'th' ? 'สมาชิกรวม' : 'TOTAL MEMBERS'}
              </span>
              <span className="text-base sm:text-lg font-heading font-extrabold text-white">
                {stats.totalMembers} <span className="text-xs font-normal text-white/50">{lang === 'th' ? 'นาย' : 'ops'}</span>
              </span>
            </div>
          </div>

          {/* Stat 2: Hierarchy Ranks */}
          <div className="rounded-2xl p-3 sm:p-3.5 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Shield size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                {lang === 'th' ? 'ลำดับยศ' : 'HIERARCHY'}
              </span>
              <span className="text-base sm:text-lg font-heading font-extrabold text-white">
                {stats.totalRoles} <span className="text-xs font-normal text-white/50">{lang === 'th' ? 'ชั้นยศ' : 'ranks'}</span>
              </span>
            </div>
          </div>

          {/* Stat 3: Total Views (Member Bios + Site Visits) */}
          <div className="rounded-2xl p-3 sm:p-3.5 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                {lang === 'th' ? 'ยอดการเข้าชมรวม' : 'TOTAL VIEWS'}
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-heading font-extrabold text-white">
                  {stats.totalViews.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stat 4: Syndicate Alliances */}
          <div className="rounded-2xl p-3 sm:p-3.5 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shrink-0">
              <Handshake size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                {lang === 'th' ? 'พันธมิตรแก๊ง' : 'ALLIANCES'}
              </span>
              <span className="text-base sm:text-lg font-heading font-extrabold text-white">
                {stats.totalPartners} <span className="text-xs font-normal text-white/50">{lang === 'th' ? 'กิลด์' : 'guilds'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 
          ============================================================
          4. REVAMPED SYNDICATE BANNER CAROUSEL
          ============================================================
        */}
        {banners.length > 0 && (
          <div className="mb-5 rounded-3xl overflow-hidden relative border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.7)] group bg-black/80 backdrop-blur-2xl">
            {/* Corner Cyber Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/40 pointer-events-none z-20" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/40 pointer-events-none z-20" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/40 pointer-events-none z-20" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/40 pointer-events-none z-20" />

            {/* Banner Container with Lightbox Click Trigger */}
            <div
              onClick={() => setIsBannerZoomOpen(true)}
              className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] relative overflow-hidden cursor-zoom-in"
              title="Click to zoom banner"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={banners[activeBannerIdx]?.id || activeBannerIdx}
                  src={banners[activeBannerIdx]?.url}
                  alt={banners[activeBannerIdx]?.caption || "Syndicate Banner"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover object-center sm:object-top"
                  decoding="async"
                />
              </AnimatePresence>

              {/* Edge Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

              {/* Caption or Badge */}
              <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a44] animate-pulse" />
                  <span>SYNDICATE BANNER</span>
                </span>
                {banners[activeBannerIdx]?.caption && (
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/80 border border-white/10 hidden sm:inline-block">
                    {banners[activeBannerIdx].caption}
                  </span>
                )}
              </div>

              {/* Zoom Trigger Button Top Right */}
              <div className="absolute top-3 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/80 hover:text-white">
                  <Maximize2 size={14} />
                </div>
              </div>

              {/* Manual Nav Arrows (visible on hover) */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerChange((activeBannerIdx - 1 + banners.length) % banners.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 z-20"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerChange((activeBannerIdx + 1) % banners.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 z-20"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Carousel Controls Bottom Row */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15"
                  >
                    <button
                      type="button"
                      onClick={() => setIsBannerPlaying(prev => !prev)}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer mr-1"
                      title={isBannerPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                    >
                      {isBannerPlaying ? <Pause size={12} /> : <Play size={12} />}
                    </button>

                    {banners.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => handleBannerChange(dotIdx)}
                        className={`transition-all rounded-full cursor-pointer ${activeBannerIdx === dotIdx
                            ? 'w-6 h-1.5'
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                        style={activeBannerIdx === dotIdx ? { backgroundColor: primaryColor } : {}}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Smooth CSS Slide Progress Bar (0% CPU impact, resets on activeBannerIdx change) */}
            {banners.length > 1 && isBannerPlaying && (
              <div className="w-full h-1 bg-white/10 overflow-hidden relative">
                <div
                  key={activeBannerIdx}
                  className="h-full animate-banner-progress"
                  style={{
                    '--slide-duration': `${slideIntervalSec}s`,
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 8px ${primaryColor}`
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 
          ============================================================
          5. REVAMPED ANNOUNCEMENT TICKER & POPUP MODAL
          ============================================================
        */}
        {announcement && (
          <div className="mb-5 rounded-2xl bg-black/60 border border-white/15 p-2 sm:p-2.5 flex items-center gap-3 backdrop-blur-2xl shadow-xl overflow-hidden marquee-container group relative">
            {/* Announcement Badge with Glowing Signal */}
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wider shrink-0 uppercase font-mono cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}50`,
                color: primaryColor,
                boxShadow: `0 0 15px ${primaryColor}30`
              }}
              title="Click to view full announcement"
            >
              <Radio size={13} className="animate-pulse" />
              <span>{announcementTitle}</span>
            </button>

            {/* Continuous Dual-Track Seamless Marquee (Never delays or sinks!) */}
            <div
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="overflow-hidden flex-1 relative cursor-pointer select-none py-0.5"
              title="Click to read full announcement"
            >
              <div className="flex gap-12 w-max">
                {/* Track 1 */}
                <div className="animate-marquee-track flex items-center gap-8 font-medium text-xs sm:text-sm text-white/90">
                  <span>{announcement}</span>
                  <span className="text-white/30">•</span>
                  <span>{announcement}</span>
                  <span className="text-white/30">•</span>
                </div>
                {/* Track 2 (Seamless loop partner) */}
                <div className="animate-marquee-track flex items-center gap-8 font-medium text-xs sm:text-sm text-white/90" aria-hidden="true">
                  <span>{announcement}</span>
                  <span className="text-white/30">•</span>
                  <span>{announcement}</span>
                  <span className="text-white/30">•</span>
                </div>
              </div>
            </div>

            {/* Read Announcement Button */}
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <Bell size={12} />
              <span>{lang === 'th' ? 'อ่านฉบับเต็ม' : 'READ'}</span>
            </button>
          </div>
        )}

        {/* 
          ============================================================
          6. ADVANCED TOOLBAR (Instant Search, 3 View Modes, Sorting, Role Filters)
          ============================================================
        */}
        <div className="mb-6 space-y-3.5 bg-black/60 backdrop-blur-2xl border border-white/15 p-3.5 sm:p-4 rounded-3xl shadow-xl">
          {/* Top Controls: Search Input + Sorting + View Modes */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Box with Clear Button */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.roster?.searchPlaceholder || 'ค้นหาชื่อสมาชิก, Roblox, Discord...'}
                className="w-full bg-white/[0.05] border border-white/15 focus:border-[#ff2a44] rounded-2xl py-2.5 pl-11 pr-10 text-xs sm:text-sm text-white outline-none transition-colors placeholder:text-white/30 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Right Controls: Sort & View Mode Switcher */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <div className="text-[11px] font-mono text-white/50 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hidden md:inline-block">
                {lang === 'th' ? `พบ ${filteredMembers.length} นาย` : `${filteredMembers.length} Found`}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/15 rounded-2xl px-2.5 py-1.5 text-xs text-white/80">
                <ArrowUpDown size={13} className="text-[#ff2a44]" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                >
                  <option value="role" className="bg-[#121218] text-white">{lang === 'th' ? 'จัดเรียงตามยศ' : 'Sort by Rank'}</option>
                  <option value="name" className="bg-[#121218] text-white">{lang === 'th' ? 'ชื่อ (A-Z)' : 'Name (A-Z)'}</option>
                  <option value="views" className="bg-[#121218] text-white">{lang === 'th' ? 'ยอดนิยม 🔥' : 'Most Popular 🔥'}</option>
                </select>
              </div>

              {/* 3-Way View Switcher (Grid / Bento / List) */}
              <div className="flex items-center bg-white/[0.05] border border-white/15 rounded-2xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'grid'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/50 hover:text-white'
                    }`}
                  title={lang === 'th' ? 'มุมมองตารางมาตรฐาน' : 'Grid View'}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('bento')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'bento'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/50 hover:text-white'
                    }`}
                  title={lang === 'th' ? 'มุมมองการ์ดใหญ่ Bento' : 'Bento Showcase View'}
                >
                  <Columns size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'list'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/50 hover:text-white'
                    }`}
                  title={lang === 'th' ? 'มุมมองรายการกระชับ' : 'Compact List View'}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Role Filter Tabs (Horizontal Scroll on Mobile) */}
          <div className="flex gap-2 overflow-x-auto w-full pt-2 border-t border-white/10 scrollbar-none pb-0.5">
            <button
              onClick={() => setSelectedRoleId('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedRoleId === 'all'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 border ${isSelected
                      ? 'shadow-md font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5'
                    }`}
                  style={isSelected ? {
                    backgroundColor: roleColor,
                    color: contrastColor,
                    borderColor: `${contrastColor}50`,
                    boxShadow: `0 0 15px ${roleColor}50`
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
        </div>

        {/* 
          ============================================================
          7. ROLES & MEMBERS DISPLAY
          ============================================================
        */}
        {sortBy === 'role' ? (
          initialRoles.map(role => {
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

                {/* Members Container based on ViewMode */}
                {viewMode === 'list' ? (
                  <div className="flex flex-col gap-2">
                    {roleMembers.map(member => (
                      <MemberCard key={member.id} member={member} role={role} viewMode="list" />
                    ))}
                  </div>
                ) : viewMode === 'bento' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {roleMembers.map(member => (
                      <MemberCard key={member.id} member={member} role={role} viewMode="bento" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                    {roleMembers.map(member => (
                      <MemberCard key={member.id} member={member} role={role} viewMode="grid" />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="mb-10">
            {viewMode === 'list' ? (
              <div className="flex flex-col gap-2">
                {filteredMembers.map(member => {
                  const role = initialRoles.find(r => r.id === member.roleId) || { name: 'Member', color: primaryColor };
                  return <MemberCard key={member.id} member={member} role={role} viewMode="list" />;
                })}
              </div>
            ) : viewMode === 'bento' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredMembers.map(member => {
                  const role = initialRoles.find(r => r.id === member.roleId) || { name: 'Member', color: primaryColor };
                  return <MemberCard key={member.id} member={member} role={role} viewMode="bento" />;
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                {filteredMembers.map(member => {
                  const role = initialRoles.find(r => r.id === member.roleId) || { name: 'Member', color: primaryColor };
                  return <MemberCard key={member.id} member={member} role={role} viewMode="grid" />;
                })}
              </div>
            )}
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <Users size={40} className="mx-auto text-white/20 mb-2.5" />
            <p className="text-white/40 text-xs sm:text-sm font-medium">
              {t.roster?.noMembers || 'ไม่พบรายชื่อสมาชิกที่ตรงกับคำค้นหา'}
            </p>
          </div>
        )}

        {/* 
          ============================================================
          8. SYNDICATE ALLIANCE & PARTNERS SHOWCASE
          ============================================================
        */}
        <PartnerShowcase
          partners={settings?.partners || []}
          primaryColor={primaryColor}
          lang={lang}
        />

        {/* 
          ============================================================
          9. FOOTER CREDIT
          ============================================================
        */}
        <div className="mt-14 flex flex-col items-center justify-center pb-8 border-t border-white/10 pt-6">
          <a
            href="https://www.instagram.com/gkbyontop/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[#ff2a44]/50 backdrop-blur-md text-[11px] font-mono tracking-widest text-white/60 hover:text-white transition-all shadow-md group cursor-pointer"
            title="Developer Instagram: @gkbyontop"
          >
            <Skull size={13} className="text-[#ff2a44] group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-white/80 group-hover:text-white transition-colors">DEV UFA SLUMZICK</span>
          </a>
          <span className="text-[10px] font-mono text-white/30 tracking-wider mt-2">
            SLUMZICK SYNDICATE • ALL RIGHTS RESERVED
          </span>
        </div>

      </div>

      {/* 
        ============================================================
        MODAL 1: FULL ANNOUNCEMENT POPUP
        ============================================================
      */}
      <AnimatePresence>
        {isAnnouncementModalOpen && announcement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-[#0c0c14] border border-white/20 shadow-2xl p-6 relative overflow-hidden"
              style={{ boxShadow: `0 20px 50px rgba(0,0,0,0.9), 0 0 30px ${primaryColor}20` }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      borderColor: `${primaryColor}50`,
                      color: primaryColor
                    }}
                  >
                    <Radio size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-white/50 uppercase block">
                      OFFICIAL BULLETIN
                    </span>
                    <h3 className="text-base sm:text-lg font-heading font-extrabold text-white">
                      {announcementTitle}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-1 text-sm sm:text-base text-white/85 leading-relaxed whitespace-pre-wrap font-sans mb-6">
                {announcement}
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCopyAnnouncement}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wider transition-all cursor-pointer"
                >
                  {copiedAnnouncement ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedAnnouncement ? (lang === 'th' ? 'คัดลอกแล้ว' : 'COPIED') : (lang === 'th' ? 'คัดลอกข้อความ' : 'COPY TEXT')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-5 py-2 rounded-2xl text-white font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  {lang === 'th' ? 'รับทราบ' : 'ACKNOWLEDGE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ============================================================
        MODAL 2: BANNER LIGHTBOX / ZOOM PREVIEW
        ============================================================
      */}
      <AnimatePresence>
        {isBannerZoomOpen && banners[activeBannerIdx] && (
          <div
            onClick={() => setIsBannerZoomOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative bg-black"
            >
              <img
                src={banners[activeBannerIdx].url}
                alt="Banner Zoom"
                className="w-full max-h-[85vh] object-contain"
              />
              <button
                type="button"
                onClick={() => setIsBannerZoomOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 cursor-pointer shadow-lg"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
