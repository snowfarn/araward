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

export default function MusicPlayer({ url, musicTitle, musicCover, musicStartTime = 0, initialVolume = 30 }) {
  const pathname = usePathname();

  // Check if player should be hidden on backend / admin / dashboard / member bio pages
  const shouldHide = !url || Boolean(pathname && (
    pathname.startsWith('/bio') || 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/secret-admin') ||
    pathname.startsWith('/admin')
  ));

  const startSec = Math.max(0, parseFloat(musicStartTime) || 0);

  // Initial volume configured from admin backend (defaults to 30%)
  const defaultVolDecimal = Math.min(1, Math.max(0, (initialVolume !== undefined && initialVolume !== null ? Number(initialVolume) : 30) / 100));
  const [volume, setVolume] = useState(defaultVolDecimal);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState('');
  const [fetchedAuthor, setFetchedAuthor] = useState('');
  const audioRef = useRef(null);
  const iframeRef = useRef(null);
  const isUserPausedRef = useRef(false);
  const isYouTubePlayingRef = useRef(false);
  const hasInitialSeekedRef = useRef(false);

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
      if (!hasInitialSeekedRef.current && startSec > 0) {
        sendYTCommand('seekTo', [startSec, true]);
        hasInitialSeekedRef.current = true;
      }
      sendYTCommand('playVideo');
      setIsPlaying(true);
    }

    if (audioRef.current && !isYouTube && !isSpotify) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (!hasInitialSeekedRef.current && startSec > 0) {
        audioRef.current.currentTime = startSec;
        hasInitialSeekedRef.current = true;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [isYouTube, isSpotify, isMuted, volume, sendYTCommand, sendListeningHandshake, startSec]);

  // Autoplay trigger on mount & refresh with continuous pulse until actively playing
  useEffect(() => {
    if (shouldHide) return;

    // Initial triggers deferred to avoid synchronous setState warning
    const initTimer = setTimeout(() => {
      triggerAudioPlay();
    }, 0);

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
          if (startSec > 0 && !hasInitialSeekedRef.current) {
            sendYTCommand('seekTo', [startSec, true]);
            hasInitialSeekedRef.current = true;
          }
          if (!isUserPausedRef.current) triggerAudioPlay();
        }

        // Check playerState: 1 = Playing, 2 = Paused, 0 = Ended (Loop to startSec)
        if (data.info && typeof data.info.playerState === 'number') {
          if (data.info.playerState === 1) {
            isYouTubePlayingRef.current = true;
            setIsPlaying(true);
          } else if (data.info.playerState === 2 && !isUserPausedRef.current) {
            triggerAudioPlay();
          } else if (data.info.playerState === 0) {
            // Track ended! Loop back directly to the set start time!
            sendYTCommand('seekTo', [startSec, true]);
            sendYTCommand('playVideo');
            setIsPlaying(true);
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleYTMessage);

    return () => {
      clearTimeout(initTimer);
      clearInterval(pulseInterval);
      clearTimeout(maxTimer);
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, handleGesture);
      });
      window.removeEventListener('message', handleYTMessage);
    };
  }, [triggerAudioPlay, shouldHide]);

  // Listen to volume/mute state updates
  useEffect(() => {
    if (shouldHide) return;
    applyVolume(volume, isMuted);
  }, [volume, isMuted, applyVolume, shouldHide]);

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

  if (shouldHide) return null;

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
        <audio 
          ref={audioRef} 
          src={url} 
          preload="auto" 
          onLoadedMetadata={() => {
            if (audioRef.current && startSec > 0 && !hasInitialSeekedRef.current) {
              audioRef.current.currentTime = startSec;
              hasInitialSeekedRef.current = true;
            }
          }}
          onEnded={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = startSec;
              audioRef.current.play().catch(() => {});
            }
          }}
        />
      )}

      {/* Single Active YouTube Iframe (kept in viewport with active z-index so Chromium never throttles or marks as offscreen!) */}
      {isYouTube && ytId && (
        <iframe
          ref={iframeRef}
          id="yt-active-audio-player"
          width="24"
          height="24"
          loading="eager"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${ytId}&enablejsapi=1&playsinline=1${startSec > 0 ? `&start=${Math.floor(startSec)}` : ''}`}
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
        SLIM, SLEEK CYBER AUDIO HUD (Compact, Low-Profile, Never Fat!)
      */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-32px)] sm:w-76 max-w-[310px] rounded-2xl bg-black/90 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(255,42,68,0.2)] p-3 z-50"
          >
            {/* Minimal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a44] animate-pulse" />
                <span className="text-[10px] font-heading font-bold tracking-wider text-white/80 uppercase">
                  SYNDICATE SOUNDTRACK
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close / ปิด"
              >
                <X size={12} />
              </button>
            </div>

            {/* Horizontal Track Row */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow">
                {trackCover ? (
                  <img 
                    src={trackCover} 
                    alt={rawTitle} 
                    className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`} 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#ff2a44] to-black flex items-center justify-center">
                    <Disc size={20} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white leading-tight truncate" title={rawTitle}>
                  {rawTitle}
                </h4>
                <p className="text-[10px] text-white/50 truncate mt-0.5">
                  {fetchedAuthor || 'Gang Audio'}
                </p>
              </div>

              {/* Compact Play Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
              </button>
            </div>

            {/* Slim Volume Line Slider */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <button 
                type="button"
                onClick={toggleMute} 
                className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={13} className="text-red-400" />
                ) : (
                  <Volume2 size={13} />
                )}
              </button>

              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.02" 
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none bg-white/20 outline-none cursor-pointer accent-[#ff2a44]"
              />

              <span className="font-heading font-bold text-[10px] text-white/80 min-w-[26px] text-right">
                {currentDisplayVolume}%
              </span>

              {ytId && (
                <a
                  href={`https://www.youtube.com/watch?v=${ytId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors ml-1"
                  title="YouTube"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ULTRA-SLIM CYBER CAPSULE DOCK (Aerodynamic, Low-Profile, Beautiful)
      */}
      <motion.div 
        layout
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/80 hover:bg-black/95 border border-white/15 hover:border-[#ff2a44]/50 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all duration-300 h-9 sm:h-10"
      >
        {/* Compact Vinyl Disc Thumbnail */}
        <button 
          type="button"
          onClick={togglePlay}
          className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer shrink-0 overflow-hidden border border-white/20 shadow group/disc"
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
              <Disc size={13} className={`text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
          )}
        </button>

        {/* Slim Song Title & Status (Click to open slim volume HUD) */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col justify-center cursor-pointer px-0.5 max-w-[95px] sm:max-w-[130px] text-left"
          title="Click to adjust volume / ปรับระดับเสียง"
        >
          <span className="text-[11px] font-semibold text-white truncate leading-none">
            {rawTitle}
          </span>

          <div className="flex items-center gap-1 mt-0.5">
            {isPlaying ? (
              <div className="flex items-end gap-[1px] h-2">
                <span className="w-[1.5px] h-1.5 bg-[#ff2a44] rounded-full animate-pulse" />
                <span className="w-[1.5px] h-2 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-[1.5px] h-1 bg-[#ff2a44] rounded-full animate-pulse" />
              </div>
            ) : null}
            <span className="text-[8.5px] text-white/50 font-heading font-medium tracking-wider">
              {isPlaying ? `${currentDisplayVolume}%` : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Play / Pause Toggle Button */}
        <button 
          type="button"
          onClick={togglePlay}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#ff2a44] hover:bg-[#ff3b53] text-white flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={11} /> : <Play size={11} className="ml-0.5" />}
        </button>

        {/* Slim Expand / Settings Button */}
        <button 
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isExpanded ? 'text-white' : 'text-white/40 hover:text-white'
          }`}
          title="Adjust Volume / ปรับเสียง"
        >
          <Sliders size={11} />
        </button>
      </motion.div>

    </div>
  );
}
