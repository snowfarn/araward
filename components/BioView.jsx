'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Sparkles,
  Crown,
  Flame,
  Star,
  Zap,
  Swords,
  Crosshair,
  Gem,
  Ghost,
  Trophy,
  User,
  Award
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import CursorEffect from '@/components/CursorEffect';
import DiscordWidget from '@/components/DiscordWidget';
import RobloxWidget from '@/components/RobloxWidget';
import BioMusicPlayer from '@/components/BioMusicPlayer';
import { SocialBrandButton } from '@/components/BrandIcons';

const ICON_MAP = {
  Crown,
  Shield,
  Flame,
  Star,
  Zap,
  Swords,
  Crosshair,
  Gem,
  Ghost,
  Trophy,
  User,
  Award,
  Sparkles
};

export default function BioView({ 
  member, 
  role, 
  primaryColor, 
  roleColor, 
  particleColor, 
  displayViews, 
  bgUrl, 
  isVideo, 
  contactLinks,
  robloxUsername
}) {
  const textColor = member.textColor || '#ffffff';
  const cardStyle = member.cardStyle || 'glass';

  // Live view tracking with micro-animation & anti-spam cooldown
  const [currentViews, setCurrentViews] = useState(displayViews || 0);
  const [justIncremented, setJustIncremented] = useState(false);

  useEffect(() => {
    if (!member?.id) return;

    // Keep state synced with prop if prop changes
    if (typeof displayViews === 'number' && displayViews > currentViews) {
      setCurrentViews(displayViews);
    }

    const sessionKey = `viewed_${member.id}`;
    const lastViewed = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    const shouldIncrement = !lastViewed || (now - parseInt(lastViewed, 10) > 45000);

    if (shouldIncrement) {
      sessionStorage.setItem(sessionKey, now.toString());
      fetch(`/api/views/${member.id}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success && typeof data.views === 'number') {
            setCurrentViews(data.views);
            setJustIncremented(true);
            setTimeout(() => setJustIncremented(false), 2500);
          }
        })
        .catch(() => {});
    }
  }, [member?.id, displayViews]);

  const RoleIcon = (role?.icon && ICON_MAP[role.icon]) ? ICON_MAP[role.icon] : Shield;

  // Filter out roblox from contactLinks if we display the full gun.lol RobloxWidget
  const filteredSocialLinks = contactLinks.filter(item => item.platform !== 'roblox' && item.platform !== 'discord');

  // UI box glassmorphism style classes based on user custom preference
  const bioBoxClasses = cardStyle === 'transparent'
    ? 'bg-transparent border border-transparent shadow-none'
    : cardStyle === 'ultra_glass'
    ? 'bg-black/15 backdrop-blur-md border border-white/10 shadow-sm'
    : cardStyle === 'dark'
    ? 'bg-black/85 backdrop-blur-3xl border border-white/20 shadow-lg'
    : 'bg-black/45 backdrop-blur-2xl border border-white/10 shadow-sm';

  const counterBoxClasses = cardStyle === 'transparent'
    ? 'bg-transparent border border-white/10'
    : cardStyle === 'ultra_glass'
    ? 'bg-black/20 backdrop-blur-md border border-white/10'
    : cardStyle === 'dark'
    ? 'bg-black/85 backdrop-blur-3xl border border-white/20'
    : 'bg-black/55 backdrop-blur-2xl border border-white/15';

  return (
    <main className="min-h-screen flex flex-col relative items-center justify-center p-4 sm:p-6 pb-16 overflow-x-hidden font-sans select-none">
      {/* Background Media Engine */}
      {isVideo ? (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          src={bgUrl} 
          className="fixed inset-0 w-full h-full object-cover -z-20 pointer-events-none"
        />
      ) : bgUrl ? (
        <div 
          className="fixed inset-0 -z-20 bg-[#040407] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(4, 4, 7, 0.75)), url(${bgUrl})` 
          }}
        />
      ) : (
        <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#08080c] via-[#040407] to-black pointer-events-none" />
      )}

      {/* Atmospheric Vignette & Contrast Depth */}
      <div 
        className="fixed inset-0 -z-10 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.6) 80%, rgba(0, 0, 0, 0.95) 100%)' 
        }} 
      />

      {/* Particle Atmosphere (Independent Particle Color) */}
      <ParticleBackground type={member.particleType || 'none'} color={particleColor} />

      {/* Interactive Mouse Cursor Trail Effect */}
      <CursorEffect type={member.cursorEffect || 'none'} color={primaryColor} />

      {/* Top Floating Back Navigation */}
      <Link 
        href="/members" 
        prefetch={true}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 text-white/80 hover:text-white transition-all z-40 flex items-center gap-2 font-bold text-xs bg-black/60 border border-white/15 px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-2xl hover:bg-white/10 shadow-xl group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-[#ff2a44]" /> 
        <span className="tracking-wider uppercase font-mono text-[11px]">ROSTER</span>
      </Link>

      {/* Main Center Bio Column */}
      <div className="w-full max-w-[460px] z-10 relative flex flex-col items-center text-center my-auto pt-4 sm:pt-6">
        
        {/* Profile Avatar (Clean, NO head accessories) */}
        <div className="relative mb-3 group cursor-pointer">
          {/* Ambient Glow */}
          <div 
            className="absolute -inset-2 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          />

          {/* Core Avatar Frame */}
          <div 
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2.5px] shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
            style={{ background: `linear-gradient(135deg, #ffffff, ${primaryColor}, #ffffff)` }}
          >
            <img 
              src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
              className="w-full h-full rounded-full object-cover border-4 border-[#07070a] shadow-inner"
              alt={member.name}
            />
          </div>
        </div>

        {/* Display Name with Custom Font Color */}
        <h1 
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1"
          style={{ 
            color: textColor,
            textShadow: `0 0 16px ${textColor}90, 0 0 35px ${primaryColor}70` 
          }}
        >
          {member.name}
        </h1>

        {/* Syndicate Role Tag (ยศ - สียังคงเดิมตามยศแก๊ง ไม่โดนทับด้วย textColor หรือ themeColor) */}
        {role && (
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 border shadow-sm backdrop-blur-md"
            style={{ 
              color: role.color || roleColor, 
              borderColor: `${role.color || roleColor}60`, 
              backgroundColor: `${role.color || roleColor}18`,
              boxShadow: `0 0 12px ${role.color || roleColor}25`
            }}
          >
            {role.icon && (role.icon.startsWith('http') || role.icon.startsWith('/')) ? (
              <img src={role.icon} alt="" className="w-3 h-3 object-contain shrink-0" />
            ) : (
              <RoleIcon size={11} className="shrink-0" />
            )}
            <span>{role.name}</span>
          </div>
        )}

        {/* Bio Description / Slogan with Customizable Glass Box */}
        {member.bio && (
          <div className="max-w-xs sm:max-w-sm w-full px-2 mb-3">
            <p 
              className={`text-xs sm:text-sm font-light leading-relaxed py-1.5 px-3.5 rounded-xl inline-block transition-all ${bioBoxClasses}`}
              style={{ color: `${textColor}e0` }}
            >
              {member.bio}
            </p>
          </div>
        )}

        {/* guns.lol Connected Profile Widgets (Discord & Roblox) */}
        <div className="w-full flex flex-col items-center gap-2.5 px-2 mb-3">
          {/* 1. Discord Profile Widget */}
          <DiscordWidget 
            discordId={member.discordId || member.id}
            customUsername={member.discordUsername}
            customStatusText={member.discordStatusText}
            customBadge={member.discordBadge}
            avatarFallback={member.avatar}
            primaryColor={primaryColor}
            textColor={textColor}
            cardStyle={cardStyle}
          />

          {/* 2. Roblox Profile Widget (gun.lol style, with live avatar headshot!) */}
          {(robloxUsername || member.robloxUsername || member.robloxUserId) && (
            <RobloxWidget 
              username={robloxUsername || member.robloxUsername}
              userId={member.robloxUserId}
              primaryColor={primaryColor}
              textColor={textColor}
              cardStyle={cardStyle}
            />
          )}
        </div>

        {/* Other Social Contacts: Clean Row of Official Brand SVG Icons */}
        {filteredSocialLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-sm w-full px-2 mb-3">
            {filteredSocialLinks.map((item, idx) => (
              <SocialBrandButton
                key={`${item.platform}-${idx}`}
                platform={item.platform}
                url={item.url}
              />
            ))}
          </div>
        )}

        {/* Integrated Bio Music Player (Live seconds, both skip buttons, volume slider) */}
        {member.musicUrl && (
          <BioMusicPlayer 
            url={member.musicUrl}
            title={member.musicTitle}
            artist={member.musicArtist}
            cover={member.musicCover}
            primaryColor={primaryColor}
            textColor={textColor}
            cardStyle={cardStyle}
            previewMode={false}
          />
        )}

        {/* Subtle DEV Instagram Credit inside Card */}
        <div className="pt-2 pb-1 text-center">
          <a
            href="https://www.instagram.com/gkbyontop/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-white/30 hover:text-white/80 transition-colors uppercase cursor-pointer"
            title="Developer Instagram: @gkbyontop"
          >
            <span>DEV</span>
            <span>•</span>
            <span className="hover:underline">@gkbyontop</span>
          </a>
        </div>
      </div>

      {/* Bottom-Left Live View Counter with Micro-Animation */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30">
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xl text-xs font-mono font-bold tracking-wider select-none transition-all duration-300 ${counterBoxClasses} ${
            justIncremented ? 'ring-2 ring-emerald-400/50 scale-105 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : ''
          }`}
          style={{ color: `${textColor}cc` }}
        >
          <Eye 
            size={13} 
            className={`transition-colors duration-300 ${justIncremented ? 'text-emerald-400 animate-pulse' : ''}`}
            style={!justIncremented ? { color: `${textColor}99` } : {}} 
          />
          <span className={`transition-colors duration-300 ${justIncremented ? 'text-emerald-300 font-extrabold' : ''}`}>
            {currentViews}
          </span>
          {justIncremented && (
            <span className="text-[10px] text-emerald-400 font-bold animate-bounce ml-0.5">
              +1
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
