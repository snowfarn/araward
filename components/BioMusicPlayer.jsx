'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  Disc 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BioMusicPlayer({ 
  url, 
  title, 
  artist, 
  cover, 
  primaryColor = '#ff2a44',
  textColor = '#ffffff',
  cardStyle = 'glass',
  previewMode = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.45);
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

  // Safe Play Dispatcher
  const triggerAudioPlay = useCallback(() => {
    if (previewMode || isUserPausedRef.current) return;

    if (isYouTube && ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.unMute === 'function') ytPlayerRef.current.unMute();
        if (typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(isMuted ? 0 : Math.round(volume * 100));
        }
        if (typeof ytPlayerRef.current.playVideo === 'function') {
          ytPlayerRef.current.playVideo();
        }
      } catch {}
    }

    if (isDirectAudio && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
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
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event) => {
              if (destroyed) return;
              ytPlayerRef.current = event.target;
              const dur = event.target.getDuration();
              if (typeof dur === 'number' && dur > 0) setDuration(dur);
              event.target.setVolume(isMuted ? 0 : Math.round(volume * 100));

              if (!isUserPausedRef.current || hasUserInteractedRef.current) {
                event.target.unMute();
                event.target.playVideo();
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
                // Loop cleanly back to 0:00 without overflowing
                event.target.seekTo(0);
                event.target.playVideo();
                setCurrentTime(0);
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

  // Global user interaction listener (Click/Tap anywhere on page immediately unlocks audio!)
  useEffect(() => {
    if (previewMode || (!isYouTube && !isDirectAudio)) return;

    // Retry initial play in case browser allowed autoplay
    const initialTimer = setTimeout(() => {
      triggerAudioPlay();
    }, 500);

    const retryTimer = setTimeout(() => {
      triggerAudioPlay();
    }, 1500);

    const handleGesture = (e) => {
      hasUserInteractedRef.current = true;
      if (isUserPausedRef.current) return;
      if (e?.target?.closest?.('.bio-player-control-btn')) return;
      triggerAudioPlay();
    };

    const gestureEvents = [
      'pointerdown',
      'touchstart',
      'mousedown',
      'click',
      'keydown',
      'scroll',
      'wheel',
      'touchmove'
    ];

    gestureEvents.forEach(evt => {
      window.addEventListener(evt, handleGesture, { passive: true });
    });

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(retryTimer);
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, handleGesture);
      });
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
        <audio ref={audioRef} src={url} loop preload="auto" />
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

      {/* Sleek Integrated Glassmorphic Audio Deck */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl p-2.5 sm:p-3 transition-all flex flex-col gap-2 ${cardBgClasses}`}
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
            {/* Skip Back (10s) */}
            <button
              type="button"
              onClick={handlePrev}
              className="bio-player-control-btn w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="ย้อนกลับ 10 วินาที / เริ่มใหม่"
            >
              <SkipBack size={14} />
            </button>

            {/* Main Play / Pause */}
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

            {/* Skip Forward (10s) */}
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
          {/* Left: Volume Section */}
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

            {/* Volume Range Slider */}
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

          {/* Right: Sound tag */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 tracking-wider">
            <Music size={10} />
            <span>SOUNDTRACK</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
