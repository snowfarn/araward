'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  Fingerprint, 
  Home, 
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Auto-check active session or detect expired redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('expired')) {
        setSessionExpiredNotice(true);
      }
      
      const isAuth = localStorage.getItem('adminAuth') === 'true';
      const expiresAt = parseInt(localStorage.getItem('adminAuthExpiry') || '0', 10);
      const now = Date.now();

      if (isAuth && expiresAt && now < expiresAt) {
        router.push('/secret-admin/dashboard');
      } else {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuthExpiry');
      }
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setIsError(false);

    // Simulate cyber authentication sequence
    setTimeout(() => {
      if (password === 'admin123') {
        const oneHourFromNow = Date.now() + 60 * 60 * 1000; // 1-hour session lifetime (3600 seconds)
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminAuthExpiry', oneHourFromNow.toString());
        router.push('/secret-admin/dashboard');
      } else {
        setIsError(true);
        setIsLoading(false);
        setPassword('');
      }
    }, 900);
  };

  return (
    <main className="min-h-screen bg-[#030306] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Particle Canvas with Shards, Stars, Embers & Constellations */}
      <ParticleBackground type="embers" color="#ff2a44" />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[650px] max-h-[650px] bg-[#ff2a44]/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Left Return to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-5 left-5 z-20"
      >
        <Link 
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 hover:border-white/30 backdrop-blur-2xl text-white text-xs font-semibold tracking-wider transition-all duration-300 shadow-xl group"
        >
          <Home size={14} className="text-[#ff2a44] group-hover:-translate-x-0.5 transition-transform" />
          <span>{t.adminLogin.backHome}</span>
        </Link>
      </motion.div>

      {/* Central Login Card */}
      <motion.form 
        initial={{ opacity: 0, y: 35, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleLogin} 
        className="relative z-10 bg-black/55 backdrop-blur-3xl border border-white/10 hover:border-white/20 p-8 sm:p-12 rounded-[2.5rem] w-full max-w-[430px] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,42,68,0.15)] flex flex-col items-center overflow-hidden transition-colors duration-500"
      >
        {/* Top Glowing Laser Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#ff2a44] to-transparent shadow-[0_0_15px_#ff2a44]" />

        {/* Floating Security Badge */}
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.45 }}
          className="relative mb-6 group cursor-pointer"
        >
          <div className="absolute inset-0 bg-[#ff2a44] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-3xl" />
          
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-[#ff2a44]/20 via-black to-black border border-[#ff2a44]/40 flex items-center justify-center shadow-[0_0_35px_rgba(255,42,68,0.25)] group-hover:scale-105 transition-transform duration-300">
            <ShieldAlert size={36} className="text-[#ff2a44] drop-shadow-[0_0_10px_rgba(255,42,68,0.8)]" />
          </div>
        </motion.div>

        {/* Header Texts */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2a44]/10 border border-[#ff2a44]/30 text-[#ff2a44] text-[10px] font-bold tracking-widest uppercase mb-2">
            <KeyRound size={11} /> {t.adminLogin.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">
            {t.adminLogin.systemAccess}
          </h1>
          <p className="text-white/50 text-xs sm:text-sm font-light tracking-wide flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-[#ff2a44]" /> {t.adminLogin.restrictedArea}
          </p>
        </div>

        {/* 1-Hour Session Expired Alert */}
        {sessionExpiredNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 w-full px-3.5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs flex items-center justify-center gap-2 text-center"
          >
            <Clock size={14} className="shrink-0" />
            <span>{lang === 'th' ? 'เซสชั่นหมดอายุแล้ว (จำกัด 1 ชม.) กรุณาเข้าสู่ระบบใหม่' : 'Session expired (1h limit). Please log in again.'}</span>
          </motion.div>
        )}

        {/* Input Box */}
        <div className="w-full relative mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Fingerprint className={`w-5 h-5 transition-colors duration-300 ${isError ? 'text-red-500 animate-pulse' : 'text-white/30'}`} />
            </div>

            <input 
              type="password" 
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setIsError(false);
              }}
              placeholder={t.adminLogin.accessCode}
              disabled={isLoading}
              className={`w-full bg-white/[0.03] border rounded-2xl py-4 pl-12 pr-5 text-white text-base focus:outline-none focus:bg-white/[0.06] transition-all duration-300 placeholder:text-white/30 ${
                isError 
                  ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.3)] bg-red-950/10' 
                  : 'border-white/15 focus:border-[#ff2a44]/80 hover:border-white/25 focus:shadow-[0_0_20px_rgba(255,42,68,0.25)]'
              }`}
            />
          </div>

          {/* Error Message with Shake animation */}
          <AnimatePresence>
            {isError && (
              <motion.div 
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 mt-2.5 text-red-400 text-xs font-medium"
              >
                <AlertTriangle size={13} />
                <span>{t.adminLogin.accessDenied}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <motion.button 
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="submit" 
          disabled={isLoading || !password}
          className="w-full relative group overflow-hidden rounded-2xl py-4 bg-gradient-to-r from-[#ff2a44] via-[#ff3b53] to-[#ff2a44] text-white font-bold text-sm sm:text-base tracking-wider uppercase shadow-[0_10px_30px_rgba(255,42,68,0.45)] hover:shadow-[0_15px_40px_rgba(255,42,68,0.65)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer"
        >
          {/* Light sweep animation */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
          
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.adminLogin.authenticating}
              </>
            ) : (
              <>
                {t.adminLogin.initialize}
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </motion.button>

        {/* Security Notice */}
        <div className="mt-8 flex items-center gap-1.5 text-[11px] text-white/35 font-light tracking-wider">
          <CheckCircle2 size={12} className="text-[#ff2a44]" />
          <span>{t.adminLogin.securityNotice}</span>
        </div>
      </motion.form>
    </main>
  );
}
