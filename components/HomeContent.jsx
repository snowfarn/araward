'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  Sparkles, 
  Shield, 
  Flame, 
  ChevronRight, 
  Crown, 
  Globe, 
  Skull, 
  UserPlus
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeContent({ settings, membersCount = 1 }) {
  const { t, lang, toggleLang } = useLanguage();

  const primaryColor = settings?.primaryColor || '#ff2a44';
  const siteName = settings?.siteName || 'Slumzick';
  const logoUrl = settings?.logoUrl;
  const rawDesc = settings?.description?.trim();
  const description = rawDesc !== undefined && rawDesc !== '' 
    ? rawDesc 
    : (lang === 'th' 
        ? (t.home?.desc || 'ศูนย์รวมสมาชิกสายเลือดแท้ ความเป็นเอกภาพ และพลังที่ไม่มีใครเทียบได้')
        : (t.home?.desc || 'The ultimate syndicate of blood brothers, absolute unity, and unrivaled supremacy.'));

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[92vh] pt-2 sm:pt-4 pb-6 px-3 sm:px-6 relative z-10 font-sans">
      
      {/* 
        ============================================================
        TOP COMMAND BAR (Includes Gang Status, Official Discord & Lang)
        ============================================================
      */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl flex items-center justify-between gap-2.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-black/65 backdrop-blur-2xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
      >
        {/* Left: Syndicate Identifier & Live Status */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: primaryColor }} />
          </span>
          <span className="text-xs sm:text-sm font-heading font-extrabold tracking-wider text-white uppercase truncate">
            {siteName}
          </span>
          <span className="hidden md:inline-block text-[11px] font-medium text-white/40 tracking-wider">
            • {lang === 'th' ? 'พร้อมปฏิบัติการ 24/7' : 'OPERATIONAL 24/7'}
          </span>
        </div>

        {/* Right: Official Discord Button & Language Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Official Syndicate Discord Button (Never small or out of place!) */}
          {settings?.discordInviteUrl && (
            <a
              href={settings.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#5865F2]/20 hover:bg-[#5865F2] border border-[#5865F2]/40 hover:border-[#5865F2] text-white text-[11px] sm:text-xs font-heading font-bold tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:scale-105 active:scale-95"
              title="Official Syndicate Discord"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>DISCORD</span>
            </a>
          )}

          {/* Language Switcher */}
          <motion.button
            type="button"
            onClick={toggleLang}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold tracking-wider transition-all cursor-pointer"
            title="Switch Language / เปลี่ยนภาษา"
          >
            <Globe size={13} className="text-[#ff2a44]" />
            <span className={lang === 'th' ? 'text-white font-bold' : 'text-white/40'}>TH</span>
            <span className="text-white/20 text-[10px]">/</span>
            <span className={lang === 'en' ? 'text-white font-bold' : 'text-white/40'}>EN</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 
        ============================================================
        HERO CENTERPIECE (Dominant Crest, Majestic Crown, Clear Aura)
        ============================================================
      */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6 sm:my-8 max-w-3xl w-full">
        
        {/* PROMINENT SYNDICATE CREST & MAJESTIC GOLD CROWN */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 group cursor-pointer"
        >
          {/* Rich Ambient Crimson/Gold Glow Halo behind Crest */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl opacity-70 group-hover:opacity-95 transition-opacity duration-500 scale-135 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, ${primaryColor} 10%, #fbbf24 45%, transparent 75%)` 
            }}
          />

          {/* 
            PROMINENT ROYAL GOLD CROWN 
            (Requested: "ปรับกรอบและมงกุฏดีๆเด่นหน่อย" -> Large, Detailed, Regal 3D Gold Crown)
          */}
          <motion.div
            initial={{ y: -10, rotate: 20 }}
            animate={{ 
              y: [0, -4, 0],
              rotate: [18, 22, 18],
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 3.2, ease: "easeInOut" },
            }}
            className="absolute -top-6 -right-3 sm:-top-8 sm:-right-4 z-30 pointer-events-none"
          >
            <div className="relative">
              {/* Grand Crown Icon with Radiant Gold Aura */}
              <Crown 
                size={52} 
                className="text-amber-400 fill-gradient fill-amber-400 stroke-amber-100 stroke-[1.8] filter drop-shadow-[0_6px_18px_rgba(0,0,0,0.95)] drop-shadow-[0_0_25px_rgba(251,191,36,0.95)]" 
              />
              
              {/* Royal Ruby Gemstones on the 3 Crown Peaks */}
              <span className="absolute top-[3px] left-[7px] w-2 h-2 rounded-full bg-[#ff2a44] shadow-[0_0_8px_#ff2a44] ring-1 ring-amber-200" />
              <span className="absolute -top-[1px] left-[23px] w-2.5 h-2.5 rounded-full bg-[#ff2a44] shadow-[0_0_10px_#ff2a44] ring-1 ring-amber-200" />
              <span className="absolute top-[3px] right-[7px] w-2 h-2 rounded-full bg-[#ff2a44] shadow-[0_0_8px_#ff2a44] ring-1 ring-amber-200" />

              {/* Sparkling Diamond Glint */}
              <Sparkles size={16} className="absolute -top-2 right-0 text-white animate-pulse" />
            </div>
          </motion.div>

          {/* 
            HIGH-END SYNDICATE CREST FRAME (Large, Layered, Beveled, Prestigious)
          */}
          <div 
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#18050c] via-black to-[#100307] border-2 flex items-center justify-center backdrop-blur-2xl group-hover:scale-105 transition-transform duration-300 p-3 sm:p-4"
            style={{ 
              borderColor: primaryColor,
              boxShadow: `0 0 45px ${primaryColor}55, inset 0 0 30px ${primaryColor}30, 0 15px 40px rgba(0,0,0,0.9)`
            }}
          >
            {/* Inner Metallic Bezel Ring */}
            <div className="absolute inset-1.5 rounded-full border border-amber-400/40 pointer-events-none" />

            {/* Gang Logo or Crown Emblem */}
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                className="w-full h-full object-contain rounded-full drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
              />
            ) : (
              <Crown size={54} style={{ color: primaryColor }} className="drop-shadow-[0_0_20px_rgba(255,42,68,0.8)]" />
            )}
          </div>
        </motion.div>

        {/* Minimalist Syndicate Prestige Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] backdrop-blur-md mb-3 border border-white/10"
        >
          <Flame size={13} style={{ color: primaryColor }} className="animate-pulse" />
          <span className="text-[11px] sm:text-xs font-heading font-semibold tracking-widest uppercase text-white/90">
            {lang === 'th' ? `องค์กรระดับสูงสุด • TIER S` : `SUPREME SYNDICATE • TIER S`}
          </span>
        </motion.div>

        {/* Commanding Syndicate Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative mb-3"
        >
          <h1 
            className="font-heading font-extrabold tracking-tight sm:tracking-normal text-transparent bg-clip-text select-none uppercase"
            style={{ 
              fontSize: 'clamp(2.6rem, 8.5vw, 5.2rem)',
              lineHeight: 1.08,
              backgroundImage: `linear-gradient(180deg, #ffffff 0%, #e2e8f0 55%, #94a3b8 100%)`,
              filter: `drop-shadow(0 0 35px ${primaryColor}55)`
            }}
          >
            {siteName}
          </h1>
        </motion.div>

        {/* Clean, Elegant Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-white/75 text-sm sm:text-base font-normal max-w-lg leading-relaxed mb-8 px-4"
        >
          {description}
        </motion.p>

        {/* 
          ============================================================
          EQUAL CENTER BUTTONS (100% Symmetrical, Identical Dimensions)
          (Requested: "ปุ่มตรงกลางมันไม่เท่ากันปรับด้วย")
          ============================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="w-full max-w-lg mx-auto px-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            
            {/* Button 1: สมัครเข้าแก๊ง (Exact same height, padding, font, structure) */}
            <Link href="/dashboard" prefetch={true} className="w-full">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 sm:h-15 rounded-2xl bg-gradient-to-r from-[#ff2a44] via-[#ff3b53] to-[#e61e38] text-white flex items-center justify-between px-5 font-heading font-bold text-sm tracking-wider uppercase shadow-[0_8px_25px_rgba(255,42,68,0.45)] hover:shadow-[0_12px_35px_rgba(255,42,68,0.7)] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                  <UserPlus size={18} className="text-white" />
                </div>
                <span className="flex-1 text-center font-heading font-bold tracking-wider">
                  {lang === 'th' ? 'สมัครเข้าแก๊ง' : 'JOIN SYNDICATE'}
                </span>
                <ChevronRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0" />
              </motion.div>
            </Link>

            {/* Button 2: ทำเนียบสมาชิก (Exact same height, padding, font, structure) */}
            <Link href="/members" prefetch={true} className="w-full">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 sm:h-15 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 hover:border-white/40 text-white flex items-center justify-between px-5 font-heading font-bold text-sm tracking-wider uppercase backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-[#ff2a44]" />
                </div>
                <span className="flex-1 text-center font-heading font-bold tracking-wider">
                  {lang === 'th' ? 'ทำเนียบสมาชิก' : 'VIEW ROSTER'}
                </span>
                <ChevronRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0" />
              </motion.div>
            </Link>

          </div>
        </motion.div>

      </div>

      {/* 
        ============================================================
        STREAMLINED SYNDICATE TELEMETRY DOCK (Minimalist, High-Tech)
        ============================================================
      */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-3xl rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] px-3 py-2 sm:py-2.5 mt-4"
      >
        <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
          
          {/* Stat 1: Total Operatives */}
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-heading font-extrabold text-white tracking-tight">
                {membersCount}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-white/50 tracking-wider uppercase mt-0.5">
              {lang === 'th' ? 'กำลังพลปฏิบัติการ' : 'OPERATIVES'}
            </span>
          </div>

          {/* Stat 2: Operational Readiness */}
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-heading font-extrabold text-white tracking-tight">
                24/7
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a44] animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-white/50 tracking-wider uppercase mt-0.5">
              {lang === 'th' ? 'สถานะพร้อมรบ' : 'READINESS'}
            </span>
          </div>

          {/* Stat 3: Rank & Reputation */}
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-lg font-heading font-extrabold text-amber-300 tracking-tight">
                TIER S
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-white/50 tracking-wider uppercase mt-0.5">
              {lang === 'th' ? 'ระดับเกียรติยศ' : 'SYNDICATE TIER'}
            </span>
          </div>

        </div>
      </motion.div>

      {/* 
        ============================================================
        FOOTER SIGNATURE (Clean & Sophisticated)
        ============================================================
      */}
      <motion.a 
        href="https://www.instagram.com/gkbyontop/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-[#ff2a44]/50 backdrop-blur-md text-[11px] font-heading tracking-widest text-white/50 hover:text-white transition-all shadow-sm group cursor-pointer"
        title="Developer Instagram: @gkbyontop"
      >
        <Skull size={12} className="text-[#ff2a44] group-hover:rotate-12 transition-transform" />
        <span className="font-semibold text-white/70 group-hover:text-white transition-colors">DEV UFA SLUMZICK</span>
      </motion.a>

    </div>
  );
}
