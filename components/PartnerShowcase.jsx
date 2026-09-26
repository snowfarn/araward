'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  Handshake, 
  X,
  Radio,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function PartnerShowcase({ 
  partners = [], 
  primaryColor = '#ff2a44',
  lang = 'th' 
}) {
  const [partnerList, setPartnerList] = useState(partners);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    setPartnerList(partners);
  }, [partners]);

  // Automatic 30-minute background sync for memberCount & presenceCount
  useEffect(() => {
    const syncPartners = async () => {
      try {
        const res = await fetch('/api/discord/partners');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.partners) && data.partners.length > 0) {
            setPartnerList(data.partners);
            setSelectedPartner(prev => {
              if (!prev) return null;
              return data.partners.find(p => p.id === prev.id) || prev;
            });
          }
        }
      } catch (err) {
        // Silent fallback to current state
      }
    };

    const interval = setInterval(syncPartners, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  if (!partnerList || !Array.isArray(partnerList) || partnerList.length === 0) {
    return null;
  }

  const formatCount = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return Number(num).toLocaleString();
  };

  return (
    <div className="w-full mt-10 mb-8 font-sans">
      {/* Section Divider & Header */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-md shrink-0"
            style={{ 
              backgroundColor: `${primaryColor}15`, 
              borderColor: `${primaryColor}40`,
              boxShadow: `0 0 15px ${primaryColor}25`
            }}
          >
            <Handshake size={16} style={{ color: primaryColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-heading font-extrabold text-white tracking-wide uppercase">
                {lang === 'th' ? 'พันธมิตร & ภาคีร่วมรบ' : 'SYNDICATE ALLIANCE'}
              </h2>
              <span 
                className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border"
                style={{ 
                  backgroundColor: `${primaryColor}20`, 
                  borderColor: `${primaryColor}50`,
                  color: primaryColor 
                }}
              >
                {partnerList.length}
              </span>
            </div>
            <p className="text-white/40 text-[11px] font-light tracking-wide hidden sm:block">
              {lang === 'th' ? 'คลิกที่กิลด์พันธมิตรเพื่อดูข้อมูลและช่องทางเข้าร่วม' : 'Click on any partner guild to view details and join'}
            </p>
          </div>
        </div>
      </div>

      {/* 
        ============================================================
        COMPACT AUTO-SCROLLING MARQUEE TRACK (Never "Fat" on Mobile!)
        ============================================================
      */}
      <div className="relative overflow-hidden py-2 marquee-container group">
        {/* Left & Right Edge Fade Vignette */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#040407] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#040407] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-3 w-max">
          {/* Track 1 */}
          <div className="animate-marquee-track flex items-center gap-3">
            {partnerList.map((partner, idx) => (
              <div
                key={`p1-${partner.id || idx}`}
                onClick={() => setSelectedPartner(partner)}
                className="w-48 sm:w-56 h-13 sm:h-14 rounded-2xl bg-black/70 hover:bg-black/90 border border-white/10 hover:border-[#5865F2]/60 p-2 flex items-center gap-2.5 cursor-pointer backdrop-blur-xl shadow-md hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all shrink-0 select-none group/card"
              >
                {/* Mini Server Icon */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0">
                  {partner.icon ? (
                    <img src={partner.icon} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs">
                      {partner.name?.slice(0, 2).toUpperCase() || 'DC'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#23a55a] border border-black" />
                </div>

                {/* Name & Quick Stats */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover/card:text-[#5865F2] transition-colors">
                    {partner.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{formatCount(partner.presenceCount)} onl</span>
                    <span>•</span>
                    <span>{formatCount(partner.memberCount)} mbrs</span>
                  </div>
                </div>

                <ChevronRight size={13} className="text-white/30 group-hover/card:text-white transition-colors shrink-0" />
              </div>
            ))}
          </div>

          {/* Track 2 (Seamless loop partner) */}
          <div className="animate-marquee-track flex items-center gap-3" aria-hidden="true">
            {partnerList.map((partner, idx) => (
              <div
                key={`p2-${partner.id || idx}`}
                onClick={() => setSelectedPartner(partner)}
                className="w-48 sm:w-56 h-13 sm:h-14 rounded-2xl bg-black/70 hover:bg-black/90 border border-white/10 hover:border-[#5865F2]/60 p-2 flex items-center gap-2.5 cursor-pointer backdrop-blur-xl shadow-md hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all shrink-0 select-none group/card"
              >
                {/* Mini Server Icon */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0">
                  {partner.icon ? (
                    <img src={partner.icon} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs">
                      {partner.name?.slice(0, 2).toUpperCase() || 'DC'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#23a55a] border border-black" />
                </div>

                {/* Name & Quick Stats */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover/card:text-[#5865F2] transition-colors">
                    {partner.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{formatCount(partner.presenceCount)} onl</span>
                    <span>•</span>
                    <span>{formatCount(partner.memberCount)} mbrs</span>
                  </div>
                </div>

                <ChevronRight size={13} className="text-white/30 group-hover/card:text-white transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
        ============================================================
        PARTNER DETAIL POPUP MODAL (Clean, Full Information on Demand!)
        ============================================================
      */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-3xl overflow-hidden bg-[#0c0c14] border border-white/20 shadow-2xl relative"
              style={{ boxShadow: `0 20px 50px rgba(0,0,0,0.9), 0 0 30px #5865F225` }}
            >
              {/* Modal Banner Backdrop */}
              <div className="relative h-28 sm:h-32 w-full bg-neutral-900 overflow-hidden">
                {selectedPartner.banner ? (
                  <img 
                    src={selectedPartner.banner} 
                    alt="" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ background: `linear-gradient(135deg, #181926 0%, #202235 50%, #5865F235 100%)` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-black/40 to-transparent" />
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 cursor-pointer shadow-md transition-all z-20"
                >
                  <X size={16} />
                </button>

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-mono font-bold tracking-wider text-white/90 flex items-center gap-1.5 shadow-md uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-pulse" />
                  <span>{selectedPartner.category || 'OFFICIAL ALLIANCE'}</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 pt-0 relative">
                {/* Floating Icon Overlapping Banner */}
                <div className="flex items-end justify-between -mt-9 mb-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0c0c14] shadow-2xl bg-black p-0.5 shrink-0">
                    {selectedPartner.icon ? (
                      <img src={selectedPartner.icon} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-lg font-mono">
                        {selectedPartner.name?.slice(0, 2).toUpperCase() || 'DC'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider">
                    <ShieldCheck size={12} />
                    <span>VERIFIED ALLIANCE</span>
                  </div>
                </div>

                {/* Server Name */}
                <h3 className="text-base sm:text-lg font-heading font-extrabold text-white tracking-wide mb-1">
                  {selectedPartner.name}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light mb-4 whitespace-pre-wrap">
                  {selectedPartner.description || (lang === 'th' ? 'พันธมิตรอย่างเป็นทางการของ Slumzick Syndicate เข้าร่วมเพื่อเชื่อมต่อและร่วมกิจกรรม' : 'Official alliance partner. Join to connect and participate in joint events.')}
                </p>

                {/* Live Stats Row */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-around mb-4 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">{lang === 'th' ? 'ออนไลน์สด' : 'ONLINE NOW'}</span>
                    <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {formatCount(selectedPartner.presenceCount)}
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">{lang === 'th' ? 'สมาชิกรวม' : 'TOTAL MEMBERS'}</span>
                    <span className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                      <Users size={13} className="text-white/50" />
                      {formatCount(selectedPartner.memberCount)}
                    </span>
                  </div>
                </div>

                {/* 30-Minute Auto-Sync Indicator */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/40 mb-3.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === 'th' ? 'ข้อมูลยอดออนและสมาชิกอัปเดตอัตโนมัติทุก 30 นาที' : 'Live counts auto-synced every 30m'}</span>
                </div>

                {/* Join Server Action Button */}
                <div className="flex items-center gap-2">
                  <a
                    href={selectedPartner.inviteUrl || (selectedPartner.code ? `https://discord.gg/${selectedPartner.code}` : '#')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(88,101,242,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{lang === 'th' ? 'เข้าร่วมเซิร์ฟเวอร์ Discord' : 'Join Discord Server'}</span>
                    <ExternalLink size={15} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedPartner(null)}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                  >
                    {lang === 'th' ? 'ปิด' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
