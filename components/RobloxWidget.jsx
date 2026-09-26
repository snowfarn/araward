'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RobloxWidget({ 
  username, 
  userId, 
  primaryColor = '#ff2a44',
  textColor = '#ffffff',
  cardStyle = 'glass',
  className = ''
}) {
  const [robloxData, setRobloxData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    let isMounted = true;
    const fetchRoblox = async () => {
      setLoading(true);
      try {
        const clean = username.trim().replace(/^@/, '');
        const res = await fetch(`/api/roblox/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json && json.user) {
            setRobloxData(json.user);
          }
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRoblox();

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (!username) return null;

  const displayAvatar = robloxData?.avatarUrl || 
    (userId ? `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true` : null);

  const displayName = robloxData?.displayName || username;
  const officialUsername = robloxData?.name || username;
  const targetUrl = robloxData?.profileUrl || 
    (userId ? `https://www.roblox.com/users/${userId}/profile` : `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`);

  const handleClick = (e) => {
    e.stopPropagation();
    try {
      if (userId || username) {
        fetch(`/api/analytics/${userId || username}/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: 'roblox' }),
          keepalive: true
        }).catch(() => {});
      }
    } catch {}
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const cardBgClasses = cardStyle === 'transparent'
    ? 'bg-transparent border border-white/5 shadow-none'
    : cardStyle === 'ultra_glass'
    ? 'bg-black/15 backdrop-blur-md border border-white/10 hover:border-white/20'
    : cardStyle === 'dark'
    ? 'bg-black/85 backdrop-blur-3xl border border-white/20 hover:border-white/35 shadow-xl'
    : 'bg-black/55 backdrop-blur-2xl border border-white/15 hover:border-white/35 shadow-[0_10px_30px_rgba(0,0,0,0.7)]';

  return (
    <motion.div
      onClick={handleClick}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all group select-none max-w-full cursor-pointer relative ${cardBgClasses}`}
      title="Click to view Roblox profile"
    >
      {/* Roblox Avatar with circle ring */}
      <div className="relative shrink-0 w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-white/30 to-white/5 shadow-md flex items-center justify-center overflow-hidden bg-neutral-900">
        {displayAvatar ? (
          <img 
            src={displayAvatar} 
            alt={displayName} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <g transform="translate(12, 12) rotate(-15.5)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M -7 -7.5 C -7.3 -7.5 -7.5 -7.3 -7.5 -7 L -7.5 7 C -7.5 7.3 -7.3 7.5 -7 7.5 L 7 7.5 C 7.3 7.5 7.5 7.3 7.5 7 L 7.5 -7 C 7.5 -7.3 7.3 -7.5 7 -7.5 Z M -2.2 -2.4 C -2.35 -2.4 -2.4 -2.35 -2.4 -2.2 L -2.4 2.2 C -2.4 2.35 -2.35 2.4 -2.2 2.4 L 2.2 2.4 C 2.35 2.4 2.4 2.35 2.4 2.2 L 2.4 -2.2 C 2.4 -2.35 2.35 -2.4 2.2 -2.4 Z"
                />
              </g>
            </svg>
          </div>
        )}

        {/* Small corner logo indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-[#09090d] flex items-center justify-center shadow-md">
          <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white">
            <g transform="translate(12, 12) rotate(-15.5)">
              <rect x="-6" y="-6" width="12" height="12" fill="white" />
            </g>
          </svg>
        </span>
      </div>

      {/* Identity & Subtext */}
      <div className="flex flex-col min-w-0 pr-1 text-left">
        {/* Top: Display Name + Roblox Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span 
            className="font-bold text-xs sm:text-sm tracking-wide truncate max-w-[140px] sm:max-w-[180px]"
            style={{ color: textColor }}
          >
            {displayName}
          </span>

          {/* Roblox Badge (gun.lol connection badge style) */}
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-bold text-white/90 shadow-sm shrink-0">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
              <g transform="translate(12, 12) rotate(-15.5)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M -7 -7.5 H 7 V 7.5 H -7 Z M -2.2 -2.4 H 2.2 V 2.4 H -2.2 Z"
                />
              </g>
            </svg>
            <span className="tracking-wider uppercase font-mono">ROBLOX</span>
          </div>

          <ExternalLink size={11} className="text-white/40 group-hover:text-white/80 transition-colors" />
        </div>

        {/* Bottom: @username */}
        <p className="text-[11px] sm:text-xs text-white/60 font-light truncate max-w-[180px] sm:max-w-[220px] mt-0.5 font-mono">
          @{officialUsername}
        </p>
      </div>
    </motion.div>
  );
}
