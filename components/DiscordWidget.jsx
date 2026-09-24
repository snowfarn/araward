'use client';

import { useState, useEffect } from 'react';
import { Trophy, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscordWidget({ 
  discordId, 
  customUsername, 
  customStatusText, 
  customBadge, 
  avatarFallback,
  primaryColor = '#ff2a44',
  textColor = '#ffffff',
  cardStyle = 'glass'
}) {
  const [lanyardData, setLanyardData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch Lanyard Real-time Discord presence if discordId is provided
  useEffect(() => {
    if (!discordId) return;

    let isMounted = true;
    const fetchLanyard = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json && json.data) {
            setLanyardData(json.data);
          }
        }
      } catch (err) {}
    };

    fetchLanyard();
    const pollInterval = setInterval(fetchLanyard, 12000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [discordId]);

  // Status mapping: Keep status alive and consistent when offline instead of flapping to grey offline
  const rawStatus = lanyardData?.discord_status;
  const discordStatus = (rawStatus && rawStatus !== 'offline') ? rawStatus : 'online';

  const statusColorMap = {
    online: '#23a55a',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#23a55a', // Retain active color
  };

  const statusColor = statusColorMap[discordStatus] || '#23a55a';

  // Cached status from localStorage so when user closes Discord, their status never disappears or resets
  const [cachedStatusText, setCachedStatusText] = useState(() => {
    if (typeof window !== 'undefined' && discordId) {
      try {
        return localStorage.getItem(`discord_status_note_${discordId}`) || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  // Display values with smart fallback chain
  const displayAvatar = lanyardData?.discord_user?.id && lanyardData?.discord_user?.avatar
    ? `https://cdn.discordapp.com/avatars/${lanyardData.discord_user.id}/${lanyardData.discord_user.avatar}.${lanyardData.discord_user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`
    : (avatarFallback || "https://cdn.discordapp.com/embed/avatars/0.png");

  const displayUsername = customUsername || lanyardData?.discord_user?.global_name || lanyardData?.discord_user?.username || 'Operative';

  // Custom status / activity text
  const customActivity = lanyardData?.activities?.find(a => a.type === 4)?.state;
  const spotifyActivity = lanyardData?.spotify ? `Listening to ${lanyardData.spotify.song}` : null;
  const gameActivity = lanyardData?.activities?.find(a => a.type === 0)?.name ? `Playing ${lanyardData.activities.find(a => a.type === 0).name}` : null;

  // Persist live status so it never gets wiped when user goes offline
  useEffect(() => {
    const liveNote = customActivity || spotifyActivity || gameActivity;
    if (liveNote && discordId) {
      setCachedStatusText(liveNote);
      try {
        localStorage.setItem(`discord_status_note_${discordId}`, liveNote);
      } catch (e) {}
    }
  }, [customActivity, spotifyActivity, gameActivity, discordId]);

  // Priority: live Discord activity -> cached status note -> saved DB status -> display name
  const validSavedText = (customStatusText && customStatusText !== 'Zick เช่เวงัน') ? customStatusText : null;
  const displayStatusText = customActivity 
    || spotifyActivity 
    || gameActivity 
    || cachedStatusText 
    || validSavedText 
    || lanyardData?.discord_user?.global_name 
    || lanyardData?.discord_user?.display_name 
    || customUsername 
    || 'Active';

  const primaryGuild = lanyardData?.discord_user?.primary_guild;
  const clanBadgeIcon = primaryGuild?.badge && primaryGuild?.identity_guild_id
    ? `https://cdn.discordapp.com/clan-badges/${primaryGuild.identity_guild_id}/${primaryGuild.badge}.png`
    : 'https://cdn.discordapp.com/clan-badges/1397489019289469010/8f472817508b16b79411158f14b393f1.png';
  const badgeText = (customBadge && customBadge !== 'NOPE') ? customBadge : (primaryGuild?.tag || 'REAL');

  const handleClick = (e) => {
    e.stopPropagation();
    if (discordId) {
      window.open(`https://discord.com/users/${discordId}`, '_blank');
    } else {
      if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(displayUsername);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
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
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all group select-none max-w-full cursor-pointer relative ${cardBgClasses}`}
      title={discordId ? "Click to open Discord profile" : "Click to copy Discord tag"}
    >
      {/* Discord Avatar with Real-time Status Indicator Dot */}
      <div className="relative shrink-0 w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-white/25 to-white/5 shadow-md">
        <img 
          src={displayAvatar} 
          alt={displayUsername} 
          className="w-full h-full rounded-full object-cover"
        />
        {/* Real-time Status Indicator Pill/Dot */}
        <span 
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#09090d] flex items-center justify-center shadow-md transition-colors"
          style={{ backgroundColor: statusColor }}
        >
          {discordStatus === 'dnd' && (
            <span className="w-1.5 h-0.5 bg-[#09090d] rounded-full" />
          )}
          {discordStatus === 'idle' && (
            <span className="w-1.5 h-1.5 bg-[#09090d] rounded-full -translate-x-0.5 -translate-y-0.5" />
          )}
        </span>
      </div>

      {/* Identity & Presence Subtext */}
      <div className="flex flex-col min-w-0 pr-1 text-left">
        {/* Top: Clean Username (No User ID, No Real Name) + Real Server Tag with Official Clan Icon */}
        <div className="flex items-center gap-2 flex-wrap">
          <span 
            className="font-bold text-xs sm:text-sm tracking-wide truncate max-w-[150px] sm:max-w-[190px]"
            style={{ color: textColor }}
          >
            {displayUsername}
          </span>

          {/* Official Server / Clan Tag Badge (Real Clan Icon, NO Trophy!) */}
          {badgeText && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-bold text-white/90 shadow-sm shrink-0">
              {clanBadgeIcon ? (
                <img 
                  src={clanBadgeIcon} 
                  alt="" 
                  className="w-3.5 h-3.5 object-contain rounded shrink-0" 
                />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] shrink-0" />
              )}
              <span className="tracking-wider uppercase font-mono">{badgeText}</span>
            </div>
          )}
        </div>

        {/* Bottom: Custom Activity / Status Note */}
        <p className="text-[11px] sm:text-xs text-white/70 font-light truncate max-w-[180px] sm:max-w-[240px] mt-0.5">
          {displayStatusText}
        </p>
      </div>

      {/* Copy / Link Indicator Badge */}
      {copied && (
        <span className="absolute -top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-green-500 text-black font-bold shadow-md">
          COPIED!
        </span>
      )}
    </motion.div>
  );
}
