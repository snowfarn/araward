'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  Disc,
  Radio,
  Sparkles,
  ListMusic
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BioMusicPlayer({ 
  url, 
  title, 
  artist, 
  cover, 
  musicStartTime = 0,
  musicVolume = 45,
  primaryColor = '#ff2a44',
  textColor = '#ffffff',
  cardStyle = 'glass',
  previewMode = false,
  playerStyle = 'deck'
}) {
  const startSec = Math.max(0, parseFloat(musicStartTime) || 0);
  const defaultVolDecimal = Math.min(1, Math.max(0, (musicVolume !== undefined && musicVolume !== null ? Number(musicVolume) : 45) / 100));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSec);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(defaultVolDecimal);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const containerRef = useRef(null);
  const containerId = previewMode ? 'yt-bio-player-preview' : 'yt-bio-player-main';

  const isUserPausedRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  const isYouTube = url && (url.includes('youtube.com') || url.includes('youtu.be'));
  const isDirectAudio = url && !isYouTube && !url.includes('spotify.com');

  // Extract YouTube ID cleanly
  const getYouTubeId = useCallback((link) => {
    try {
      if (!link) return null;
      if (link.includes('youtu.be/')) return link.split('youtu.be/')[1]?.split('?')[0];
      const urlObj = new URL(link);
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }, []);

  const ytId = isYouTube ? getYouTubeId(url) : null;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Safe Play Dispatcher — muted autoplay first for iOS, then unmute on interaction
  const triggerAudioPlay = useCallback(() => {
    if (previewMode || isUserPausedRef.current) return;

    if (isYouTube && ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(isMuted ? 0 : Math.round(volume * 100));
        }
        if (typeof ytPlayerRef.current.playVideo === 'function') {
          ytPlayerRef.current.playVideo();
        }
        // Unmute after a short delay (mobile browsers need gesture first)
        if (!isMuted && typeof ytPlayerRef.current.unMute === 'function') {
          setTimeout(() => {
            try {
              ytPlayerRef.current?.unMute?.();
              ytPlayerRef.current?.setVolume?.(Math.round(volume * 100));
            } catch {}
          }, 200);
        }
      } catch {}
    }

    if (isDirectAudio && audioRef.current) {
      // iOS: try muted first then unmute
      audioRef.current.volume = isMuted ? 0 : volume;
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.then(() => {
          setIsPlaying(true);
          if (!isMuted) {
            audioRef.current.volume = volume;
          }
        }).catch(() => {
          // Try muted fallback for autoplay policy
          try {
            audioRef.current.muted = true;
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              // Unmute on next user gesture
              const unmute = () => {
                try {
                  if (audioRef.current && !isMuted) {
                    audioRef.current.muted = false;
                    audioRef.current.volume = volume;
                  }
                } catch {}
                document.removeEventListener('touchstart', unmute);
                document.removeEventListener('click', unmute);
              };
              document.addEventListener('touchstart', unmute, { once: true, passive: true });
              document.addEventListener('click', unmute, { once: true });
            }).catch(() => {});
          } catch {}
        });
      }
    }
  }, [previewMode, isYouTube, isDirectAudio, isMuted, volume]);

  // Initialize YouTube IFrame API cleanly on a mounted DIV (Never an unmanaged iframe!)
  useEffect(() => {
    if (previewMode || !isYouTube || !ytId) return;

    let destroyed = false;

    const initYTPlayer = () => {
      if (destroyed || !window.YT || !window.YT.Player) return;
      const targetEl = document.getElementById(containerId);
      if (!targetEl) return;

      try {
        if (ytPlayerRef.current?.destroy) {
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
        }
      } catch {}

      try {
        ytPlayerRef.current = new window.YT.Player(containerId, {
          height: '200',
          width: '200',
          videoId: ytId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            loop: 1,
            playlist: ytId,
            playsinline: 1,
            enablejsapi: 1,
            mute: 1, // Start muted for iOS autoplay policy, then unmute on interaction
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event) => {
              if (destroyed) return;
              ytPlayerRef.current = event.target;
              const dur = event.target.getDuration();
              if (typeof dur === 'number' && dur > 0) setDuration(dur);
              event.target.setVolume(isMuted ? 0 : Math.round(volume * 100));

              if (startSec > 0) {
                event.target.seekTo(startSec, true);
                setCurrentTime(startSec);
              }

              // Play muted first (always works on mobile), then unmute after gesture
              event.target.playVideo();
              setIsPlaying(true);

              if (!isMuted) {
                // Try unmuting immediately (works on desktop)
                try { event.target.unMute(); event.target.setVolume(Math.round(volume * 100)); } catch {}
                // Retry unmute on first user interaction (for iOS)
                const unmuteOnGesture = () => {
                  try {
                    event.target.unMute();
                    event.target.setVolume(Math.round(volume * 100));
                  } catch {}
                  document.removeEventListener('touchstart', unmuteOnGesture);
                  document.removeEventListener('click', unmuteOnGesture);
                };
                document.addEventListener('touchstart', unmuteOnGesture, { once: true, passive: true });
                document.addEventListener('click', unmuteOnGesture, { once: true });
              }
            },
            onStateChange: (event) => {
              if (destroyed) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                const dur = event.target.getDuration();
                if (typeof dur === 'number' && dur > 0) setDuration(dur);
              } else if (event.data === 2) {
                if (isUserPausedRef.current) {
                  setIsPlaying(false);
                }
              } else if (event.data === 0) {
                // Loop cleanly back to startSec
                event.target.seekTo(startSec, true);
                event.target.playVideo();
                setCurrentTime(startSec);
              }
            }
          }
        });
      } catch (err) {
        console.error("YT Player init error:", err);
      }
    };

    // If script is already loaded (e.g. navigating from /members), init immediately!
    if (window.YT && window.YT.Player) {
      initYTPlayer();
    } else {
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === 'function') prevReady();
        if (!destroyed) initYTPlayer();
      };

      // Polling fallback to guarantee init regardless of callback timings
      const poll = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(poll);
          if (!destroyed) initYTPlayer();
        }
      }, 80);

      setTimeout(() => clearInterval(poll), 10000);
    }

    return () => {
      destroyed = true;
      try {
        if (ytPlayerRef.current?.destroy) {
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
        }
      } catch {}
    };
  }, [ytId, isYouTube, previewMode]);

  // Global user interaction listener — aggressive mobile audio unlock (iOS Safari / Android WebView)
  useEffect(() => {
    if (previewMode || (!isYouTube && !isDirectAudio)) return;

    // AudioContext unlock (required for iOS Safari)
    let audioCtx = null;
    const unlockAudioContext = () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        // Play a silent buffer to unlock
        const buf = audioCtx.createBuffer(1, 1, 22050);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(audioCtx.destination);
        src.start(0);
      } catch {}
    };

    // Retry initial play in case browser allowed autoplay
    const initialTimer = setTimeout(() => { triggerAudioPlay(); }, 500);
    const retryTimer = setTimeout(() => { triggerAudioPlay(); }, 1500);
    const retryTimer2 = setTimeout(() => { triggerAudioPlay(); }, 3000);

    const handleGesture = (e) => {
      hasUserInteractedRef.current = true;
      unlockAudioContext();
      if (isUserPausedRef.current) return;
      if (e?.target?.closest?.('.bio-player-control-btn')) return;
      triggerAudioPlay();
    };

    // iOS Safari / Android require touchend or click — touchstart is not reliable
    const gestureEvents = [
      'pointerdown',
      'touchstart',
      'touchend',
      'mousedown',
      'click',
      'keydown',
      'scroll',
      'wheel',
    ];

    gestureEvents.forEach(evt => {
      window.addEventListener(evt, handleGesture, { passive: true, once: false });
    });

    // iOS Safari: additional global body tap handler for unlock
    const bodyTapUnlock = () => {
      hasUserInteractedRef.current = true;
      unlockAudioContext();
      if (!isUserPausedRef.current) triggerAudioPlay();
    };
    document.body.addEventListener('touchend', bodyTapUnlock, { passive: true });
    document.body.addEventListener('touchstart', bodyTapUnlock, { passive: true });

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(retryTimer);
      clearTimeout(retryTimer2);
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, handleGesture);
      });
      document.body.removeEventListener('touchend', bodyTapUnlock);
      document.body.removeEventListener('touchstart', bodyTapUnlock);
      try { audioCtx?.close(); } catch {}
    };
  }, [previewMode, isYouTube, isDirectAudio, triggerAudioPlay]);

  // High-precision live ticker reading exact YouTube / HTML5 seconds with strictly bounded looping
  useEffect(() => {
    if (previewMode) return;

    const interval = setInterval(() => {
      const maxDuration = duration > 0 ? duration : 205;

      if (isYouTube && ytPlayerRef.current) {
        try {
          if (typeof ytPlayerRef.current.getPlayerState === 'function') {
            const st = ytPlayerRef.current.getPlayerState();
            if (st === 1 && !isPlaying) setIsPlaying(true);
            else if (st === 2 && isPlaying && isUserPausedRef.current) setIsPlaying(false);
          }

          if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const cur = ytPlayerRef.current.getCurrentTime();
            const dur = ytPlayerRef.current.getDuration();
            if (typeof dur === 'number' && dur > 0) setDuration(dur);

            if (typeof cur === 'number' && !isNaN(cur)) {
              const activeLimit = (typeof dur === 'number' && dur > 0) ? dur : maxDuration;
              if (cur >= activeLimit - 0.3) {
                ytPlayerRef.current.seekTo(0);
                ytPlayerRef.current.playVideo();
                setCurrentTime(0);
              } else {
                setCurrentTime(cur);
              }
            }
          }
        } catch {}
      } else if (isDirectAudio && audioRef.current) {
        const cur = audioRef.current.currentTime || 0;
        const dur = audioRef.current.duration;
        if (dur && !isNaN(dur)) {
          setDuration(dur);
          if (cur >= dur - 0.25) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
            setCurrentTime(0);
            return;
          }
        }
        setCurrentTime(cur);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isYouTube, isDirectAudio, previewMode, duration, isPlaying]);

  // HTML5 audio event bindings (for direct MP3 uploads)
  useEffect(() => {
    if (previewMode) return;
    const audio = audioRef.current;
    if (!audio || !isDirectAudio) return;

    const onTimeUpdate = () => {
      if (audio.currentTime) {
        const cur = audio.currentTime;
        const dur = audio.duration;
        if (dur && cur >= dur - 0.25) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          setCurrentTime(0);
        } else {
          setCurrentTime(cur);
        }
      }
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    audio.volume = isMuted ? 0 : volume;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isDirectAudio, url, previewMode, isMuted, volume]);

  // Sync volume updates
  useEffect(() => {
    if (previewMode) return;
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) audioRef.current.volume = effectiveVol;

    if (ytPlayerRef.current?.setVolume) {
      try {
        if (isMuted) ytPlayerRef.current.mute();
        else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(Math.round(volume * 100));
        }
      } catch {}
    }
  }, [volume, isMuted, previewMode]);

  const togglePlay = (e) => {
    if (e?.stopPropagation) e.stopPropagation();

    if (previewMode) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      isUserPausedRef.current = true;
      setIsPlaying(false);
      if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
      if (audioRef.current) audioRef.current.pause();
    } else {
      isUserPausedRef.current = false;
      setIsPlaying(true);
      triggerAudioPlay();
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (previewMode) return;
    if (ytPlayerRef.current?.seekTo) ytPlayerRef.current.seekTo(newTime, true);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  // Rewind / Previous button (Jump back 10s or restart)
  const handlePrev = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const target = Math.max(0, currentTime - 10);
    setCurrentTime(target);
    if (!previewMode) {
      if (ytPlayerRef.current?.seekTo) ytPlayerRef.current.seekTo(target, true);
      if (audioRef.current) audioRef.current.currentTime = target;
    }
  };

  // Fast-Forward / Next button (Jump forward 10s)
  const handleNext = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const maxDur = duration > 0 ? duration : 205;
    const target = Math.min(maxDur, currentTime + 10);
    setCurrentTime(target);
    if (!previewMode) {
      if (ytPlayerRef.current?.seekTo) ytPlayerRef.current.seekTo(target, true);
      if (audioRef.current) audioRef.current.currentTime = target;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
  };

  const toggleMute = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(0.45);
    } else {
      setIsMuted(true);
    }
  };

  if (!url) return null;

  const displayTitle = title || (isYouTube ? 'BIO SOUNDTRACK' : 'CUSTOM AUDIO');
  const displayCover = cover || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  // Strictly bounded progress bar [0, 100]%
  const effectiveDuration = duration > 0 ? duration : 205;
  const boundedCurrentTime = Math.min(effectiveDuration, Math.max(0, currentTime));
  const progressPercent = duration > 0 
    ? Math.min(100, Math.max(0, (boundedCurrentTime / duration) * 100))
    : Math.min(100, Math.max(0, (boundedCurrentTime / effectiveDuration) * 100));

  const currentVolumePercent = isMuted ? 0 : Math.round(volume * 100);

  // Card background styling based on user's cardStyle preference
  const cardBgClasses = cardStyle === 'transparent'
    ? 'bg-transparent border border-white/5 shadow-none'
    : cardStyle === 'ultra_glass'
    ? 'bg-black/15 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
    : cardStyle === 'dark'
    ? 'bg-black/85 backdrop-blur-3xl border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
    : 'bg-black/55 backdrop-blur-2xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.7)]';

  return (
    <div className="w-full max-w-[440px] z-20 font-sans select-none my-2">
      {/* Hidden audio element for direct MP3 upload */}
      {!previewMode && isDirectAudio && (
        <audio 
          ref={audioRef} 
          src={url} 
          preload="auto" 
          onLoadedMetadata={() => {
            if (audioRef.current && startSec > 0) {
              audioRef.current.currentTime = startSec;
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

      {/* 
        Standard Offscreen YouTube Player Container:
        A DIV (not an unmanaged iframe!) where YouTube Iframe API injects and binds properly,
        preventing any desync between sound playback and timeline state!
      */}
      {!previewMode && isYouTube && ytId && (
        <div 
          className="fixed -top-[9999px] -left-[9999px] w-[200px] h-[200px] opacity-[0.01] pointer-events-none overflow-hidden z-0"
          aria-hidden="true"
        >
          <div id={containerId} ref={containerRef} />
        </div>
      )}

      {/* ============================================================
          MULTI-STYLE MUSIC PLAYER RENDERING (deck, vinyl, pill, card, cyber)
          ============================================================ */}

      {/* 1. VINYL TURNTABLE STYLE */}
      {playerStyle === 'vinyl' && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-3xl p-3.5 sm:p-4 transition-all flex flex-col gap-3 relative overflow-hidden ${cardBgClasses} ${previewMode ? 'pointer-events-none select-none opacity-90' : ''}`}
        >
          <div className="flex items-center gap-3.5">
            {/* Spinning Vinyl Record Disc */}
            <div className="relative shrink-0">
              <div 
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.85)] border-2 border-neutral-700/60 p-1 flex items-center justify-center relative overflow-hidden transition-transform duration-1000 ${isPlaying ? 'animate-spin' : ''}`}
                style={{ 
                  animationDuration: '3.5s',
                  background: 'radial-gradient(circle, #262626 0%, #111111 25%, #2a2a2a 45%, #0d0d0d 65%, #202020 85%, #050505 100%)' 
                }}
              >
                {/* Concentric Grooves */}
                <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
                
                {/* Center Record Label */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-neutral-800 relative z-10 shadow-inner">
                  {displayCover ? (
                    <img src={displayCover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#ff2a44] flex items-center justify-center">
                      <Disc size={12} className="text-white" />
                    </div>
                  )}
                  {/* Spindle hole */}
                  <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-black border border-white/30" />
                </div>
              </div>

              {/* Tonearm Needle Graphic */}
              <div 
                className={`absolute -top-1 -right-1 w-6 h-8 pointer-events-none transition-transform duration-500 origin-top-right ${isPlaying ? 'rotate-12' : '-rotate-6 opacity-60'}`}
              >
                <div className="w-0.5 h-6 bg-gradient-to-b from-white/80 to-white/30 ml-auto mr-1 rounded" />
                <div className="w-2 h-2 rounded-full bg-white/70 ml-auto shadow-sm" />
              </div>
            </div>

            {/* Song Meta & Primary Controls */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/50">
                  {isPlaying ? 'VINYL SPINNING' : 'NEEDLE RESTING'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold tracking-wide truncate" style={{ color: textColor }}>
                {displayTitle}
              </h4>
              <p className="text-[11px] text-white/50 truncate font-light mb-2">
                {artist || 'Audio Track'}
              </p>

              {/* Skip & Play Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Prev 10s"
                >
                  <SkipBack size={13} />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-3 py-1 rounded-full bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause size={12} className="fill-black" /> : <Play size={12} className="fill-black translate-x-0.5" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Next 10s"
                >
                  <SkipForward size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <span className="text-[10px] font-mono text-white/50 w-7">{formatTime(boundedCurrentTime)}</span>
            <div className="relative flex-1 h-1.5 flex items-center cursor-pointer">
              <div className="absolute inset-0 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-white/90 to-white rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <input type="range" min={0} max={duration > 0 ? duration : effectiveDuration} step={0.5} value={boundedCurrentTime} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            </div>
            <span className="text-[10px] font-mono text-white/50 w-7 text-right">{duration > 0 ? formatTime(duration) : formatTime(effectiveDuration)}</span>
          </div>
        </motion.div>
      )}

      {/* 2. REDESIGNED DYNAMIC CYBER PILL STYLE */}
      {playerStyle === 'pill' && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-full p-2 pl-3 pr-3.5 transition-all flex items-center gap-3 relative border border-white/20 backdrop-blur-3xl shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] ${cardBgClasses} ${previewMode ? 'pointer-events-none select-none opacity-90' : ''}`}
        >
          {/* Mini Rotating Album Disc with Neon Accent */}
          <div 
            className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/30 shadow-[0_0_12px_rgba(0,0,0,0.7)] flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} 
            style={{ animationDuration: '4s' }}
          >
            {displayCover ? (
              <img src={displayCover} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                <Disc size={18} className="text-white" />
              </div>
            )}
            <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-black border border-white/40" />
          </div>

          {/* Title + Equalizer Waveform Bars */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide truncate max-w-[130px] sm:max-w-[170px]" style={{ color: textColor }}>
                {displayTitle}
              </span>
              {/* Animated Audio Equalizer Bars */}
              <div className="flex items-end gap-0.5 h-3.5 shrink-0">
                <span className={`w-0.5 rounded-full transition-all duration-300 ${isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-30'}`} style={{ backgroundColor: primaryColor }} />
                <span className={`w-0.5 rounded-full transition-all duration-300 ${isPlaying ? 'h-2 animate-pulse delay-75' : 'h-1 opacity-30'}`} style={{ backgroundColor: primaryColor }} />
                <span className={`w-0.5 rounded-full transition-all duration-300 ${isPlaying ? 'h-3.5 animate-pulse delay-150' : 'h-1 opacity-30'}`} style={{ backgroundColor: primaryColor }} />
                <span className={`w-0.5 rounded-full transition-all duration-300 ${isPlaying ? 'h-1.5 animate-pulse delay-100' : 'h-1 opacity-30'}`} style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/50">
              <span>{formatTime(boundedCurrentTime)}</span>
              <span>•</span>
              <span className="truncate">{artist || 'Operative'}</span>
            </div>
          </div>

          {/* Compact Glass Control Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="Previous"
            >
              <SkipBack size={13} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause size={13} className="fill-black" /> : <Play size={13} className="fill-black translate-x-0.5" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="Next"
            >
              <SkipForward size={13} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. REDESIGNED ULTRA-MODERN SHOWCASE CARD */}
      {playerStyle === 'card' && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-3xl p-4 sm:p-5 transition-all flex flex-col gap-3.5 relative overflow-hidden border border-white/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] ${cardBgClasses} ${previewMode ? 'pointer-events-none select-none opacity-90' : ''}`}
        >
          {/* Blurred Artwork Ambience in Background */}
          {displayCover && (
            <div 
              className="absolute inset-0 -z-10 bg-cover bg-center opacity-30 blur-3xl scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${displayCover})` }}
            />
          )}

          <div className="flex gap-4 items-center">
            {/* Square Album Cover with vinyl bevel and glow */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/25 shadow-[0_8px_25px_rgba(0,0,0,0.8)] bg-black group">
              {displayCover ? (
                <img src={displayCover} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-black">
                  <Music size={24} className="text-white/70" />
                </div>
              )}
              {/* Subtle glass reflection sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                  {isPlaying ? 'NOW PLAYING' : 'AUDIO PAUSED'}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold tracking-tight truncate" style={{ color: textColor }}>
                {displayTitle}
              </h4>
              <p className="text-xs text-white/60 truncate font-light mt-0.5">
                {artist || 'Operative Theme'}
              </p>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-1.5">
            <div className="relative h-1.5 bg-white/15 rounded-full overflow-hidden cursor-pointer group">
              <div 
                className="h-full rounded-full transition-all duration-150" 
                style={{ 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, #ffffff)`
                }} 
              />
              <input type="range" min={0} max={duration > 0 ? duration : effectiveDuration} step={0.5} value={boundedCurrentTime} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/50">
              <span>{formatTime(boundedCurrentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Centered Controls Row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <button type="button" onClick={toggleMute} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
              {isMuted || volume === 0 ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <SkipBack size={15} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black translate-x-0.5" />}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <SkipForward size={15} />
              </button>
            </div>

            <span className="text-[10px] font-mono text-white/40 w-8 text-right">
              {currentVolumePercent}%
            </span>
          </div>
        </motion.div>
      )}

      {/* 5. WAVEFORM STRIP STYLE — Minimal horizontal strip with animated waveform bars & full controls */}
      {playerStyle === 'wave' && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl overflow-hidden transition-all ${cardBgClasses} ${previewMode ? 'select-none opacity-90' : ''}`}
        >
          {/* Main Strip */}
          <div className="flex items-center gap-3 p-3">
            {/* Small Album Art with Hover Play/Pause Overlay */}
            <div className="relative group w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/10 shadow-lg">
              {displayCover ? (
                <img src={displayCover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                  <Music size={18} className="text-white/80" />
                </div>
              )}
              {/* Mini play/pause overlay */}
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-pointer"
                title={isPlaying ? "หยุดเพลง (Pause / Stop)" : "เล่นเพลง (Play)"}
              >
                {isPlaying ? <Pause size={16} className="text-white fill-white" /> : <Play size={16} className="text-white fill-white ml-0.5" />}
              </button>
            </div>

            {/* Song Info + Controls + Waveform */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate" style={{ color: textColor }}>{displayTitle}</h4>
                  {artist ? (
                    <p className="text-[10px] text-white/40 truncate">{artist}</p>
                  ) : (
                    <p className="text-[10px] text-white/40 truncate font-mono">
                      {isPlaying ? '▶ PLAYING' : '❚❚ PAUSED'}
                    </p>
                  )}
                </div>
                {/* Control Buttons: Prev, Play/Pause/Stop, Next, Mute */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    type="button"
                    onClick={handlePrev} 
                    className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/60 hover:text-white"
                    title="ย้อนกลับ 10 วิ"
                  >
                    <SkipBack size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 text-white"
                    style={{ backgroundColor: primaryColor }}
                    title={isPlaying ? "หยุดเพลง (Pause / Stop)" : "เล่นเพลง (Play)"}
                  >
                    {isPlaying ? <Pause size={13} className="fill-white" /> : <Play size={13} className="fill-white translate-x-0.5" />}
                  </button>
                  <button 
                    type="button"
                    onClick={handleNext} 
                    className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white/60 hover:text-white"
                    title="ข้ามไปข้างหน้า 10 วิ"
                  >
                    <SkipForward size={11} />
                  </button>
                  {/* Interactive Volume Slider & Mute Toggle */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                      title={isMuted ? "เปิดเสียง (Unmute)" : "ปิดเสียง (Mute)"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={12} className="text-red-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 size={12} />
                      ) : (
                        <Volume2 size={12} />
                      )}
                    </button>
                    <div className="relative w-12 sm:w-16 h-1 flex items-center cursor-pointer">
                      <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-75"
                          style={{ width: `${currentVolumePercent}%` }}
                        />
                      </div>
                      <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.01}
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title={`ปรับระดับเสียง: ${currentVolumePercent}%`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-white/40 w-5 text-right shrink-0">
                      {currentVolumePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated Waveform Bars with Interactive Click-to-Seek & Strict Integer Percentages (No Float Hydration Bug) */}
              <div className="relative group/wave flex items-end gap-[2px] h-5 w-full cursor-pointer">
                {[
                  30, 45, 25, 60, 75, 50, 85, 65, 40, 70, 90, 60, 35, 55, 80, 95,
                  85, 60, 45, 75, 90, 70, 50, 65, 45, 35, 60, 75, 60, 40, 30, 20
                ].map((staticH, i) => {
                  const barProgress = (i / 32) * 100;
                  const isPast = barProgress <= progressPercent;
                  const randomHeight = 20 + Math.sin(i * 0.8 + (isPlaying ? currentTime * 2 : 0)) * 40 + Math.cos(i * 1.3) * 30;
                  const clampedHeight = Math.max(15, Math.min(100, Math.round(randomHeight)));
                  const barHeight = isPlaying ? clampedHeight : staticH;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 pointer-events-none ${isPast ? 'opacity-100' : 'opacity-40'}`}
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: isPast ? primaryColor : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  );
                })}
                <input 
                  type="range" 
                  min={0} 
                  max={duration > 0 ? duration : effectiveDuration} 
                  step={0.5} 
                  value={boundedCurrentTime} 
                  onChange={handleSeek} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  title="คลิกเพื่อเลื่อนช่วงเวลาเพลง"
                />
              </div>

              {/* Time display */}
              <div className="flex justify-between">
                <span className="text-[9px] font-mono text-white/40">{formatTime(boundedCurrentTime)}</span>
                <span className="text-[9px] font-mono text-white/40">{formatTime(effectiveDuration)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 1. CLASSIC STUDIO DECK STYLE (Original Style 1 - Kept 100% intact as requested) */}
      {(playerStyle === 'deck' || !playerStyle || (!['vinyl', 'pill', 'card', 'wave'].includes(playerStyle))) && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl p-2.5 sm:p-3 transition-all flex flex-col gap-2 ${cardBgClasses} ${previewMode ? 'pointer-events-none select-none opacity-90' : ''}`}
        >
          {/* Top: Album Art + Song Info + BOTH Skip Buttons & Play Button */}
          <div className="flex items-center gap-3">
            {/* Square Album Cover with vinyl glow */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/10 shadow-md">
              {displayCover ? (
                <img 
                  src={displayCover} 
                  alt={displayTitle} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-black">
                  <Disc size={20} className={`text-white/60 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                </div>
              )}
            </div>

            {/* Center Title & Artist */}
            <div className="flex-1 min-w-0 text-left">
              <h4 
                className="text-xs sm:text-sm font-bold tracking-wide truncate"
                style={{ color: textColor }}
              >
                {displayTitle}
              </h4>
              {artist ? (
                <p className="text-[10px] sm:text-[11px] text-white/50 truncate font-light">
                  {artist}
                </p>
              ) : (
                <p className="text-[10px] text-white/50 truncate font-mono">
                  {isPlaying ? '▶ PLAYING' : '❚❚ PAUSED'}
                </p>
              )}
            </div>

            {/* Symmetrical Skip Buttons & Primary Play/Pause Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="bio-player-control-btn w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                title="ย้อนกลับ 10 วินาที / เริ่มใหม่"
              >
                <SkipBack size={14} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="bio-player-control-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all cursor-pointer"
                title={isPlaying ? "Pause / หยุด" : "Play / เล่น"}
              >
                {isPlaying ? (
                  <Pause size={14} className="fill-black" />
                ) : (
                  <Play size={14} className="fill-black translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="bio-player-control-btn w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                title="ข้ามไปข้างหน้า 10 วินาที"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>

          {/* Timeline Scrubber Bar with LIVE accurate seconds and bounded fill */}
          <div className="flex items-center gap-2 px-0.5">
            <span className="text-[10px] font-mono text-white/60 shrink-0 w-8">
              {formatTime(boundedCurrentTime)}
            </span>

            <div className="relative flex-1 h-1.5 flex items-center group cursor-pointer">
              <div className="absolute inset-0 bg-white/15 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-white/90 to-white rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input 
                type="range" 
                min={0} 
                max={duration > 0 ? duration : effectiveDuration} 
                step={0.5}
                value={boundedCurrentTime} 
                onChange={handleSeek} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            <span className="text-[10px] font-mono text-white/60 shrink-0 w-8 text-right">
              {duration > 0 ? formatTime(duration) : formatTime(effectiveDuration)}
            </span>
          </div>

          {/* Bottom Row: Volume Slider Control */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10 px-1">
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <button
                type="button"
                onClick={toggleMute}
                className="bio-player-control-btn text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={13} className="text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 size={13} />
                ) : (
                  <Volume2 size={13} />
                )}
              </button>

              <div className="relative flex-1 h-1 flex items-center group cursor-pointer">
                <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${currentVolumePercent}%` }}
                  />
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={1} 
                  step={0.01}
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title={`Volume: ${currentVolumePercent}%`}
                />
              </div>

              <span className="text-[10px] font-mono text-white/50 w-7 text-right shrink-0">
                {currentVolumePercent}%
              </span>
            </div>

            <div className="flex items-center gap-1 text-white/30">
              <Music size={11} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
