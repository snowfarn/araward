'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Disc, 
  X,
  ExternalLink,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer({ url, musicTitle, musicCover }) {
  const pathname = usePathname();

  // Completely disable music player on backend / admin / dashboard / member bio pages
  if (pathname && (
    pathname.startsWith('/bio') || 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/secret-admin') ||
    pathname.startsWith('/admin')
  )) {
    return null;
  }

  if (!url) return null;

  // Default volume: 30% ("ความดังที่ 30% จะได้ไม่ดังเกิน")
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState('');
  const [fetchedAuthor, setFetchedAuthor] = useState('');
  const audioRef = useRef(null);
  const iframeRef = useRef(null);
  const isUserPausedRef = useRef(false);
  const isYouTubePlayingRef = useRef(false);

  // Detect player types
  const isYouTube = url && (url.includes('youtube.com') || url.includes('youtu.be'));
  const isSpotify = url && url.includes('spotify.com');

  // Extract YouTube ID cleanly
  const getYouTubeId = useCallback((link) => {
    try {
      if (!link) return null;
      if (link.includes('youtu.be/')) {
        return link.split('youtu.be/')[1]?.split('?')[0];
      }
      const urlObj = new URL(link);
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }, []);

  const ytId = isYouTube ? getYouTubeId(url) : null;

  // Auto-fetch real YouTube song title from oEmbed API if not provided
  useEffect(() => {
    if (isYouTube && ytId && !musicTitle) {
      fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.title) {
            setFetchedTitle(data.title);
            if (data.author_name) setFetchedAuthor(data.author_name);
          }
        })
        .catch(() => {});
    }
  }, [isYouTube, ytId, musicTitle]);

  const rawTitle = musicTitle || fetchedTitle || (ytId === 'ic8j13piAhQ' ? 'Taylor Swift - Cruel Summer' : (isYouTube ? 'SYNDICATE ANTHEM' : isSpotify ? 'SPOTIFY STREAM' : 'GANG AUDIO'));
  const trackCover = musicCover || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  // Direct YouTube Iframe postMessage command dispatcher
  const sendYTCommand = useCallback((func, args = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args
          }),
          '*'
        );
      }
    } catch {}
  }, []);

  // Send listening handshake to YouTube iframe
  const sendListeningHandshake = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          '*'
        );
      }
    } catch {}
  }, []);

  // Set volume across YouTube and HTML5 audio
  const applyVolume = useCallback((targetVol, muted) => {
    const volPercent = muted ? 0 : Math.round(targetVol * 100);

    if (isYouTube) {
      if (muted) {
        sendYTCommand('mute');
        sendYTCommand('setVolume', [0]);
      } else {
        sendYTCommand('unMute');
        sendYTCommand('setVolume', [volPercent]);
      }
    }

    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : targetVol;
    }
  }, [isYouTube, sendYTCommand]);

  // Dispatch play & volume (30%) commands (Respects explicit user pause!)
  const triggerAudioPlay = useCallback(() => {
    if (isUserPausedRef.current) return;

    const targetVol = isMuted ? 0 : Math.round(volume * 100);

    if (isYouTube) {
      sendListeningHandshake();
      sendYTCommand('unMute');
      sendYTCommand('setVolume', [targetVol]);
      sendYTCommand('playVideo');
      setIsPlaying(true);
    }

    if (audioRef.current && !isYouTube && !isSpotify) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [isYouTube, isSpotify, isMuted, volume, sendYTCommand, sendListeningHandshake]);

  // Autoplay trigger on mount & refresh with continuous pulse until actively playing
  useEffect(() => {
    // Initial triggers
    triggerAudioPlay();

    // Pulse polling: Retries every 350ms until YouTube confirms it is actively playing
    // This solves page load latency differences between lightweight Home and heavier subpages!
    const pulseInterval = setInterval(() => {
      if (isUserPausedRef.current || isYouTubePlayingRef.current) {
        return;
      }
      triggerAudioPlay();
    }, 350);

    // Stop pulse after 12 seconds
    const maxTimer = setTimeout(() => {
      clearInterval(pulseInterval);
    }, 12000);

    // Gesture unlock: will NOT trigger if user clicked inside the music dock or explicitly paused!
    const handleGesture = (e) => {
      if (isUserPausedRef.current) return;
      if (e && e.target && e.target.closest && e.target.closest('#gang-music-dock')) {
        return;
      }
      triggerAudioPlay();
    };

    const gestureEvents = [
      'pointerdown', 
      'touchstart', 
      'mousedown', 
      'keydown', 
      'click', 
      'scroll', 
      'wheel', 
      'touchmove',
      'mousemove',
      'focus'
    ];
    gestureEvents.forEach(evt => {
      window.addEventListener(evt, handleGesture, { passive: true });
    });

    const handleYTMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        if (data.event === 'onReady' || data.event === 'initialDelivery') {
          if (!isUserPausedRef.current) triggerAudioPlay();
        }

        // Check playerState: 1 = Playing, 2 = Paused
        if (data.info && typeof data.info.playerState === 'number') {
          if (data.info.playerState === 1) {
            isYouTubePlayingRef.current = true;
            setIsPlaying(true);
          } else if (data.info.playerState === 2 && !isUserPausedRef.current) {
            triggerAudioPlay();
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleYTMessage);

    return () => {
      clearInterval(pulseInterval);
      clearTimeout(maxTimer);
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, handleGesture);
      });
      window.removeEventListener('message', handleYTMessage);
    };
  }, [triggerAudioPlay]);

  // Listen to volume/mute state updates
  useEffect(() => {
    applyVolume(volume, isMuted);
  }, [volume, isMuted, applyVolume]);

  // Toggle Play / Pause
  const togglePlay = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (isPlaying) {
      isUserPausedRef.current = true;
      setIsPlaying(false);
      if (isYouTube) sendYTCommand('pauseVideo');
      if (audioRef.current) audioRef.current.pause();
    } else {
      isUserPausedRef.current = false;
      setIsPlaying(true);
      if (isYouTube) {
        sendYTCommand('unMute');
        sendYTCommand('setVolume', [isMuted ? 0 : Math.round(volume * 100)]);
        sendYTCommand('playVideo');
      }
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Toggle Mute
  const toggleMute = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    applyVolume(volume, nextMuted);
  };

  // Handle Volume Slider
  const handleVolumeChange = (newVal) => {
    const val = Math.max(0, Math.min(1, newVal));
    setVolume(val);
    if (isMuted) setIsMuted(false);
    applyVolume(val, false);
  };

  if (!url) return null;

  // Spotify Embed handler
  if (isSpotify) {
    const embedUrl = url.includes('/embed/') ? url : url.replace('spotify.com/', 'spotify.com/embed/');
    return (
      <div className="fixed bottom-4 left-4 z-40 max-w-[280px] sm:max-w-[320px] w-full shadow-2xl rounded-2xl overflow-hidden border border-white/15 backdrop-blur-xl">
        <iframe 
          src={embedUrl} 
          width="100%" 
          height="80" 
          frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          className="rounded-2xl"
        />
      </div>
    );
  }

  const currentDisplayVolume = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div 
      id="gang-music-dock" 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans select-none"
    >
      {/* Hidden Audio Element for direct MP3 */}
      {!isYouTube && !isSpotify && (
        <audio ref={audioRef} src={url} loop preload="auto" />
      )}

      {/* Single Active YouTube Iframe (kept in viewport with active z-index so Chromium never throttles or marks as offscreen!) */}
      {isYouTube && ytId && (
        <iframe
          ref={iframeRef}
          id="yt-active-audio-player"
          width="24"
          height="24"
          loading="eager"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${ytId}&enablejsapi=1&playsinline=1`}
          title="Gang Audio Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute bottom-0 right-0 w-6 h-6 opacity-[0.01] pointer-events-none overflow-hidden z-10"
          onLoad={() => {
            if (!isUserPausedRef.current) {
              triggerAudioPlay();
              setTimeout(triggerAudioPlay, 100);
              setTimeout(triggerAudioPlay, 300);
              setTimeout(triggerAudioPlay, 600);
              setTimeout(triggerAudioPlay, 1200);
              setTimeout(triggerAudioPlay, 2000);
            }
          }}
        />
      )}

      {/* 
        EXPANDED TRACK DETAILS & AUDIO HUD MODAL 
        (Requested: กดดูข้อมูลเพิ่มเติมได้ แสดงชื่อเพลงจริง ระดับเสียง ปุ่มปิดสบายตาไม่ติดมุมทั้งมือถือและPC)
      */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-32px)] sm:w-84 max-w-[340px] rounded-3xl bg-black/95 border border-white/20 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(255,42,68,0.25)] p-4 sm:p-5 z-50"
          >
            {/* Modal Header: Title & Spacious Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
              <div className="flex items-center gap-1.5">
                <Radio size={14} className="text-[#ff2a44] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-white/90 uppercase font-mono">
                  SYNDICATE SOUNDTRACK
                </span>
              </div>

              {/* Spacious Close Button (Never jammed against the corner!) */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                title="Close Info / ปิดหน้าต่าง"
              >
                <X size={14} />
              </button>
            </div>

            {/* Album Cover & Track Details */}
            <div className="flex gap-3.5 items-center mb-4">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md">
                {trackCover ? (
                  <img 
                    src={trackCover} 
                    alt={rawTitle} 
                    className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`} 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#ff2a44] to-black flex items-center justify-center">
                    <Disc size={28} className="text-white" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="flex items-end gap-[2px] h-3">
                      <span className="w-[2px] h-2 bg-white rounded-full animate-pulse" />
                      <span className="w-[2px] h-3 bg-[#ff2a44] rounded-full animate-bounce" />
                      <span className="w-[2px] h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight line-clamp-2" title={rawTitle}>
                  {rawTitle}
                </h4>
                <p className="text-[11px] text-white/50 font-medium mt-1 truncate">
                  {fetchedAuthor || 'Gang Official Anthem'}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-white/30'}`} />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/60">
                    {isPlaying ? 'ACTIVE STREAM' : 'STREAM PAUSED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Roomy Volume Slider Row */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mb-3.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-white/60">
                <span className="flex items-center gap-1.5">
                  <Sliders size={12} className="text-[#ff2a44]" />
                  <span>MASTER VOLUME</span>
                </span>
                <span className="font-mono font-bold text-white/90">
                  {currentDisplayVolume}%
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button 
                  type="button"
                  onClick={toggleMute} 
                  className="text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={16} className="text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>

                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.02" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-white/20 outline-none cursor-pointer accent-[#ff2a44]"
                />
              </div>
            </div>

            {/* Quick Action Footer inside Modal */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={togglePlay}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] hover:from-[#ff3b53] hover:to-[#ff2a44] text-white text-xs font-bold tracking-wider shadow-lg transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                <span>{isPlaying ? 'PAUSE MUSIC' : 'PLAY MUSIC'}</span>
              </button>

              {ytId && (
                <a
                  href={`https://www.youtube.com/watch?v=${ytId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0"
                  title="Open on YouTube"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        COMPACT MINI DOCK (เล่นเพลงย่อๆ) 
        - Compact capsule
        - Click title/expand icon to open the full detailed card
      */}
      <motion.div 
        layout
        className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-full bg-black/85 hover:bg-black/95 border border-white/15 hover:border-[#ff2a44]/50 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(255,42,68,0.2)] transition-all duration-300"
      >
        {/* Cover Art / Rotating Disc (Click to toggle play/pause) */}
        <button 
          type="button"
          onClick={togglePlay}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full cursor-pointer shrink-0 overflow-hidden border border-white/20 shadow-md group/disc"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {trackCover ? (
            <img 
              src={trackCover} 
              alt={rawTitle} 
              className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`} 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ff2a44] to-black flex items-center justify-center">
              <Disc size={18} className={`text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
          )}

          {/* Center Play/Pause Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/disc:opacity-100 transition-opacity">
            {isPlaying ? <Pause size={13} className="text-white" /> : <Play size={13} className="text-white ml-0.5" />}
          </div>
        </button>

        {/* Compact Title Area - Click to open full details */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col cursor-pointer px-1 max-w-[105px] sm:max-w-[135px] text-left"
          title="Click to view details & volume / กดดูข้อมูลเพลงและปรับเสียง"
        >
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide truncate">
            {rawTitle}
          </span>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] sm:text-[10px] text-white/50 font-mono tracking-wider">
              {isPlaying ? `${currentDisplayVolume}% VOL` : 'PAUSED'}
            </span>

            {/* Micro Equalizer */}
            {isPlaying && (
              <div className="flex items-end gap-[1.5px] h-2">
                <span className="w-[2px] h-1.5 bg-[#ff2a44] rounded-full animate-pulse" />
                <span className="w-[2px] h-2.5 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-[2px] h-1 bg-[#ff2a44] rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Play / Pause Action Button */}
        <button 
          type="button"
          onClick={togglePlay}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ff2a44] hover:bg-[#ff3b53] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>

        {/* Expand / View Details Button */}
        <button 
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
            isExpanded 
              ? 'bg-white text-black border-white shadow-md' 
              : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border-white/10'
          }`}
          title="View Details & Volume / ดูข้อมูลเพลงและปรับเสียง"
        >
          {isExpanded ? <X size={13} /> : <Maximize2 size={13} />}
        </button>
      </motion.div>

    </div>
  );
}
