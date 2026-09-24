'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import {
  LogOut,
  Home,
  Send,
  Save,
  Palette,
  Link as LinkIcon,
  Music,
  CheckCircle2,
  Shield,
  Sparkles,
  Upload,
  Eye,
  ExternalLink,
  Copy,
  AlertCircle,
  Gamepad2,
  Disc,
  User,
  Check,
  RefreshCw
} from "lucide-react";
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyToGang, updateMemberBio, checkSlug } from '@/lib/actions';
import { useLanguage } from '@/context/LanguageContext';
import DiscordWidget from '@/components/DiscordWidget';
import RobloxWidget from '@/components/RobloxWidget';
import BioMusicPlayer from '@/components/BioMusicPlayer';
import { SocialBrandButton } from '@/components/BrandIcons';

const PARTICLE_OPTIONS = [
  { id: 'none', label: 'None / ปิด', desc: 'ไม่ใช้เอฟเฟกต์อนุภาค' },
  { id: 'snow', label: '❄️ Snow / หิมะตก', desc: 'เกล็ดหิมะคริสตัลนุ่มนวล' },
  { id: 'sakura', label: '🌸 Sakura / ซากุระร่วง', desc: 'กลีบซากุระปลิวไสว' },
  { id: 'rain', label: '🌧️ Cyber Rain / ฝนไซเบอร์', desc: 'เส้นฝนแสงนีออนตกเฉียง' },
  { id: 'embers', label: '🔥 Embers / สะเก็ดไฟ', desc: 'ประกายไฟลอยขึ้นสู่อากาศ' },
  { id: 'stars', label: '⭐ Stars / ดวงดาว', desc: 'ดวงดาวระยิบระยับในอวกาศ' },
  { id: 'sparkles', label: '✨ Sparkles / ประกายเพชร', desc: 'ประกายแสงวิบวับมีชีวิตชีวา' },
  { id: 'cyber_dust', label: '🔮 Cyber Dust / ละอองไซเบอร์', desc: 'ละอองพลังงานเรืองแสง' },
];

const CURSOR_OPTIONS = [
  { id: 'none', label: 'None / ปกติ', desc: 'เคอร์เซอร์เมาส์ปกติ' },
  { id: 'sparkle_trail', label: '✨ Sparkle Trail / ประกายดาว', desc: 'ดาวประกายระยิบระยับตามเมาส์' },
  { id: 'neon_dot', label: '⭕ Neon Ring / วงแหวนนีออน', desc: 'วงแหวนเรืองแสงลอยตามเมาส์' },
  { id: 'fire_ember', label: '🔥 Fire Ember / สะเก็ดไฟ', desc: 'สะเก็ดไฟลอยตามการลากเมาส์' },
  { id: 'ghost_blur', label: '👻 Ghost Glow / เงาตามเมาส์', desc: 'เงาเรืองแสงตามความเร็วเมาส์' },
  { id: 'sakura_trail', label: '🌸 Sakura Trail / กลีบซากุระ', desc: 'กลีบดอกไม้ปลิวตามเคอร์เซอร์' },
];

const THEME_COLOR_PRESETS = [
  { label: '🔥 แดงเลือดหมู (Blood Red)', color: '#ff2a44' },
  { label: '⚡ แดงเข้ม (Crimson)', color: '#dc2626' },
  { label: '🔵 น้ำเงินไซเบอร์ (Cyber Blue)', color: '#3b82f6' },
  { label: '🟣 ม่วงนีออน (Neon Violet)', color: '#a855f7' },
  { label: '🟢 เขียวมรกต (Toxic Emerald)', color: '#10b981' },
  { label: '🟡 ทองพรีเมียม (Gold)', color: '#f59e0b' },
  { label: '🌸 ชมพูซากุระ (Sakura Pink)', color: '#ec4899' },
  { label: '🩵 ฟ้าสว่าง (Cyan Glow)', color: '#06b6d4' },
  { label: '🤍 ขาวออร่า (White Aura)', color: '#ffffff' },
];

const PARTICLE_COLOR_PRESETS = [
  { label: '❄️ ขาวหิมะ', color: '#ffffff' },
  { label: '🧊 ฟ้าไอซ์', color: '#38bdf8' },
  { label: '🌸 ชมพูซากุระ', color: '#f472b6' },
  { label: '🔥 แดงเพลิง', color: '#ff2a44' },
  { label: '⚡ ทองอวกาศ', color: '#fbbf24' },
  { label: '💜 ม่วงนีออน', color: '#c084fc' },
  { label: '🟢 เขียวมรกต', color: '#34d399' },
];

const FONT_COLOR_PRESETS = [
  { label: '🤍 ขาวสว่าง', color: '#ffffff' },
  { label: '🧊 ฟ้าไอซ์', color: '#bae6fd' },
  { label: '🌸 ชมพูซากุระ', color: '#fbcfe8' },
  { label: '⚡ ทองประกาย', color: '#fef08a' },
  { label: '🟢 เขียวนีออน', color: '#a7f3d0' },
  { label: '💜 ม่วงนีออน', color: '#e9d5ff' },
  { label: '🩶 เทาควัน', color: '#d4d4d8' },
];

const CARD_STYLE_OPTIONS = [
  { id: 'transparent', label: '🫥 ใสไร้กรอบ (Transparent)', desc: 'กล่องใสไม่มีพื้นหลังทึบ สบายตา' },
  { id: 'ultra_glass', label: '🧊 กระจกใสบาง (Ultra Clear)', desc: 'กระจกใสบางเฉียบ โปร่งแสง 15%' },
  { id: 'glass', label: '💎 กระจกฝ้า (Frosted Glass)', desc: 'กระจกฝ้ามาตรฐาน สวยงามหรูหรา 45%' },
  { id: 'dark', label: '🖤 กระจกทึบมืด (Dark Obsidian)', desc: 'กระจกมืดทึบ ชัดเจน ตัดขอบ 80%' },
];

export default function ClientDashboard({ initialStatus, initialMemberData }) {
  const { data: session, status } = useSession();
  const { t, lang } = useLanguage();
  const [memberStatus, setMemberStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Consolidated 3 intuitive tabs: profile (profile + widgets + socials), appearance (avatar + bg + theme + particles), music
  const [activeTab, setActiveTab] = useState('profile');
  const [copiedLink, setCopiedLink] = useState(false);
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: true, message: '' });
  const [showLivePreview, setShowLivePreview] = useState(false);

  // File uploading flags
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isSyncingDiscord, setIsSyncingDiscord] = useState(false);
  const [syncedDiscordInfo, setSyncedDiscordInfo] = useState(null);

  const [bioData, setBioData] = useState(() => {
    return {
      name: initialMemberData?.name || '',
      slug: initialMemberData?.slug || initialMemberData?.name?.toLowerCase().replace(/[^a-z0-9_-]/g, '') || '',
      avatar: initialMemberData?.avatar || '',
      bio: initialMemberData?.bio || '',
      particleType: initialMemberData?.particleType || 'snow',
      particleColor: initialMemberData?.particleColor || '#ffffff',
      cursorEffect: initialMemberData?.cursorEffect || 'sparkle_trail',
      primaryColor: initialMemberData?.primaryColor || '#ff2a44',
      textColor: initialMemberData?.textColor || '#ffffff',
      cardStyle: initialMemberData?.cardStyle || 'glass',
      backgroundUrl: initialMemberData?.backgroundUrl || '',
      musicUrl: initialMemberData?.musicUrl || '',
      musicTitle: initialMemberData?.musicTitle || '',
      musicArtist: initialMemberData?.musicArtist || '',
      musicCover: initialMemberData?.musicCover || '',
      discordId: initialMemberData?.discordId || initialMemberData?.id || '',
      discordUsername: initialMemberData?.discordUsername || initialMemberData?.name || '',
      discordStatusText: initialMemberData?.discordStatusText || '',
      discordBadge: initialMemberData?.discordBadge || 'NOPE',
      robloxUsername: initialMemberData?.robloxUsername || '',
      robloxUserId: initialMemberData?.robloxUserId || '',
      socials: {
        roblox: initialMemberData?.socials?.roblox || (initialMemberData?.robloxUsername || ''),
        instagram: initialMemberData?.socials?.instagram || '',
        youtube: initialMemberData?.socials?.youtube || '',
        tiktok: initialMemberData?.socials?.tiktok || '',
        facebook: initialMemberData?.socials?.facebook || '',
        twitch: initialMemberData?.socials?.twitch || '',
        spotify: initialMemberData?.socials?.spotify || '',
        steam: initialMemberData?.socials?.steam || '',
      },
      views: initialMemberData?.views || 1
    };
  });

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper file uploader
  const handleFileUpload = async (file, onDone, setUploadingState) => {
    if (!file) return;
    setUploadingState(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onDone(data.url);
        showToast(lang === 'th' ? 'อัปโหลดไฟล์สำเร็จแล้ว' : 'File uploaded successfully');
      } else {
        showToast(data.error || 'Upload failed', true);
      }
    } catch (err) {
      showToast('Upload error', true);
    } finally {
      setUploadingState(false);
    }
  };

  // 1-Click Discord Auto-Sync from active session & Discord Gateway/Guilds API
  const handleSyncDiscordAccount = async () => {
    const targetUserId = session?.user?.id || bioData.discordId || '1471173112409096269';
    setIsSyncingDiscord(true);
    try {
      const res = await fetch('/api/discord/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setSyncedDiscordInfo(d);
        const updatedBio = {
          ...bioData,
          discordId: d.discordId || bioData.discordId,
          discordUsername: d.username || bioData.discordUsername,
          discordStatusText: d.note || d.statusText || bioData.discordStatusText || '',
          discordBadge: d.badge || bioData.discordBadge || '25ms',
          avatar: d.avatar || bioData.avatar || session?.user?.image,
          name: bioData.name || d.displayName || session?.user?.name,
        };
        setBioData(updatedBio);

        // Auto-persist immediately so /bio changes in real-time!
        const memberIdToSave = session?.user?.id || targetUserId;
        if (memberIdToSave) {
          await updateMemberBio(memberIdToSave, {
            ...updatedBio,
            robloxUsername: updatedBio.robloxUsername || (updatedBio.socials?.roblox && !updatedBio.socials.roblox.includes('http') ? updatedBio.socials.roblox : '')
          });
        }

        showToast(lang === 'th'
          ? `✓ ซิงค์และบันทึกอัปเดตหน้า Bio สำเร็จ: @${d.username} [${d.badge || '25ms'}]`
          : `✓ Synced and saved to Bio: @${d.username}`);
      } else {
        setBioData(prev => ({
          ...prev,
          discordId: session?.user?.id || prev.discordId,
          discordUsername: session?.user?.name || prev.discordUsername,
          avatar: prev.avatar || session?.user?.image,
        }));
        showToast(lang === 'th' ? 'ซิงค์ข้อมูลพื้นฐานจากเซสชัน Discord เรียบร้อย' : 'Synced basic Discord profile');
      }
    } catch (e) {
      console.error('Discord sync error:', e);
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ Discord' : 'Failed to sync Discord', true);
    } finally {
      setIsSyncingDiscord(false);
    }
  };

  // Validate custom slug availability on change
  const handleSlugChange = async (newSlug) => {
    const clean = newSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    setBioData(prev => ({ ...prev, slug: clean }));

    if (!clean) {
      setSlugStatus({ checking: false, available: true, message: '' });
      return;
    }

    setSlugStatus({ checking: true, available: true, message: 'Checking...' });
    try {
      const res = await checkSlug(session?.user?.id, clean);
      if (res.available) {
        setSlugStatus({ checking: false, available: true, message: '✓ ที่อยู่นี้ใช้งานได้' });
      } else {
        setSlugStatus({ checking: false, available: false, message: '✗ มีผู้ใช้งานที่อยู่นี้แล้ว' });
      }
    } catch {
      setSlugStatus({ checking: false, available: true, message: '' });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#030306] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-[#ff2a44] border-white/10 rounded-full animate-spin" />
          <span className="text-white/60 text-xs font-semibold tracking-widest uppercase font-mono">LOADING...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#030306] flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,68,0.12),transparent_60%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] max-w-md w-full text-center relative z-10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(255,42,68,0.15)]"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(88,101,242,0.3)]">
            <Shield size={30} className="text-[#5865F2]" />
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl text-white mb-2 tracking-tight">
            {lang === 'th' ? 'เข้าสู่ระบบสมาชิก' : 'MEMBER LOGIN'}
          </h1>
          <p className="text-white/50 mb-8 text-xs sm:text-sm font-light">
            {lang === 'th' ? 'เชื่อมต่อบัญชี Discord เพื่อตั้งค่าโปรไฟล์และตกแต่งหน้า Bio ส่วนตัว' : 'Connect with Discord to customize your personal bio link.'}
          </p>

          <button
            onClick={() => signIn('discord')}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_25px_rgba(88,101,242,0.35)] hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide cursor-pointer"
          >
            Connect Discord
          </button>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-semibold tracking-wider"
            >
              <Home size={14} />
              <span>{t.nav?.home || 'Back to Home'}</span>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const handleApply = async () => {
    setIsSubmitting(true);
    await applyToGang({
      id: session.user.id,
      name: session.user.name,
      avatar: session.user.image,
    });
    setMemberStatus('pending');
    setIsSubmitting(false);
    showToast(lang === 'th' ? 'ส่งใบสมัครเรียบร้อยแล้ว' : 'Application submitted');
  };

  const handleSaveBio = async () => {
    if (!slugStatus.available) {
      showToast(lang === 'th' ? 'ที่อยู่ URL ซ้ำ กรุณาเปลี่ยนชื่อใหม่' : 'Slug already taken, please change', true);
      return;
    }

    setIsSubmitting(true);
    // Keep robloxUsername synced with socials.roblox
    const payload = {
      ...bioData,
      robloxUsername: bioData.robloxUsername || (bioData.socials?.roblox && !bioData.socials.roblox.includes('http') ? bioData.socials.roblox : '')
    };
    const result = await updateMemberBio(session.user.id, payload);
    setIsSubmitting(false);

    if (result.success) {
      showToast(lang === 'th' ? 'บันทึกการตั้งค่าหน้า Bio สำเร็จแล้ว' : 'Profile updated successfully');
    } else {
      showToast(result.message || 'Error saving changes', true);
    }
  };

  const effectiveBioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/bio/${bioData.slug || session.user.id}`
    : `/bio/${bioData.slug || session.user.id}`;

  const copyBioLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(effectiveBioUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast(lang === 'th' ? 'คัดลอกลิงก์ Bio แล้ว!' : 'Copied Bio link!');
    }
  };

  // Preview social links (excluding roblox and discord if rendered as full widgets)
  const previewContacts = [];
  if (bioData.socials) {
    for (const [k, v] of Object.entries(bioData.socials)) {
      if (v && k !== 'roblox' && k !== 'discord') {
        previewContacts.push({ platform: k, url: v });
      }
    }
  }

  const effectiveRoblox = bioData.robloxUsername ||
    (bioData.socials?.roblox && !bioData.socials.roblox.includes('http') ? bioData.socials.roblox : bioData.socials?.roblox);

  return (
    <main className="min-h-screen bg-[#030306] text-white p-3 sm:p-8 pb-28 relative font-sans select-none">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,42,68,0.06),transparent_70%)] pointer-events-none -z-10" />

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl backdrop-blur-2xl shadow-2xl text-xs sm:text-sm font-medium border ${toastMessage.isError
              ? 'bg-red-950/90 border-red-500/50 text-red-300'
              : 'bg-[#0f1711]/90 border-green-500/40 text-green-300'
              }`}
          >
            {toastMessage.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="flex justify-between items-center bg-black/50 border border-white/10 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 max-w-5xl mx-auto mb-6 backdrop-blur-2xl shadow-xl relative z-10">
        <div className="flex items-center gap-3">
          <img
            src={bioData.avatar || session.user.image}
            alt={bioData.name || session.user.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 object-cover"
          />
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[140px] sm:max-w-none">
              {bioData.name || session.user.name}
            </span>
            <span className="text-[10px] text-white/50 font-mono tracking-wider">
              {memberStatus === 'member' ? 'SYNDICATE MEMBER' : 'APPLICANT'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {memberStatus === 'member' && (
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold flex items-center gap-1.5 text-white transition-all cursor-pointer"
            >
              <Eye size={13} className="text-[#ff2a44]" />
              <span className="hidden sm:inline">{showLivePreview ? 'wait fix' : 'wait fix'}</span>
              <span className="sm:hidden">ตัวอย่าง</span>
            </button>
          )}

          <Link href="/" className="px-3 sm:px-4 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-xs font-semibold transition-all">
            {t.nav?.home || 'Home'}
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-full text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{t.adminDash?.logout || 'Logout'}</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto relative z-10">

        {/* NON-MEMBER (APPLY) */}
        {!memberStatus && (
          <div className="bg-black/40 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 text-center backdrop-blur-3xl shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#ff2a44]/15 border border-[#ff2a44]/30 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={28} className="text-[#ff2a44]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
              {lang === 'th' ? 'สมัครเข้าร่วมแก๊ง' : 'APPLY FOR SYNDICATE'}
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto text-xs sm:text-sm font-light">
              {lang === 'th' ? 'ส่งประวัติ Discord ของคุณให้ผู้ดูแลระบบตรวจสอบ เพื่อเข้าเป็นสมาชิกและปลดล็อกการสร้างหน้า Bio' : 'Submit your Discord credentials for review to unlock your personal syndicate bio.'}
            </p>
            <button
              disabled={isSubmitting}
              onClick={handleApply}
              className="bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] hover:from-[#ff3b53] hover:to-[#ff2a44] text-white px-8 py-4 rounded-2xl font-bold tracking-wide shadow-[0_10px_30px_rgba(255,42,68,0.4)] disabled:opacity-50 inline-flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm"
            >
              <Send size={16} />
              <span>{isSubmitting ? '...' : (lang === 'th' ? 'ส่งใบสมัคร' : 'SUBMIT APPLICATION')}</span>
            </button>
          </div>
        )}

        {/* PENDING APPROVAL */}
        {memberStatus === 'pending' && (
          <div className="bg-black/40 border border-[#ff2a44]/30 rounded-[2.5rem] p-8 sm:p-12 text-center backdrop-blur-3xl shadow-[0_0_35px_rgba(255,42,68,0.15)]">
            <div className="w-16 h-16 mx-auto border-4 border-t-[#ff2a44] border-r-[#ff2a44] border-b-white/10 border-l-white/10 rounded-full animate-spin mb-6" />
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight text-[#ff2a44]">
              {lang === 'th' ? 'กำลังรอการตรวจสอบ' : 'APPLICATION UNDER REVIEW'}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto font-light">
              {lang === 'th' ? 'ใบสมัครของคุณถูกส่งถึงผู้ดูแลเรียบร้อยแล้ว โปรดรอการอนุมัติยศสมาชิก' : 'Your application is awaiting approval by syndicate leaders.'}
            </p>
          </div>
        )}

        {/* BANNED ACCOUNT */}
        {memberStatus === 'banned' && (
          <div className="bg-black/50 border border-red-500/40 rounded-[2.5rem] p-8 sm:p-12 text-center backdrop-blur-3xl shadow-[0_0_40px_rgba(255,42,68,0.3)] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(255,42,68,0.5)]">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-red-400">
              {lang === 'th' ? 'บัญชีของคุณถูกระงับการใช้งาน (BANNED)' : 'ACCOUNT SUSPENDED'}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm max-w-md mx-auto font-light leading-relaxed">
              {lang === 'th' 
                ? 'บัญชีของคุณถูกระงับการใช้งานโดยผู้ดูแลระบบ ไม่สามารถแก้ไขข้อมูลส่วนตัว หรือเปิดใช้งานหน้า Bio ได้ในขณะนี้ หากคิดว่าเป็นข้อผิดพลาดโปรดติดต่อแอดมินแก๊ง' 
                : 'Your account has been banned by the administrator. Profile editing and public bio access are disabled.'}
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono font-bold tracking-wider">
                STATUS: BANNED / RESTRICTED
              </span>
            </div>
          </div>
        )}

        {/* FULL MEMBER SETTINGS */}
        {memberStatus === 'member' && (
          <div className="space-y-6">

            {/* Quick URL Bar */}
            <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-black/80 via-[#14060c]/90 to-black/80 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-[#ff2a44]/20 border border-[#ff2a44]/40 flex items-center justify-center shrink-0">
                  <LinkIcon size={18} className="text-[#ff2a44]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white/50 uppercase tracking-widest font-mono">
                    YOUR PERSONAL BIO URL
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                    {effectiveBioUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={copyBioLink}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {copiedLink ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'COPIED!' : 'COPY LINK'}</span>
                </button>

                <a
                  href={`/bio/${bioData.slug || session.user.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#ff2a44] hover:bg-[#ff3b53] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,42,68,0.4)] hover:scale-105 active:scale-95"
                >
                  <ExternalLink size={14} />
                  <span>OPEN BIO</span>
                </a>
              </div>
            </div>

            {/* CONSOLIDATED 3 INTUITIVE TABS ("ระบบไหนรวมหน้ากันได้รวมแต่ต้องใช้ง่ายไม่งง") */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'profile', label: '1. โปรไฟล์ & วิดเจ็ตเชื่อมต่อ', icon: User },
                { id: 'appearance', label: '2. ธีม & บรรยากาศ (Theme & FX)', icon: Sparkles },
                { id: 'music', label: '3. เพลงประจำตัว (Soundtrack)', icon: Music },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${active
                      ? 'bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] text-white border-transparent shadow-[0_0_20px_rgba(255,42,68,0.35)]'
                      : 'bg-black/40 text-white/60 hover:text-white hover:bg-white/10 border-white/10'
                      }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SETTINGS CARD BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left 2 Columns: Active Tab Form */}
              <div className="lg:col-span-2 bg-black/45 border border-white/10 rounded-[2.5rem] p-5 sm:p-8 backdrop-blur-3xl shadow-2xl">

                {/* ========================================================
                    TAB 1: PROFILE & CONNECTED WIDGETS
                    ======================================================== */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <User size={18} className="text-[#ff2a44]" />
                        <span>ข้อมูลส่วนตัว & การเชื่อมต่อวิดเจ็ต</span>
                      </h3>
                      <p className="text-xs text-white/50 font-light">
                        ตั้งค่าชื่อ ที่อยู่ URL และเชื่อมต่อโปรไฟล์ Discord / Roblox / Socials ให้แสดงเป็นการ์ด Widget สวยงาม
                      </p>
                    </div>

                    {/* URL Slug */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider font-mono">
                        CUSTOM BIO SLUG (ที่อยู่ URL ส่วนตัว)
                      </label>
                      <div className="flex items-center gap-2 bg-black/60 border border-white/15 focus-within:border-[#ff2a44] rounded-xl px-3 py-2.5 transition-colors">
                        <span className="text-white/40 text-xs font-mono">/bio/</span>
                        <input
                          type="text"
                          value={bioData.slug}
                          onChange={e => handleSlugChange(e.target.value)}
                          placeholder="your-custom-name"
                          className="flex-1 bg-transparent text-sm text-white font-mono outline-none"
                        />
                      </div>
                      {slugStatus.message && (
                        <p className={`text-xs font-mono mt-1 ${slugStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                          {slugStatus.message}
                        </p>
                      )}
                    </div>

                    {/* Display Name */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        ชื่อที่แสดง (DISPLAY NAME)
                      </label>
                      <input
                        type="text"
                        value={bioData.name}
                        onChange={e => setBioData({ ...bioData, name: e.target.value })}
                        placeholder={session.user.name || "ใส่ชื่อของคุณ..."}
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-[#ff2a44] rounded-2xl p-3.5 text-sm text-white outline-none"
                      />
                    </div>

                    {/* Bio Description Text */}
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                        คำอธิบายประวัติส่วนตัว / สโลแกน (BIO DESCRIPTION)
                      </label>
                      <textarea
                        value={bioData.bio}
                        onChange={e => setBioData({ ...bioData, bio: e.target.value })}
                        className="w-full h-20 bg-white/[0.03] border border-white/10 focus:border-[#ff2a44] rounded-2xl p-3.5 text-sm text-white outline-none resize-none"
                        placeholder="เขียนคำแนะนำตัวสั้นๆ เช่น am okay..."
                      />
                      <p className="text-[11px] text-white/40 mt-1 font-light">
                        * แสดงอยู่ใต้ชื่อและป้ายยศโดยตรง สบายตา
                      </p>
                    </div>

                    {/* DISCORD CONNECTION SECTION (Clean 1-Click Sync & Live Server Badge / Note) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#5865F2]/30 space-y-4 shadow-[0_0_20px_rgba(88,101,242,0.1)]">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Shield size={18} className="text-[#5865F2]" />
                          <span className="font-bold text-sm text-white">DISCORD PROFILE WIDGET</span>
                        </div>
                        <button
                          type="button"
                          disabled={isSyncingDiscord}
                          onClick={handleSyncDiscordAccount}
                          className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(88,101,242,0.35)] cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={`text-white ${isSyncingDiscord ? 'animate-spin' : ''}`} />
                          <span>{isSyncingDiscord ? 'กำลังซิงค์ข้อมูล...' : 'ซิงค์จาก Discord ที่ล็อกอิน'}</span>
                        </button>
                      </div>

                      {/* Live Pulled Synced Message Card */}
                      {syncedDiscordInfo ? (
                        <div className="p-3.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/35 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
                                <img
                                  src={syncedDiscordInfo.avatar || bioData.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${syncedDiscordInfo.discordStatus === 'dnd' ? 'bg-red-500' :
                                  syncedDiscordInfo.discordStatus === 'idle' ? 'bg-amber-400' :
                                    syncedDiscordInfo.discordStatus === 'online' ? 'bg-green-500' : 'bg-neutral-500'
                                  }`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">@{syncedDiscordInfo.username}</span>
                                  {syncedDiscordInfo.badge && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20 font-bold">
                                      {syncedDiscordInfo.badgeIcon ? (
                                        <img src={syncedDiscordInfo.badgeIcon} alt="" className="w-3.5 h-3.5 rounded object-contain shrink-0" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] shrink-0" />
                                      )}
                                      <span>{syncedDiscordInfo.badge}</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-white/70">
                                  โน้ต/สถานะ: <span className="text-white font-medium">"{syncedDiscordInfo.note || syncedDiscordInfo.statusText || bioData.discordStatusText || '-'}"</span>
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-green-400 bg-green-500/15 border border-green-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Check size={11} />
                              <span>ดึงข้อมูลสดสำเร็จ ({syncedDiscordInfo.syncedAt})</span>
                            </span>
                          </div>

                          <div className="text-[10px] text-white/50 flex items-center justify-between pt-1 border-t border-white/10">
                            <span>สิทธิ์: <code className="text-[#8894f8] font-mono">identify + guilds</code></span>
                            {syncedDiscordInfo.guildCount > 0 && (
                              <span>เซิร์ฟเวอร์ที่พบ: {syncedDiscordInfo.guildCount} กิลด์</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 text-xs text-white/60">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#5865F2] animate-pulse shrink-0" />
                            <span>กดปุ่ม <b>"ซิงค์จาก Discord ที่ล็อกอิน"</b> เพื่อดึงโปรไฟล์ โน้ตสถานะ และแท็กเซิร์ฟเวอร์พร้อมไอคอนมาแสดงอัตโนมัติ</span>
                          </div>
                          <a
                            href="https://discord.com/oauth2/authorize?client_id=1518205795878305913&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&scope=identify+guilds"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#8894f8] hover:underline font-mono text-[10px] shrink-0 font-bold"
                          >
                            🔗 อนุญาตสิทธิ์ Discord
                          </a>
                        </div>
                      )}

                      {/* Hidden storage inputs ensuring synced status quote and badge persist */}
                      <input
                        type="hidden"
                        value={bioData.discordStatusText}
                      />
                      <input
                        type="hidden"
                        value={bioData.discordBadge}
                      />
                    </div>

                    {/* ROBLOX PROFILE WIDGET SECTION */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/15 space-y-3">
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                          <g transform="translate(12, 12) rotate(-15.5)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M -7 -7.5 H 7 V 7.5 H -7 Z M -2.2 -2.4 H 2.2 V 2.4 H -2.2 Z"
                            />
                          </g>
                        </svg>
                        <span className="font-bold text-sm text-white">ROBLOX PROFILE WIDGET</span>
                      </div>
                      <p className="text-xs text-white/50 font-light">
                        ใส่ชื่อผู้ใช้ Roblox ระบบจะดึงรูป Avatar Headshot และเปิดให้คลิกดูโปรไฟล์ Roblox ได้ทันที
                      </p>
                      <input
                        type="text"
                        value={bioData.robloxUsername}
                        onChange={e => setBioData({
                          ...bioData,
                          robloxUsername: e.target.value,
                          socials: { ...bioData.socials, roblox: e.target.value }
                        })}
                        placeholder="ชื่อผู้ใช้ Roblox เช่น hazelr..."
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                      />
                    </div>

                    {/* OTHER SOCIAL NETWORKS */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        โซเชียลมีเดียอื่นๆ (ไอคอนบริษัทของแท้)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'instagram', label: 'Instagram' },
                          { id: 'tiktok', label: 'TikTok' },
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'facebook', label: 'Facebook' },
                          { id: 'spotify', label: 'Spotify' },
                          { id: 'steam', label: 'Steam' },
                          { id: 'twitch', label: 'Twitch' },
                        ].map(item => (
                          <div key={item.id}>
                            <label className="block text-[11px] font-semibold text-white/50 mb-1">
                              {item.label} URL
                            </label>
                            <input
                              type="text"
                              value={bioData.socials?.[item.id] || ''}
                              onChange={e => setBioData({
                                ...bioData,
                                socials: { ...bioData.socials, [item.id]: e.target.value }
                              })}
                              placeholder={`https://${item.id}.com/...`}
                              className="w-full bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TAB 2: THEME & ATMOSPHERE (Avatar, Bg, Color, Particles, Cursor)
                    ======================================================== */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#ff2a44]" />
                        <span>ธีม & บรรยากาศ (Theme & Atmosphere)</span>
                      </h3>
                      <p className="text-xs text-white/50 font-light">
                        ปรับแต่งรูปประจำตัว พื้นหลัง สีประจำตัว และสีพาสติเคิลที่แยกกันโดยอิสระ
                      </p>
                    </div>

                    {/* Avatar Upload or URL */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        รูปประจำตัว (AVATAR)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white/20 bg-neutral-900 shadow-md">
                          <img
                            src={bioData.avatar || session.user.image}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={bioData.avatar}
                              onChange={e => setBioData({ ...bioData, avatar: e.target.value })}
                              placeholder="URL รูปภาพ (JPG, PNG, GIF)..."
                              className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                            <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                              <Upload size={13} />
                              <span>{uploadingAvatar ? '...' : 'อัปโหลด'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleFileUpload(e.target.files[0], url => setBioData({ ...bioData, avatar: url }), setUploadingAvatar)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Background Media Engine (GIF, MP4, JPG, PNG) */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        ภาพ / วิดีโอพื้นหลัง (BACKGROUND MEDIA)
                      </label>
                      <p className="text-[11px] text-white/40 font-light">
                        รองรับไฟล์ภาพ GIF, JPG, PNG หรือไฟล์วิดีโอ MP4, WebM
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bioData.backgroundUrl}
                          onChange={e => setBioData({ ...bioData, backgroundUrl: e.target.value })}
                          placeholder="URL พื้นหลัง หรือกดปุ่มอัปโหลด..."
                          className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                        <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload size={13} />
                          <span>{uploadingBg ? '...' : 'อัปโหลด'}</span>
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            className="hidden"
                            onChange={e => handleFileUpload(e.target.files[0], url => setBioData({ ...bioData, backgroundUrl: url }), setUploadingBg)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Theme Accent Color */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
                        <span>สีนีออนประจำตัว / ออร่าโปรไฟล์ (THEME ACCENT COLOR)</span>
                        <span className="text-[11px] font-mono text-white/60">{bioData.primaryColor || '#ff2a44'}</span>
                      </label>

                      {/* Quick Theme Presets */}
                      <div className="flex flex-wrap gap-2">
                        {THEME_COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBioData({ ...bioData, primaryColor: p.color })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${bioData.primaryColor === p.color
                              ? 'bg-white/20 border-white text-white shadow-md'
                              : 'bg-black/50 border-white/10 text-white/70 hover:text-white'
                              }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: p.color }} />
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div className="flex gap-3 items-center pt-1">
                        <input
                          type="color"
                          value={bioData.primaryColor || '#ff2a44'}
                          onChange={e => setBioData({ ...bioData, primaryColor: e.target.value })}
                          className="w-12 h-10 bg-transparent cursor-pointer rounded-xl border border-white/20 p-1"
                        />
                        <input
                          type="text"
                          value={bioData.primaryColor || '#ff2a44'}
                          onChange={e => setBioData({ ...bioData, primaryColor: e.target.value })}
                          className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    {/* FONT / TEXT COLOR (Requested: "bio เลือกสีฟอนต์ได้") */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
                        <span>สีตัวอักษร / ฟอนต์ (FONT / TEXT COLOR)</span>
                        <span className="text-[11px] font-mono text-white/60">{bioData.textColor || '#ffffff'}</span>
                      </label>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-2">
                        {FONT_COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBioData({ ...bioData, textColor: p.color })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${bioData.textColor === p.color
                              ? 'bg-white/20 border-white text-white shadow-md'
                              : 'bg-black/50 border-white/10 text-white/70 hover:text-white'
                              }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: p.color }} />
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div className="flex gap-3 items-center pt-1">
                        <input
                          type="color"
                          value={bioData.textColor || '#ffffff'}
                          onChange={e => setBioData({ ...bioData, textColor: e.target.value })}
                          className="w-12 h-10 bg-transparent cursor-pointer rounded-xl border border-white/20 p-1"
                        />
                        <input
                          type="text"
                          value={bioData.textColor || '#ffffff'}
                          onChange={e => setBioData({ ...bioData, textColor: e.target.value })}
                          className="flex-1 bg-black/50 border border-white/10 focus:border-white rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    {/* UI BOX / CARD STYLE (Requested: "จะเลือกไอสี่เหลี่ยมมันใสๆก็ได้ พวกสี่เหลี่ยมui จะได้customได้ดี") */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        ความโปร่งใสของกล่อง UI / สี่เหลี่ยม (CARD GLASS STYLE)
                      </label>
                      <p className="text-[11px] text-white/40 font-light">
                        ปรับความโปร่งใสของกล่อง Discord, Roblox, เพลง และคำอธิบาย
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CARD_STYLE_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setBioData({ ...bioData, cardStyle: opt.id })}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${bioData.cardStyle === opt.id
                              ? 'bg-white/15 border-white text-white shadow-md'
                              : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                              }`}
                          >
                            <span className="font-bold text-xs">{opt.label}</span>
                            <span className="text-[10px] text-white/40 mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* INDEPENDENT PARTICLE COLOR PICKER (Requested: "หน้าพาสติเคิส มีเลือกสีแยกกัน") */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
                        <span>สีของพาสติเคิล (PARTICLE COLOR - แยกเฉพาะ)</span>
                        <span className="text-[11px] font-mono text-white/60">{bioData.particleColor || '#ffffff'}</span>
                      </label>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-2">
                        {PARTICLE_COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBioData({ ...bioData, particleColor: p.color })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${bioData.particleColor === p.color
                              ? 'bg-white/20 border-white text-white shadow-md'
                              : 'bg-black/50 border-white/10 text-white/70 hover:text-white'
                              }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: p.color }} />
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Input */}
                      <div className="flex gap-3 items-center pt-1">
                        <input
                          type="color"
                          value={bioData.particleColor || '#ffffff'}
                          onChange={e => setBioData({ ...bioData, particleColor: e.target.value })}
                          className="w-12 h-10 bg-transparent cursor-pointer rounded-xl border border-white/20 p-1"
                        />
                        <input
                          type="text"
                          value={bioData.particleColor || '#ffffff'}
                          onChange={e => setBioData({ ...bioData, particleColor: e.target.value })}
                          className="flex-1 bg-black/50 border border-white/10 focus:border-white rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    {/* Particle Type Selector */}
                    <div>
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2.5">
                        รูปแบบเอฟเฟกต์อนุภาคฉากหลัง (PARTICLE EFFECT)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PARTICLE_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setBioData({ ...bioData, particleType: opt.id })}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${bioData.particleType === opt.id
                              ? 'bg-[#ff2a44]/20 border-[#ff2a44] text-white shadow-[0_0_15px_rgba(255,42,68,0.25)]'
                              : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            <span className="font-bold text-xs">{opt.label}</span>
                            <span className="text-[10px] text-white/40 mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cursor Drag Trail Selector */}
                    <div>
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2.5">
                        เอฟเฟกต์การเลื่อนลากเมาส์ (MOUSE CURSOR TRAIL)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CURSOR_OPTIONS.map(cur => (
                          <button
                            key={cur.id}
                            type="button"
                            onClick={() => setBioData({ ...bioData, cursorEffect: cur.id })}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${bioData.cursorEffect === cur.id
                              ? 'bg-white/15 border-white text-white shadow-md'
                              : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            <span className="font-bold text-xs">{cur.label}</span>
                            <span className="text-[10px] text-white/40 mt-0.5">{cur.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TAB 3: SOUNDTRACK & MUSIC
                    ======================================================== */}
                {activeTab === 'music' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <Music size={18} className="text-[#ff2a44]" />
                        <span>เพลงประจำตัว & การเล่นเสียง (Soundtrack)</span>
                      </h3>
                      <p className="text-xs text-white/50 font-light">
                        ใส่ลิงก์เพลงจาก YouTube หรืออัปโหลดไฟล์ MP3 ส่วนตัว ระบบจะเล่นเพลงทันทีพร้อมแถบปรับความดัง
                      </p>
                    </div>

                    {/* Music URL / Upload */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        ลิงก์เพลง หรืออัปโหลดไฟล์เสียง
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bioData.musicUrl}
                          onChange={e => setBioData({ ...bioData, musicUrl: e.target.value })}
                          placeholder="ลิงก์ YouTube (เช่น https://youtu.be/...) หรือกดอัปโหลดไฟล์ MP3"
                          className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                        <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload size={13} />
                          <span>{uploadingAudio ? '...' : 'อัปโหลด MP3'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e.target.files[0], url => setBioData({ ...bioData, musicUrl: url }), setUploadingAudio)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Song Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                          ชื่อเพลง (TRACK TITLE)
                        </label>
                        <input
                          type="text"
                          value={bioData.musicTitle}
                          onChange={e => setBioData({ ...bioData, musicTitle: e.target.value })}
                          placeholder="ชื่อเพลง เช่น Mushboy Transition..."
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-[#ff2a44] rounded-2xl p-3.5 text-sm text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                          ชื่อศิลปิน (ARTIST NAME)
                        </label>
                        <input
                          type="text"
                          value={bioData.musicArtist}
                          onChange={e => setBioData({ ...bioData, musicArtist: e.target.value })}
                          placeholder="ชื่อศิลปิน..."
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-[#ff2a44] rounded-2xl p-3.5 text-sm text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Music Cover */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        รูปภาพปกเพลง (ALBUM COVER ART)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bioData.musicCover}
                          onChange={e => setBioData({ ...bioData, musicCover: e.target.value })}
                          placeholder="URL ปกเพลง หรือกดอัปโหลดรูป..."
                          className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                        <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload size={13} />
                          <span>{uploadingCover ? '...' : 'อัปโหลดปก'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e.target.files[0], url => setBioData({ ...bioData, musicCover: url }), setUploadingCover)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* SAVE BUTTON */}
                <div className="mt-8 flex justify-end pt-5 border-t border-white/10">
                  <button
                    disabled={isSubmitting}
                    onClick={handleSaveBio}
                    className="bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] hover:from-[#ff3b53] hover:to-[#ff2a44] text-white px-8 py-3.5 rounded-2xl font-bold tracking-wide shadow-[0_10px_25px_rgba(255,42,68,0.4)] disabled:opacity-50 inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer text-sm"
                  >
                    <Save size={16} />
                    <span>{isSubmitting ? '...' : (t.adminDash?.save || 'SAVE CHANGES')}</span>
                  </button>
                </div>
              </div>

              {/* Right 1 Column: Interactive Mockup Live Preview */}
              <div className="bg-black/50 border border-white/10 rounded-[2.5rem] p-5 backdrop-blur-3xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Eye size={13} className="text-[#ff2a44]" />
                      <span>LIVE PREVIEW</span>
                    </span>
                    <span className="text-[10px] text-white/40 font-mono truncate max-w-[120px]">
                      /bio/{bioData.slug || 'slug'}
                    </span>
                  </div>

                  {/* Mockup Card (1:1 with real bio page) */}
                  <div className="rounded-3xl p-5 bg-gradient-to-b from-[#0a0a0f] to-[#040407] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col items-center text-center">

                    {/* Simulated Background */}
                    {bioData.backgroundUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                        style={{ backgroundImage: `url(${bioData.backgroundUrl})` }}
                      />
                    )}

                    {/* Avatar (Clean, NO accessories!) */}
                    <div className="relative mb-2 mt-2">
                      <div className="w-16 h-16 rounded-full p-[2px] shadow-lg" style={{ background: `linear-gradient(135deg, #ffffff, ${bioData.primaryColor})` }}>
                        <img
                          src={bioData.avatar || session.user.image}
                          alt=""
                          className="w-full h-full rounded-full object-cover border-2 border-black"
                        />
                      </div>
                    </div>

                    {/* Glowing Name with Custom Font Color */}
                    <h4
                      className="text-lg font-bold tracking-tight mb-1"
                      style={{
                        color: bioData.textColor || '#ffffff',
                        textShadow: `0 0 12px ${(bioData.textColor || '#ffffff')}90, 0 0 20px ${bioData.primaryColor}`
                      }}
                    >
                      {bioData.name || session.user.name}
                    </h4>

                    {/* Bio Description with Custom Glass Box and Font Color */}
                    {bioData.bio && (
                      <p
                        className={`text-[11px] font-light mb-3 px-3 py-1 rounded-xl border max-w-[200px] truncate transition-all ${bioData.cardStyle === 'transparent'
                          ? 'bg-transparent border-transparent'
                          : bioData.cardStyle === 'ultra_glass'
                            ? 'bg-black/15 border-white/10'
                            : bioData.cardStyle === 'dark'
                              ? 'bg-black/85 border-white/20'
                              : 'bg-black/40 border-white/10'
                          }`}
                        style={{ color: `${bioData.textColor || '#ffffff'}dd` }}
                      >
                        {bioData.bio}
                      </p>
                    )}

                    {/* gun.lol Profile Widgets (Discord + Roblox) */}
                    <div className="w-full space-y-2 mb-3">
                      {/* Discord Widget */}
                      <div className="transform scale-[0.88] origin-center -my-1">
                        <DiscordWidget
                          discordId={bioData.discordId || session.user.id}
                          customUsername={bioData.discordUsername || session.user.name}
                          customStatusText={bioData.discordStatusText}
                          customBadge={bioData.discordBadge}
                          avatarFallback={bioData.avatar || session.user.image}
                          primaryColor={bioData.primaryColor}
                          textColor={bioData.textColor}
                          cardStyle={bioData.cardStyle}
                        />
                      </div>

                      {/* Roblox Widget */}
                      {effectiveRoblox && (
                        <div className="transform scale-[0.88] origin-center -my-1">
                          <RobloxWidget
                            username={effectiveRoblox}
                            userId={bioData.robloxUserId}
                            primaryColor={bioData.primaryColor}
                            textColor={bioData.textColor}
                            cardStyle={bioData.cardStyle}
                          />
                        </div>
                      )}
                    </div>

                    {/* Brand Contact Icons Row in Mockup */}
                    {previewContacts.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                        {previewContacts.map((c, i) => (
                          <div key={i} className="transform scale-[0.85]">
                            <SocialBrandButton platform={c.platform} url={c.url} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Integrated Bio Music Player Preview (previewMode=true ensures NO sound plays in settings!) */}
                    {bioData.musicUrl && (
                      <div className="w-full mt-1">
                        <BioMusicPlayer
                          url={bioData.musicUrl}
                          title={bioData.musicTitle}
                          artist={bioData.musicArtist}
                          cover={bioData.musicCover}
                          primaryColor={bioData.primaryColor}
                          textColor={bioData.textColor}
                          cardStyle={bioData.cardStyle}
                          previewMode={true}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <a
                    href={`/bio/${bioData.slug || session.user.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#ff2a44] hover:underline font-bold"
                  >
                    <span>เปิดดูหน้าจริง (Open Live Page)</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
