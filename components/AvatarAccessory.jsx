'use client';

export default function AvatarAccessory({ accessory = 'ice_horns', primaryColor = '#ff2a44' }) {
  if (!accessory || accessory === 'none') return null;

  // 1. Frost Ice Antlers / Horns (Matching the ethereal cyan glowing horns in reference image!)
  if (accessory === 'ice_horns') {
    return (
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none z-30 flex justify-between px-0.5 filter drop-shadow-[0_0_14px_rgba(56,189,248,0.95)]">
        {/* Left Antler with luminous multi-branch ice crystal */}
        <svg viewBox="0 0 100 80" className="w-14 h-14 overflow-visible -rotate-6">
          <defs>
            <linearGradient id="iceGradLeft" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <filter id="iceGlowLeft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 65 78 C 58 60 48 42 32 30 C 22 22 10 24 5 18 C 3 15 6 12 12 14 C 24 18 36 28 44 38 C 42 26 34 16 28 8 C 26 5 28 2 32 3 C 38 6 46 18 50 30 C 53 20 54 10 56 2 C 57 0 60 0 62 3 C 63 12 62 26 62 42 C 67 48 78 58 84 66 C 86 68 83 72 80 70 C 74 65 67 58 64 52 Z"
            fill="url(#iceGradLeft)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
            filter="url(#iceGlowLeft)"
          />
          {/* Sparkle Glint on main tip */}
          <circle cx="56" cy="3" r="2.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="28" cy="8" r="1.8" fill="#ffffff" />
        </svg>

        {/* Right Antler (Mirrored) */}
        <svg viewBox="0 0 100 80" className="w-14 h-14 overflow-visible rotate-6 scale-x-[-1]">
          <defs>
            <linearGradient id="iceGradRight" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M 65 78 C 58 60 48 42 32 30 C 22 22 10 24 5 18 C 3 15 6 12 12 14 C 24 18 36 28 44 38 C 42 26 34 16 28 8 C 26 5 28 2 32 3 C 38 6 46 18 50 30 C 53 20 54 10 56 2 C 57 0 60 0 62 3 C 63 12 62 26 62 42 C 67 48 78 58 84 66 C 86 68 83 72 80 70 C 74 65 67 58 64 52 Z"
            fill="url(#iceGradRight)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="56" cy="3" r="2.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />
          <circle cx="28" cy="8" r="1.8" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // 2. Cyber Demon Horns (Crimson neon sharp horns)
  if (accessory === 'demon_horns') {
    return (
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-28 h-14 pointer-events-none z-30 flex justify-between px-2 filter drop-shadow-[0_0_14px_rgba(255,42,68,0.9)]">
        <svg viewBox="0 0 50 60" className="w-10 h-12 -rotate-12">
          <defs>
            <linearGradient id="demonLeft" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#50000e" />
              <stop offset="60%" stopColor="#ff2a44" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <path d="M 40 55 C 36 30 24 12 4 4 C 18 16 24 35 28 55 Z" fill="url(#demonLeft)" stroke="#ff4d6d" strokeWidth="1" />
          <circle cx="4" cy="4" r="1.8" fill="#ffffff" />
        </svg>
        <svg viewBox="0 0 50 60" className="w-10 h-12 rotate-12 scale-x-[-1]">
          <defs>
            <linearGradient id="demonRight" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#50000e" />
              <stop offset="60%" stopColor="#ff2a44" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <path d="M 40 55 C 36 30 24 12 4 4 C 18 16 24 35 28 55 Z" fill="url(#demonRight)" stroke="#ff4d6d" strokeWidth="1" />
          <circle cx="4" cy="4" r="1.8" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // 3. Luminous Angel Halo
  if (accessory === 'angel_halo') {
    return (
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-24 h-7 pointer-events-none z-30 flex items-center justify-center">
        <div className="w-full h-full rounded-[100%] border-[3px] border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.95),inset_0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
      </div>
    );
  }

  // 4. Monarch Royal Crown
  if (accessory === 'king_crown') {
    return (
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30 filter drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]">
        <svg viewBox="0 0 64 45" className="w-14 h-10">
          <defs>
            <linearGradient id="crownGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <polygon points="6,40 12,14 24,26 32,6 40,26 52,14 58,40" fill="url(#crownGrad)" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="12" cy="14" r="3" fill="#ffffff" />
          <circle cx="32" cy="6" r="3.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="52" cy="14" r="3" fill="#ffffff" />
          <rect x="6" y="38" width="52" height="5" rx="2" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // 5. Ethereal Glowing Butterfly
  if (accessory === 'butterfly') {
    return (
      <div className="absolute -top-5 -right-2 pointer-events-none z-30 filter drop-shadow-[0_0_12px_rgba(236,72,153,0.9)] animate-bounce" style={{ animationDuration: '3s' }}>
        <svg viewBox="0 0 40 40" className="w-10 h-10 rotate-12">
          <path d="M 20 20 C 12 5 0 8 5 22 C 10 28 18 22 20 20 Z" fill="#f472b6" opacity="0.85" />
          <path d="M 20 20 C 28 5 40 8 35 22 C 30 28 22 22 20 20 Z" fill="#ec4899" opacity="0.9" />
          <path d="M 20 20 C 14 26 8 34 14 36 C 18 36 19 26 20 20 Z" fill="#bae6fd" opacity="0.8" />
          <path d="M 20 20 C 26 26 32 34 26 36 C 22 36 21 26 20 20 Z" fill="#38bdf8" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // 6. Cyber Neko Ears (Anime cat ears)
  if (accessory === 'cat_ears') {
    return (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-26 h-10 pointer-events-none z-30 flex justify-between px-1 filter drop-shadow-[0_0_12px_rgba(244,114,182,0.85)]">
        <div className="w-7 h-8 bg-gradient-to-tr from-black via-pink-600 to-pink-300 rounded-tl-2xl rotate-[-22deg] border border-pink-300/80 p-1 flex items-center justify-center">
          <div className="w-3 h-4 bg-pink-200/90 rounded-tl-lg" />
        </div>
        <div className="w-7 h-8 bg-gradient-to-tl from-black via-pink-600 to-pink-300 rounded-tr-2xl rotate-[22deg] border border-pink-300/80 p-1 flex items-center justify-center">
          <div className="w-3 h-4 bg-pink-200/90 rounded-tr-lg" />
        </div>
      </div>
    );
  }

  return null;
}
