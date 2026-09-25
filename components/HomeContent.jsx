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
  Zap,
  Globe,
  Radio,
  Skull,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BRAND_SVGS } from '@/components/BrandIcons';

export default function HomeContent({ settings, membersCount = 1 }) {
  const { t, lang, toggleLang } = useLanguage();

  const primaryColor = settings?.primaryColor || '#ff2a44';
  const contrastColor = settings?.contrastColor || '#ffffff';
  const siteName = settings?.siteName || 'Sluzmzick';
  const logoUrl = settings?.logoUrl;
  const description = lang === 'th' 
    ? (t.home?.desc || 'ศูนย์รวมสมาชิกสายเลือดแท้ ความเป็นเอกภาพ และพลังที่ไม่มีใครเทียบได้')
    : (settings?.description || t.home?.desc || 'The ultimate syndicate of blood brothers, absolute unity, and unrivaled supremacy.');

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[90vh] pt-1 sm:pt-2 pb-6 px-3 sm:px-6 relative z-10 font-sans">
      
      {/* Top Navbar / Syndicate Status Bar (Requested: Shifted higher up) */}
      <motion.div 
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl flex items-center justify-between gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-black/55 backdrop-blur-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] mt-0.5 sm:mt-1"
      >
        {/* Left: Operational Status with GANG + Gang Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: primaryColor }} />
          </span>
          <span className="text-[11px] sm:text-xs font-bold tracking-wider text-white/95 uppercase font-sans truncate">
            {lang === 'th' ? `แก๊ง ${siteName.toUpperCase()} • พร้อมปฏิบัติการ 24/7` : `GANG ${siteName.toUpperCase()} • ACTIVE 24/7`}
          </span>
        </div>

        {/* Right: Integrated Language Switcher (No collision on mobile) */}
        <motion.button
          type="button"
          onClick={toggleLang}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold tracking-wider transition-all cursor-pointer shrink-0"
          title="Switch Language / เปลี่ยนภาษา"
        >
          <Globe size={13} className="text-[#ff2a44]" />
          <span className={lang === 'th' ? 'text-white' : 'text-white/40'}>TH</span>
          <span className="text-white/20 text-[10px]">/</span>
          <span className={lang === 'en' ? 'text-white' : 'text-white/40'}>EN</span>
        </motion.button>
      </motion.div>

      {/* Hero Centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-4 sm:my-6 max-w-3xl w-full">
        
        {/* CIRCULAR CYBER LOGO FRAME WITH TILTED CROWN (Requested: "กรอบโปรไฟล์อยากให้เพิ่มมงกุฏเฉียงๆหน่อยจะได้เท่") */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative mb-5 group cursor-pointer"
        >
          {/* Tilted King Crown perched on the upper rim of the circular profile */}
          <motion.div
            initial={{ y: -12, rotate: 18, scale: 0 }}
            animate={{ 
              y: [0, -4, 0],
              rotate: [15, 19, 15],
              scale: 1 
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
              scale: { duration: 0.6, type: "spring", bounce: 0.4 }
            }}
            className="absolute -top-4 -right-1.5 sm:-top-5 sm:-right-2 z-20 pointer-events-none drop-shadow-[0_0_16px_rgba(251,191,36,0.95)]"
          >
            <div className="relative">
              <Crown 
                size={34} 
                className="text-amber-400 fill-amber-400/90 stroke-amber-200 stroke-[1.5] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]" 
              />
              {/* Sparkle glint on crown tip */}
              <Sparkles size={13} className="absolute -top-1 -left-1 text-white animate-pulse" />
            </div>
          </motion.div>

          {/* Outer rotating neon dash ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 sm:-inset-5 rounded-full border-2 border-dashed opacity-40 pointer-events-none"
            style={{ borderColor: primaryColor }}
          />

          {/* Inner counter-rotating thin cyber ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full pointer-events-none"
            style={{ border: `1.5px dashed ${contrastColor}40` }}
          />

          {/* Glowing Aura Blob with Contrast Cut */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"
            style={{ 
              background: `radial-gradient(circle, ${primaryColor} 40%, ${contrastColor} 100%)` 
            }}
          />

          {/* Circular Core Container */}
          <div 
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-black/90 via-[#15070c] to-black border-2 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl group-hover:scale-105 transition-transform duration-300 overflow-hidden p-3"
            style={{ 
              boxShadow: `0 0 35px ${primaryColor}50, inset 0 0 15px ${contrastColor}30`,
              borderColor: `${contrastColor}60`
            }}
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                className="w-full h-full object-contain rounded-full drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
              />
            ) : (
              <>
                <Crown size={40} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover:rotate-6 transition-transform duration-300" style={{ color: primaryColor }} />
                <Sparkles size={16} className="absolute top-3 right-3 text-amber-300 animate-pulse" />
              </>
            )}
          </div>
        </motion.div>

        {/* Dynamic Gang Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md mb-3 border"
          style={{ borderColor: `${contrastColor}40` }}
        >
          <Flame size={14} className="animate-bounce" style={{ color: primaryColor }} />
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-sans" style={{ color: contrastColor }}>
            {siteName.toUpperCase()} SYNDICATE • ELITE TIER S
          </span>
        </motion.div>

        {/* Main Title - Contrast color cutting into primary color */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mb-3"
        >
          <h1 
            className="font-extrabold tracking-tight sm:tracking-wide text-transparent bg-clip-text select-none"
            style={{ 
              fontSize: 'clamp(2.4rem, 8vw, 4.8rem)',
              lineHeight: 1.1,
              backgroundImage: `linear-gradient(180deg, ${contrastColor} 0%, #ffffff 45%, ${primaryColor} 100%)`,
              filter: `drop-shadow(0 0 35px ${primaryColor}60)`
            }}
          >
            {siteName}
          </h1>
        </motion.div>

        {/* Customizable Gang Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/80 text-xs sm:text-sm md:text-base font-light max-w-xl leading-relaxed mb-7 px-4"
        >
          {description}
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center px-4 max-w-lg mx-auto"
        >
          {/* Button 1: สมัครเข้าแก๊ง (Apply to Gang / Login with Discord -> /dashboard) */}
          <Link href="/dashboard" prefetch={true} className="w-full sm:w-1/2">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer overflow-hidden rounded-2xl p-[1.5px] w-full"
            >
              {/* Rotating Gradient Aura */}
              <div 
                className="absolute inset-0 rounded-2xl animate-spin-slow opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ 
                  background: `conic-gradient(from 0deg, transparent, ${primaryColor}, ${contrastColor}, ${primaryColor}, transparent)` 
                }}
              />

              {/* Core Button Body */}
              <div 
                className="relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-black via-[#160a0f] to-black backdrop-blur-xl border border-white/20 transition-all shadow-[0_8px_25px_rgba(0,0,0,0.8)] h-14"
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UserPlus size={16} className="text-white shrink-0" />
                </div>
                <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase font-sans truncate">
                  {lang === 'th' ? 'สมัครเข้าแก๊ง' : 'APPLY FOR GANG'}
                </span>
                <ChevronRight size={16} className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0 ml-auto" />
              </div>
            </motion.div>
          </Link>

          {/* Button 2: ดูรายชื่อคนในแก๊ง (View Roster & Members -> /members) */}
          <Link href="/members" prefetch={true} className="w-full sm:w-1/2">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl text-xs sm:text-sm font-bold tracking-wider transition-all w-full shadow-lg cursor-pointer border h-14"
              style={{
                borderColor: `${contrastColor}35`,
                color: contrastColor
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Users size={16} style={{ color: primaryColor }} className="shrink-0" />
              </div>
              <span className="truncate">{lang === 'th' ? 'ดูรายชื่อคนในแก๊ง' : 'VIEW ROSTER'}</span>
              <ChevronRight size={16} className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0 ml-auto" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Small Discord Button Below the Two Main Buttons */}
        {settings?.discordInviteUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-3.5 flex justify-center w-full"
          >
            <a
              href={settings.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#5865F2]/20 hover:bg-[#5865F2]/35 border border-[#5865F2]/40 hover:border-[#5865F2] text-white transition-all shadow-[0_0_15px_rgba(88,101,242,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
              title="Discord"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#5865F2] shrink-0">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="font-mono font-bold text-xs text-white tracking-wider">Discord</span>
            </a>
          </motion.div>
        )}
      </div>

      {/* Bottom Syndicate Stats (Box 1: Real members count, Box 2: TOXIC 100%) */}
      {/* Unified Syndicate HUD Telemetry Console (Redesigned from 4 boxy cards into a cohesive cyber cockpit) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-4xl rounded-2xl sm:rounded-full bg-gradient-to-r from-black/85 via-[#14060c]/90 to-black/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(255,42,68,0.1)] p-2 sm:p-2.5 mt-5 sm:mt-6"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0">
          
          {/* Telemetry 1: ACTIVE OPERATIVES */}
          <div className="flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-2.5 sm:border-r border-white/10 group/item hover:bg-white/[0.03] rounded-xl sm:rounded-none transition-colors">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Users size={15} className="text-[#ff2a44]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight">{membersCount}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-sans truncate">
                {lang === 'th' ? 'กำลังพลปฏิบัติการ' : 'ACTIVE OPERATIVES'}
              </span>
            </div>
          </div>

          {/* Telemetry 2: TOXIC LEVEL 100% */}
          <div className="flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-2.5 sm:border-r border-white/10 group/item hover:bg-white/[0.03] rounded-xl sm:rounded-none transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Flame size={15} className="text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono tracking-tight">100%</span>
                <span className="text-[10px] text-amber-300 font-bold uppercase">MAX</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-sans truncate">
                {lang === 'th' ? 'ความดุเดือด (TOXIC)' : 'TOXIC LEVEL'}
              </span>
            </div>
          </div>

          {/* Telemetry 3: GLOBAL TIER S */}
          <div className="flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-2.5 sm:border-r border-white/10 group/item hover:bg-white/[0.03] rounded-xl sm:rounded-none transition-colors">
            <div className="w-8 h-8 rounded-xl bg-[#ff2a44]/10 border border-[#ff2a44]/25 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Shield size={15} className="text-[#ff2a44]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight">TIER S</span>
              <span className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-sans truncate">
                {lang === 'th' ? 'ลำดับชั้นองค์กร' : 'SYNDICATE TIER'}
              </span>
            </div>
          </div>

          {/* Telemetry 4: GLOBAL RANKING #1 */}
          <div className="flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-2.5 group/item hover:bg-white/[0.03] rounded-xl sm:rounded-none transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Crown size={15} className="text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono tracking-tight">ELITE #1</span>
              <span className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-sans truncate">
                {lang === 'th' ? 'เกียรติยศสูงสุด' : 'REPUTATION'}
              </span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Footer Credit (DEV UFA SLUMZICK -> Instagram: @gkbyontop) */}
      <motion.a 
        href="https://www.instagram.com/gkbyontop/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 sm:mt-5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 hover:border-[#ff2a44]/50 backdrop-blur-md text-[11px] font-mono tracking-widest text-white/60 hover:text-white transition-all shadow-md group cursor-pointer"
        title="Developer Instagram: @gkbyontop"
      >
        <Skull size={13} className="text-[#ff2a44] group-hover:rotate-12 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-white/80 group-hover:text-white transition-colors">DEV UFA SLUMZICK</span>
      </motion.a>

    </div>
  );
}
