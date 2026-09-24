'use client';

import { motion } from 'framer-motion';
import { Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher({ className = '', variant = 'floating' }) {
  const { lang, toggleLang } = useLanguage();

  if (variant === 'inline') {
    return (
      <motion.button
        type="button"
        onClick={toggleLang}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-xl text-white text-xs font-semibold tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${className}`}
      >
        <Globe size={14} className="text-[#ff2a44] animate-spin-slow" />
        <span className="flex items-center gap-1.5">
          <span className={lang === 'th' ? 'text-white font-bold' : 'text-white/40'}>TH</span>
          <span className="text-white/30 text-[10px]">/</span>
          <span className={lang === 'en' ? 'text-white font-bold' : 'text-white/40'}>EN</span>
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggleLang}
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.08, y: -2, boxShadow: '0 10px 30px rgba(255, 42, 68, 0.35)' }}
      whileTap={{ scale: 0.92 }}
      className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-[#ff2a44]/60 backdrop-blur-2xl text-white shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(255,42,68,0.2)] transition-all duration-300 group cursor-pointer ${className}`}
      title="Switch Language / เปลี่ยนภาษา"
    >
      <div className="relative">
        <Globe size={16} className="text-[#ff2a44] group-hover:rotate-45 transition-transform duration-500" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff2a44] animate-ping" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff2a44]" />
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider">
        <span className={`px-1.5 py-0.5 rounded-full transition-all ${lang === 'th' ? 'bg-[#ff2a44] text-white shadow-[0_0_10px_#ff2a44]' : 'text-white/45'}`}>
          TH
        </span>
        <span className="text-white/30 text-[10px]">•</span>
        <span className={`px-1.5 py-0.5 rounded-full transition-all ${lang === 'en' ? 'bg-[#ff2a44] text-white shadow-[0_0_10px_#ff2a44]' : 'text-white/45'}`}>
          EN
        </span>
      </div>

      <Sparkles size={12} className="text-amber-400/80 group-hover:rotate-180 transition-transform duration-700" />
    </motion.button>
  );
}
