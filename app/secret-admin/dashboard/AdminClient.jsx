'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  updateSiteSettings, 
  updateRoles, 
  updateMembers, 
  updateMemberRole,
  updateApplications,
  banMember,
  unbanMember,
  deleteMember
} from '@/lib/actions';
import { 
  Settings, 
  Users, 
  Shield, 
  UserPlus, 
  LogOut, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Palette, 
  Music, 
  Image as ImageIcon,
  Wallpaper,
  CheckCircle2,
  AlertCircle,
  Upload,
  Crown,
  Flame,
  Star,
  Zap,
  Skull,
  Swords,
  Crosshair,
  Gem,
  Ghost,
  Trophy,
  Globe,
  Bell,
  Radio,
  Clock,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Search,
  ExternalLink,
  Eye,
  Info,
  Link as LinkIcon,
  ShieldAlert,
  Award,
  Target,
  Anchor,
  Compass,
  Heart,
  Rocket,
  Terminal,
  Key,
  Lock,
  Feather,
  Hash,
  Disc,
  Bomb,
  Axe,
  Hammer,
  Medal,
  BadgeCheck,
  Diamond,
  Wrench,
  Siren,
  Sliders,
  Copy,
  Gamepad2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ParticleBackground from '@/components/ParticleBackground';

export const AVAILABLE_ROLE_ICONS = [
  { name: 'Crown', icon: Crown },
  { name: 'Shield', icon: Shield },
  { name: 'Flame', icon: Flame },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'Skull', icon: Skull },
  { name: 'Swords', icon: Swords },
  { name: 'Crosshair', icon: Crosshair },
  { name: 'Gem', icon: Gem },
  { name: 'Ghost', icon: Ghost },
  { name: 'Trophy', icon: Trophy },
  { name: 'Globe', icon: Globe },
  { name: 'Award', icon: Award },
  { name: 'Target', icon: Target },
  { name: 'Anchor', icon: Anchor },
  { name: 'Compass', icon: Compass },
  { name: 'Heart', icon: Heart },
  { name: 'Rocket', icon: Rocket },
  { name: 'Terminal', icon: Terminal },
  { name: 'Radio', icon: Radio },
  { name: 'Bell', icon: Bell },
  { name: 'Eye', icon: Eye },
  { name: 'Key', icon: Key },
  { name: 'Lock', icon: Lock },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Feather', icon: Feather },
  { name: 'Hash', icon: Hash },
  { name: 'Disc', icon: Disc },
  { name: 'Bomb', icon: Bomb },
  { name: 'Axe', icon: Axe },
  { name: 'Hammer', icon: Hammer },
  { name: 'Medal', icon: Medal },
  { name: 'BadgeCheck', icon: BadgeCheck },
  { name: 'Diamond', icon: Diamond },
  { name: 'Wrench', icon: Wrench },
  { name: 'Siren', icon: Siren },
  { name: 'ShieldAlert', icon: ShieldAlert },
];

export default function AdminClient({ initialSettings, initialRoles, initialMembers, initialApplications }) {
  const router = useRouter();
  const { t, lang, toggleLang } = useLanguage();
  const [activeTab, setActiveTab] = useState('settings');
  
  // State
  const [settings, setSettings] = useState(() => {
    const s = initialSettings || {};
    return {
      siteName: s.siteName || 'Slumzick',
      description: s.description || '',
      backgroundUrl: s.backgroundUrl || '',
      logoUrl: s.logoUrl || '',
      primaryColor: s.primaryColor || '#ff2a44',
      textColor: s.textColor || '#ffffff',
      contrastColor: s.contrastColor || '#ffffff',
      theme: s.theme || 'dark',
      discordInviteUrl: s.discordInviteUrl || '',
      particleType: s.particleType || 'snow',
      particleSpeed: s.particleSpeed || 1,
      particleDensity: s.particleDensity || 1,
      announcementTitle: s.announcementTitle || '',
      announcement: s.announcement || '',
      announcementBannerUrl: s.announcementBannerUrl || '',
      bannerSlideInterval: s.bannerSlideInterval || 5,
      banners: s.banners || (s.announcementBannerUrl ? [{ id: 'b1', url: s.announcementBannerUrl, caption: '' }] : []),
      socials: s.socials || {},
      musicUrl: s.musicUrl || '',
      musicTitle: s.musicTitle || '',
      musicCover: s.musicCover || ''
    };
  });

  const [roles, setRoles] = useState(initialRoles || []);
  const [members, setMembers] = useState(initialMembers || []);
  const [applications, setApplications] = useState(initialApplications || []);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [uploadingField, setUploadingField] = useState(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState('');

  // Search and modal state for members
  const [memberSearch, setMemberSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('all');
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);
  const [newBannerInput, setNewBannerInput] = useState('');

  // Client-side auto-refresh applications (poll every 10s)
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/admin/applications', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.applications)) {
            setApplications(data.applications);
          }
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }
    };

    // Fetch immediately on mount
    fetchApplications();

    // Poll every 10 seconds
    const interval = setInterval(fetchApplications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Security & 1-Hour Session Expiry Enforcement
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth') === 'true';
    const expiresAt = parseInt(localStorage.getItem('adminAuthExpiry') || '0', 10);
    const now = Date.now();

    if (!isAuth || !expiresAt || now >= expiresAt) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthExpiry');
      router.push('/secret-admin?reason=expired');
      return;
    }

    // Auto-logout when session expires
    const remainingMs = expiresAt - now;
    const autoLogoutTimer = setTimeout(() => {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthExpiry');
      router.push('/secret-admin?reason=expired');
    }, remainingMs);

    // Live countdown updater
    const updateCountdown = () => {
      const diffSecs = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      if (diffSecs <= 0) {
        setSessionTimeLeft('00:00');
        return;
      }
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      setSessionTimeLeft(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearTimeout(autoLogoutTimer);
      clearInterval(interval);
    };
  }, [router]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generic File Upload Handler
  const handleFileUpload = async (file, onUploaded, fieldName = '') => {
    if (!file) return;
    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        onUploaded(data.url);
        showToast(lang === 'th' ? 'อัปโหลดไฟล์สำเร็จเรียบร้อย' : 'File uploaded successfully');
      } else {
        showToast(data.error || 'Upload error', 'error');
      }
    } catch {
      showToast(lang === 'th' ? 'การอัปโหลดล้มเหลว' : 'Upload failed', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await updateSiteSettings(settings);
    setIsSaving(false);
    showToast(lang === 'th' ? 'บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว' : 'Site settings updated successfully');
  };

  // --- ROLES MANAGEMENT (Reorder, Icons, Contrast Colors) ---
  const handleAddRole = () => {
    const newRole = { 
      id: 'role_' + Date.now(), 
      name: lang === 'th' ? 'ยศใหม่' : 'New Role', 
      color: '#ff2a44', 
      contrastColor: '#ffffff',
      icon: 'Shield' 
    };
    setRoles([...roles, newRole]);
  };

  const handleSaveRoles = async () => {
    setIsSaving(true);
    await updateRoles(roles);
    setIsSaving(false);
    showToast(lang === 'th' ? 'บันทึกยศตำแหน่งเรียบร้อยแล้ว' : 'Roles updated successfully');
  };

  const handleDeleteRole = (roleId) => {
    if (confirm(lang === 'th' ? 'ยืนยันการลบยศตำแหน่งนี้?' : 'Delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleMoveRole = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === roles.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newRoles = [...roles];
    const temp = newRoles[index];
    newRoles[index] = newRoles[targetIndex];
    newRoles[targetIndex] = temp;
    setRoles(newRoles);
    await updateRoles(newRoles);
    showToast(lang === 'th' ? 'เลื่อนลำดับยศสำเร็จแล้ว' : 'Role hierarchy reordered');
  };

  // --- MEMBER MANAGEMENT (Ban, Unban, Delete with Confirmation) ---
  const handleBanMember = async (member) => {
    const confirmed = window.confirm(
      lang === 'th' 
        ? `⚠️ ยืนยันการ "แบน" สมาชิก: ${member.name} (${member.id})?\n\n• สมาชิกจะไม่แสดงในหน้ารายชื่อ (Roster)\n• หน้า Bio ของสมาชิกจะถูกปิดการเข้าถึง\n• สมาชิกจะไม่สามารถแก้ไขข้อมูลได้`
        : `Are you sure you want to BAN member: ${member.name}?`
    );
    if (!confirmed) return;

    const res = await banMember(member.id);
    if (res.success) {
      setMembers(members.map(m => m.id === member.id ? { ...m, banned: true } : m));
      showToast(lang === 'th' ? `ระงับการใช้งาน ${member.name} เรียบร้อยแล้ว` : `Banned ${member.name}`, 'info');
    } else {
      showToast(res.message || 'Error banning member', 'error');
    }
  };

  const handleUnbanMember = async (member) => {
    const confirmed = window.confirm(
      lang === 'th' 
        ? `ยืนยันการ "ปลดแบน" สมาชิก: ${member.name}?\n\nสมาชิกจะกลับมาแสดงในรายชื่อ และหน้า Bio จะเปิดใช้งานได้ตามปกติ`
        : `Are you sure you want to UNBAN member: ${member.name}?`
    );
    if (!confirmed) return;

    const res = await unbanMember(member.id);
    if (res.success) {
      setMembers(members.map(m => m.id === member.id ? { ...m, banned: false } : m));
      showToast(lang === 'th' ? `ปลดแบน ${member.name} สำเร็จแล้ว` : `Unbanned ${member.name}`, 'success');
    } else {
      showToast(res.message || 'Error unbanning member', 'error');
    }
  };

  const handleDeleteMember = async (member) => {
    const confirmed = window.confirm(
      lang === 'th' 
        ? `🚨 ยืนยันการ "ลบข้อมูลถาวร" ของสมาชิก: ${member.name} (${member.id})?\n\nการกระทำนี้จะลบข้อมูลออกจากระบบทั้งหมดและไม่สามารถกู้คืนได้!`
        : `Are you sure you want to PERMANENTLY DELETE ${member.name}? This cannot be undone.`
    );
    if (!confirmed) return;

    const res = await deleteMember(member.id);
    if (res.success) {
      setMembers(members.filter(m => m.id !== member.id));
      if (selectedMemberModal?.id === member.id) setSelectedMemberModal(null);
      showToast(lang === 'th' ? `ลบข้อมูล ${member.name} ออกจากระบบแล้ว` : `Deleted ${member.name}`, 'info');
    } else {
      showToast('Error deleting member', 'error');
    }
  };

  const handleRoleChange = async (memberId, newRoleId) => {
    if (!memberId || !newRoleId) return;
    const prevMembers = [...members];
    const targetMember = members.find(m => m.id === memberId);
    const targetRole = roles.find(r => r.id === newRoleId);
    const memberName = targetMember?.name || 'Member';
    const roleName = targetRole?.name || 'Role';

    // 1. Optimistic UI update immediately
    const updatedMembers = members.map(m => m.id === memberId ? { ...m, roleId: newRoleId } : m);
    setMembers(updatedMembers);
    if (selectedMemberModal?.id === memberId) {
      setSelectedMemberModal(prev => prev ? { ...prev, roleId: newRoleId } : null);
    }

    try {
      // 2. Call dedicated lightweight API endpoint (immune to server action payload limits)
      const res = await fetch('/api/admin/members/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, roleId: newRoleId })
      });
      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.members)) {
          setMembers(data.members);
        }
        showToast(
          lang === 'th' 
            ? `เปลี่ยนยศของ ${memberName} เป็น "${roleName}" และบันทึกอัตโนมัติเรียบร้อย` 
            : `Updated ${memberName}'s role to "${roleName}"`
        );
      } else {
        // Fallback to Server Action
        const actionRes = await updateMemberRole(memberId, newRoleId);
        if (actionRes?.success) {
          if (Array.isArray(actionRes.members)) {
            setMembers(actionRes.members);
          }
          showToast(
            lang === 'th' 
              ? `เปลี่ยนยศของ ${memberName} เป็น "${roleName}" และบันทึกอัตโนมัติเรียบร้อย` 
              : `Updated ${memberName}'s role to "${roleName}"`
          );
        } else {
          // Revert on failure
          setMembers(prevMembers);
          if (selectedMemberModal?.id === memberId) {
            setSelectedMemberModal(targetMember);
          }
          showToast(data.error || actionRes?.message || 'Error updating role', 'error');
        }
      }
    } catch (err) {
      console.error('Role update error:', err);
      // Fallback attempt to Server Action
      try {
        const actionRes = await updateMemberRole(memberId, newRoleId);
        if (actionRes?.success) {
          if (Array.isArray(actionRes.members)) setMembers(actionRes.members);
          showToast(
            lang === 'th' 
              ? `เปลี่ยนยศของ ${memberName} เป็น "${roleName}" และบันทึกอัตโนมัติเรียบร้อย` 
              : `Updated ${memberName}'s role to "${roleName}"`
          );
          return;
        }
      } catch (fallbackErr) {
        console.error('Server action fallback also failed:', fallbackErr);
      }
      // Revert on failure
      setMembers(prevMembers);
      if (selectedMemberModal?.id === memberId) {
        setSelectedMemberModal(targetMember);
      }
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกยศ' : 'Failed to update role', 'error');
    }
  };

  // --- APPLICATION MANAGEMENT (via API for atomic operations) ---
  const approveApp = async (app) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', appId: app.id, appData: app })
      });
      const data = await res.json();
      if (data.success) {
        // Sync both applications AND members from server
        if (Array.isArray(data.applications)) setApplications(data.applications);
        if (Array.isArray(data.members)) setMembers(data.members);
        showToast(lang === 'th' ? `อนุมัติ ${app.name} เข้าร่วมแก๊งแล้ว` : `Approved ${app.name}`);
      } else {
        showToast(data.error || 'Error approving', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const rejectApp = async (appId) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', appId })
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.applications)) setApplications(data.applications);
        showToast(lang === 'th' ? 'ปฏิเสธใบสมัครแล้ว' : 'Application rejected', 'info');
      } else {
        showToast(data.error || 'Error rejecting', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // --- BANNER CAROUSEL HELPERS ---
  const handleAddBanner = (url) => {
    if (!url) return;
    const currentBanners = settings.banners || [];
    const updated = [...currentBanners, { id: 'banner_' + Date.now(), url: url.trim(), caption: '' }];
    setSettings({ ...settings, banners: updated, announcementBannerUrl: updated[0]?.url || '' });
    setNewBannerInput('');
    showToast(lang === 'th' ? 'เพิ่มแบนเนอร์เรียบร้อยแล้ว' : 'Banner added');
  };

  const handleDeleteBanner = (bannerId) => {
    const currentBanners = settings.banners || [];
    const updated = currentBanners.filter(b => b.id !== bannerId);
    setSettings({ ...settings, banners: updated, announcementBannerUrl: updated[0]?.url || '' });
    showToast(lang === 'th' ? 'ลบแบนเนอร์แล้ว' : 'Banner removed');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthExpiry');
    router.push('/');
  };

  // Filter members in admin (by role filter tab + text search)
  const filteredMembers = members.filter(m => {
    const matchRole = adminRoleFilter === 'all' || m.roleId === adminRoleFilter;
    if (!matchRole) return false;
    if (!memberSearch) return true;
    const q = memberSearch.toLowerCase();
    const nameMatch = m.name?.toLowerCase().includes(q);
    const slugMatch = m.slug?.toLowerCase().includes(q);
    const idMatch = m.id?.toLowerCase().includes(q);
    const discordMatch = m.discordUsername?.toLowerCase().includes(q) || m.discordId?.toLowerCase().includes(q);
    const roleObj = roles.find(r => r.id === m.roleId);
    const roleMatch = roleObj?.name?.toLowerCase().includes(q);
    return nameMatch || slugMatch || idMatch || discordMatch || roleMatch;
  });

  const tabs = [
    { id: 'settings', icon: Settings, label: t.adminDash?.settingsTab || 'Site Settings' },
    { id: 'roles', icon: Shield, label: t.adminDash?.rolesTab || 'Roles & Hierarchy' },
    { id: 'members', icon: Users, label: `${t.adminDash?.membersTab || 'Members'} (${members.length})` },
    { id: 'applications', icon: UserPlus, label: `${t.adminDash?.appTab || 'Applications'} (${applications.length})` },
  ];

  return (
    <div data-fixed-theme="true" className="min-h-screen bg-[#040407] text-white p-3.5 sm:p-8 font-sans relative selection:bg-[#ff2a44] selection:text-white">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#ff2a44]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl backdrop-blur-2xl shadow-2xl border text-xs sm:text-sm font-medium ${
              toastMessage.type === 'success' 
                ? 'bg-[#0f1711]/95 border-green-500/40 text-green-300' 
                : 'bg-[#170f0f]/95 border-red-500/40 text-red-300'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-green-400 shrink-0" /> : <AlertCircle size={16} className="text-red-400 shrink-0" />}
            <span>{toastMessage.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 lg:gap-8">
        
        {/* Navigation Sidebar (Desktop) / Top Pills (Mobile) */}
        <aside className="w-full lg:w-72 shrink-0 bg-black/45 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col gap-2 h-fit lg:sticky lg:top-8 shadow-xl">
          
          {/* Header Branding & Mobile Quick Actions */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 mb-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg overflow-hidden border shrink-0"
                style={{ backgroundColor: `${settings.primaryColor || '#ff2a44'}20`, borderColor: `${settings.primaryColor || '#ff2a44'}60` }}
              >
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Crown size={20} style={{ color: settings.primaryColor || '#ff2a44' }} />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase truncate font-mono">
                  {settings.siteName || 'ADMIN CONSOLE'}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>MASTER ACCESS</span>
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Switch Language"
            >
              <Globe size={15} />
            </button>
          </div>

          {/* Session Expiry Status Badge */}
          {sessionTimeLeft && (
            <div className="mb-3 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Clock size={13} className="text-amber-400" />
                <span>{lang === 'th' ? 'อายุเซสชันคงเหลือ:' : 'Session Expiry:'}</span>
              </span>
              <span className="font-bold text-amber-200">{sessionTimeLeft}</span>
            </div>
          )}

          {/* Tab Navigation List */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] text-white shadow-[0_4px_20px_rgba(255,42,68,0.4)]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon size={17} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin Exit / Logout Button */}
          <div className="pt-3 border-t border-white/10 mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>{t.adminDash?.logout || 'Exit Dashboard'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-black/45 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-8 shadow-xl">
          
          {/* TAB 1: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Settings className="text-[#ff2a44]" size={22} />
                    {t.adminDash?.settingsTab || 'Site Settings & Branding'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">
                    {lang === 'th' ? 'ปรับแต่งข้อมูลแก๊ง โลโก้ สีสัน ธีม ลิงก์ Discord และแบนเนอร์' : 'Configure gang identity, colors, theme, Discord contact, and banners'}
                  </p>
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-[0_8px_25px_rgba(255,42,68,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                  <Save size={15} />
                  <span>{isSaving ? '...' : (t.adminDash?.save || 'Save Settings')}</span>
                </button>
              </div>

              {/* Settings Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* 1. Syndicate Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                    {t.adminDash?.gangName || 'Gang Name'}
                  </label>
                  <input 
                    type="text" 
                    value={settings.siteName || ''} 
                    onChange={e => setSettings({ ...settings, siteName: e.target.value })} 
                    className="w-full bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-4 py-3 text-sm text-white outline-none" 
                    placeholder="e.g. Sluzmzick Syndicate"
                  />
                </div>

                {/* 2. Gang Discord Invite URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center justify-between">
                    <span>{lang === 'th' ? 'ลิงก์ Discord ติดต่อเข้าแก๊ง' : 'Gang Discord Invite URL'}</span>
                    <span className="text-[10px] text-[#5865F2] font-mono">PUBLIC ONLY</span>
                  </label>
                  <input 
                    type="text" 
                    value={settings.discordInviteUrl || ''} 
                    onChange={e => setSettings({ ...settings, discordInviteUrl: e.target.value })} 
                    className="w-full bg-black/50 border border-white/10 focus:border-[#5865F2] rounded-2xl px-4 py-3 text-sm text-white outline-none" 
                    placeholder="https://discord.gg/your-gang"
                  />
                  <p className="text-[11px] text-white/40 font-light">
                    {lang === 'th' 
                      ? 'ปุ่ม Discord ติดต่อเข้าแก๊งจะแสดงที่หน้าแรกและหน้ารายชื่อ (จะไม่แสดงในหน้า Bio ส่วนตัว)' 
                      : 'Join Gang button will appear on Home & Roster pages (not personal Bio pages).'}
                  </p>
                </div>

                {/* 3. Site Slogan / Description */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                    {t.adminDash?.description || 'Syndicate Description / Slogan'}
                  </label>
                  <input 
                    type="text" 
                    value={settings.description || ''} 
                    onChange={e => setSettings({ ...settings, description: e.target.value })} 
                    className="w-full bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-4 py-3 text-sm text-white outline-none" 
                    placeholder="e.g. The ultimate syndicate of blood brothers..."
                  />
                </div>

                {/* 4. Logo & Browser Tab Favicon */}
                <div className="sm:col-span-2 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#ff2a44]" />
                      <span>{lang === 'th' ? 'โลโก้แก๊ง และ ไอคอนหัวแท็บบราวเซอร์ (Favicon)' : 'Gang Logo & Browser Tab Favicon'}</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">LIVE TAB SYNC</span>
                  </div>

                  {/* Browser Tab Live Mockup Preview */}
                  <div className="p-3 rounded-2xl bg-neutral-950/80 border border-white/10 flex items-center gap-3">
                    <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest shrink-0">ตัวอย่างแท็บ:</span>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-[#1c1c24] border-t border-x border-white/15 text-xs text-white/90 shadow-md font-sans max-w-xs truncate">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Favicon" className="w-3.5 h-3.5 object-contain rounded-full shrink-0" />
                      ) : (
                        <Crown size={14} className="text-[#ff2a44] shrink-0" />
                      )}
                      <span className="truncate font-medium">{settings.siteName || 'Slumzick'} • Official Syndicate Portal</span>
                      <X size={11} className="text-white/40 ml-1 shrink-0" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input 
                      type="text" 
                      value={settings.logoUrl || ''} 
                      onChange={e => setSettings({ ...settings, logoUrl: e.target.value })} 
                      className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-4 py-3 text-sm text-white outline-none" 
                      placeholder="https://... หรืออัปโหลดรูปภาพ"
                    />

                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white cursor-pointer transition-all shrink-0">
                      <Upload size={14} />
                      <span>{uploadingField === 'logo' ? '...' : (lang === 'th' ? 'อัปโหลดโลโก้' : 'Upload Logo')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, url => setSettings({ ...settings, logoUrl: url }), 'logo');
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 4.5 Site Global Background Image / GIF */}
                <div className="sm:col-span-2 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallpaper size={14} className="text-[#ff2a44]" />
                      <span>{lang === 'th' ? 'ภาพพื้นหลังเว็บไซต์หลัก (Site Background / GIF)' : 'Main Site Background Image / GIF'}</span>
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">GLOBAL BACKGROUND</span>
                  </div>

                  {/* Background Live Preview */}
                  <div className="relative h-32 sm:h-44 rounded-2xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                      style={{ 
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(4, 4, 7, 0.75)), url(${settings.backgroundUrl || '/banner.png'})` 
                      }}
                    />
                    <div className="relative z-10 px-4 py-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-center shadow-lg">
                      <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                        <Wallpaper size={13} className="text-[#ff2a44]" />
                        <span>{lang === 'th' ? 'ตัวอย่างภาพพื้นหลังหน้าเว็บ (Live Preview)' : 'Live Background Preview'}</span>
                      </p>
                      <p className="text-[10px] text-white/60 mt-0.5 font-mono truncate max-w-xs sm:max-w-md">
                        {settings.backgroundUrl || '/banner.png (ภาพเริ่มต้น)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input 
                      type="text" 
                      value={settings.backgroundUrl || ''} 
                      onChange={e => setSettings({ ...settings, backgroundUrl: e.target.value })} 
                      className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-4 py-3 text-sm text-white outline-none" 
                      placeholder="https://... หรือกดอัปโหลดรูปภาพ / ไฟล์ GIF"
                    />

                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white cursor-pointer transition-all shrink-0">
                      <Upload size={14} />
                      <span>{uploadingField === 'bg' ? 'กำลังอัปโหลด...' : (lang === 'th' ? 'อัปโหลดภาพพื้นหลัง' : 'Upload Background')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, url => setSettings({ ...settings, backgroundUrl: url }), 'bg');
                        }}
                      />
                    </label>

                    {settings.backgroundUrl && (
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, backgroundUrl: '' })}
                        className="px-3.5 py-3 rounded-2xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                        title="Reset to default banner"
                      >
                        {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 font-light">
                    {lang === 'th' 
                      ? 'ภาพนี้จะแสดงเป็นพื้นหลังของเว็บไซต์ทุกหน้า (หน้าแรกและหน้ารายชื่อสมาชิก) รองรับทั้งรูปภาพทั่วไปและภาพเคลื่อนไหว GIF' 
                      : 'This background applies to all main pages (Home, Roster). Supports images and animated GIFs.'}
                  </p>
                </div>

                {/* 5. Colors Customization (Primary, Text, Contrast) */}
                <div className="sm:col-span-2 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette size={14} className="text-[#ff2a44]" />
                      <span>{lang === 'th' ? 'ปรับแต่งชุดสีและสีตัดกัน (Theme Colors & Contrast)' : 'Theme Colors & Contrast'}</span>
                    </label>
                    <span className="text-[11px] text-white/40">รองรับสีตัดกัน แดง-ขาว-ดำ</span>
                  </div>

                  {/* Color Pickers Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Primary Accent Color */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider text-white/50">
                        {lang === 'th' ? 'สีหลักของเว็บ (Primary)' : 'Primary Accent'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settings.primaryColor || '#ff2a44'} 
                          onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} 
                          className="w-10 h-8 bg-transparent cursor-pointer rounded-lg shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={settings.primaryColor || '#ff2a44'} 
                          onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} 
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-mono outline-none" 
                        />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider text-white/50">
                        {lang === 'th' ? 'สีข้อความทั่วไป (Text Color)' : 'Text Color'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settings.textColor || '#ffffff'} 
                          onChange={e => setSettings({ ...settings, textColor: e.target.value })} 
                          className="w-10 h-8 bg-transparent cursor-pointer rounded-lg shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={settings.textColor || '#ffffff'} 
                          onChange={e => setSettings({ ...settings, textColor: e.target.value })} 
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-mono outline-none" 
                        />
                      </div>
                    </div>

                    {/* Contrast / Highlight Color */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider text-white/50">
                        {lang === 'th' ? 'สีตัดกัน (Contrast Accent)' : 'Contrast Accent'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settings.contrastColor || '#ffffff'} 
                          onChange={e => setSettings({ ...settings, contrastColor: e.target.value })} 
                          className="w-10 h-8 bg-transparent cursor-pointer rounded-lg shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={settings.contrastColor || '#ffffff'} 
                          onChange={e => setSettings({ ...settings, contrastColor: e.target.value })} 
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-mono outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Combos */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-white/40 font-mono">ชุดสีแนะนำ:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, primaryColor: '#ff2a44', textColor: '#ffffff', contrastColor: '#ffffff' })}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a44]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      <span>แดง-ขาว (Red-White)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, primaryColor: '#ff0033', textColor: '#f3f4f6', contrastColor: '#000000' })}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff0033]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/30" />
                      <span>แดง-ดำ (Red-Black)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, primaryColor: '#a855f7', textColor: '#ffffff', contrastColor: '#e9d5ff' })}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e9d5ff]" />
                      <span>นีออนม่วง-ขาว (Violet)</span>
                    </button>
                  </div>
                </div>

                {/* 6. Theme Selector (Dark / Light / High Contrast) */}
                <div className="sm:col-span-2 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-[#ff2a44]" />
                    <span>{lang === 'th' ? 'รูปแบบธีมเว็บไซต์ (Theme Mode)' : 'Site Theme Mode'}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'dark', title: '🌑 Cyber Dark (โหมดมืด)', desc: 'สีดำและนีออนมาตรฐานแก๊ง (แนะนำ)' },
                      { id: 'light', title: '☀️ Cyber Light (โหมดสว่าง)', desc: 'โทนสว่างตัดขอบเข้ม สบายตา' },
                      { id: 'contrast', title: '⚡ High Contrast (สีตัดกันสูง)', desc: 'สีแดงตัดขาวดำเด่นชัดพิเศษ' },
                    ].map(tOption => (
                      <button
                        key={tOption.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, theme: tOption.id })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          settings.theme === tOption.id
                            ? 'bg-[#ff2a44]/15 border-[#ff2a44] shadow-md'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs text-white">{tOption.title}</div>
                        <div className="text-[11px] text-white/50 mt-0.5">{tOption.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6.5. Particle Effect Engine & Live Inspector (พาสติเคิลเยอะๆ & สไลเดอร์เลื่อนตรวจ) */}
                <div className="sm:col-span-2 p-4 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} className="text-[#ff2a44]" />
                        <span>{lang === 'th' ? 'ระบบเอฟเฟกต์ละอองพาสติเคิล (Particle Engine)' : 'Particle Effect Engine'}</span>
                      </h4>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {lang === 'th' ? 'เลือกเอฟเฟกต์ ปรับความเร็ว และความหนาแน่น พร้อมหน้าต่างจำลองเลื่อนตรวจ' : 'Choose particle style, adjust speed and density with live inspector'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                        {settings.particleType || 'embers'} • {settings.particleSpeed || 1}x • {settings.particleDensity || 1}x
                      </span>
                    </div>
                  </div>

                  {/* 11 Particle Presets Grid */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                      {lang === 'th' ? 'เลือกรูปแบบละอองพาสติเคิล' : 'Particle Preset'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {[
                        { id: 'embers', label: 'สะเก็ดไฟ', emoji: '🔥', desc: 'Embers' },
                        { id: 'snow', label: 'หิมะคริสตัล', emoji: '❄️', desc: 'Snow' },
                        { id: 'sakura', label: 'ซากุระปลิว', emoji: '🌸', desc: 'Sakura' },
                        { id: 'rain', label: 'ฝนไซเบอร์', emoji: '🌧️', desc: 'Rain' },
                        { id: 'stars', label: 'ดวงดาวระยับ', emoji: '⭐', desc: 'Stars' },
                        { id: 'sparkles', label: 'ประกายแสง', emoji: '✨', desc: 'Sparkles' },
                        { id: 'cyber_dust', label: 'ฝุ่นไซเบอร์', emoji: '🌌', desc: 'Dust' },
                        { id: 'fireflies', label: 'หิ่งห้อยนีออน', emoji: '🪲', desc: 'Fireflies' },
                        { id: 'bubbles', label: 'ฟองสบู่ออร่า', emoji: '🫧', desc: 'Bubbles' },
                        { id: 'matrix', label: 'แมทริกซ์', emoji: '👾', desc: 'Matrix' },
                        { id: 'none', label: 'ปิดเอฟเฟกต์', emoji: '🚫', desc: 'Disabled' },
                      ].map(pItem => (
                        <button
                          key={pItem.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, particleType: pItem.id })}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            (settings.particleType || 'embers') === pItem.id
                              ? 'bg-[#ff2a44]/20 border-[#ff2a44] shadow-[0_0_15px_rgba(255,42,68,0.25)]'
                              : 'bg-black/40 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="text-lg leading-none mb-1">{pItem.emoji}</div>
                          <div className="font-bold text-xs text-white truncate">{pItem.label}</div>
                          <div className="text-[10px] text-white/40">{pItem.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders for Speed & Density (การเลื่อนตรวจ) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Speed Slider */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                        <span className="flex items-center gap-1.5">
                          <Sliders size={13} className="text-[#ff2a44]" />
                          <span>{lang === 'th' ? 'ความเร็วการเคลื่อนที่ (Speed)' : 'Movement Speed'}</span>
                        </span>
                        <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded-md font-bold text-xs">
                          {settings.particleSpeed || 1}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={settings.particleSpeed || 1}
                        onChange={e => setSettings({ ...settings, particleSpeed: parseFloat(e.target.value) })}
                        className="w-full accent-[#ff2a44] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 font-mono">
                        <span>0.2x (ช้ามาก)</span>
                        <span>1.0x (มาตรฐาน)</span>
                        <span>3.0x (เร็วมาก)</span>
                      </div>
                    </div>

                    {/* Density Slider */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                        <span className="flex items-center gap-1.5">
                          <Sliders size={13} className="text-[#ff2a44]" />
                          <span>{lang === 'th' ? 'ปริมาณ / ความหนาแน่น (Density)' : 'Particle Density'}</span>
                        </span>
                        <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded-md font-bold text-xs">
                          {settings.particleDensity || 1}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.1"
                        value={settings.particleDensity || 1}
                        onChange={e => setSettings({ ...settings, particleDensity: parseFloat(e.target.value) })}
                        className="w-full accent-[#ff2a44] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 font-mono">
                        <span>0.3x (เบาบาง)</span>
                        <span>1.0x (มาตรฐาน)</span>
                        <span>2.5x (แน่นจัดเต็ม)</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Viewport Inspector (หน้าต่างจำลองเลื่อนตรวจแบบ Realtime) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Eye size={13} className="text-[#ff2a44]" />
                        <span>{lang === 'th' ? 'หน้าต่างจำลองเลื่อนตรวจพาสติเคิล (Live Inspector Viewport)' : 'Live Inspector Viewport'}</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE PREVIEW
                      </span>
                    </label>

                    <div className="relative h-44 rounded-2xl bg-black/85 border border-white/15 overflow-hidden flex items-center justify-center shadow-inner">
                      <ParticleBackground
                        type={settings.particleType || 'embers'}
                        color={settings.primaryColor || '#ff2a44'}
                        speed={settings.particleSpeed || 1}
                        density={settings.particleDensity || 1}
                        isInline={true}
                      />
                      
                      <div className="relative z-10 text-center pointer-events-none p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 max-w-sm mx-4">
                        <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                          <Sparkles size={14} className="text-[#ff2a44]" />
                          <span>{lang === 'th' ? 'ทดสอบสัมผัสและเลื่อนดูเอฟเฟกต์ได้ทันที' : 'Live Interactive Particle Inspector'}</span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-1">
                          {lang === 'th' 
                            ? `รูปแบบ: ${settings.particleType || 'embers'} | สปีด: ${settings.particleSpeed || 1}x | หนาแน่น: ${settings.particleDensity || 1}x`
                            : `Type: ${settings.particleType || 'embers'} | Speed: ${settings.particleSpeed || 1}x | Density: ${settings.particleDensity || 1}x`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Multi-Banner & Announcement Carousel System */}
                <div className="sm:col-span-2 p-4 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#ff2a44]" />
                        <span>{lang === 'th' ? 'ระบบแบนเนอร์เลื่อนออโต้ & แถบประกาศ' : 'Auto-Sliding Banner & Announcement Ticker'}</span>
                      </h4>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {lang === 'th' ? 'แสดงที่หน้ารายชื่อสมาชิก เหนือกล่องค้นหา (รองรับรูปหลายรูปและ GIF)' : 'Displayed on Roster page above search'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-white/60 font-mono">ความเร็วเลื่อน (วินาที):</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="30"
                        value={settings.bannerSlideInterval || 5} 
                        onChange={e => setSettings({ ...settings, bannerSlideInterval: parseInt(e.target.value) || 5 })} 
                        className="w-16 bg-black/60 border border-white/15 focus:border-[#ff2a44] rounded-xl px-2.5 py-1 text-xs text-center font-bold text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Dimension Guide Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
                    <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">ขนาดที่แนะนำ:</span> 1200 x 400 พิกเซล (หรืออัตราส่วนประมาณ 3:1) 
                      <span className="block text-amber-200/80 text-[11px] mt-0.5">
                        • ระบบจะปรับสัดส่วนรูปภาพให้พอดีอัตโนมัติ (Auto-fit Cover) รองรับทั้งไฟล์ภาพนิ่งและภาพเคลื่อนไหว GIF
                        <br />• หากไม่ใส่แบนเนอร์ ระบบจะไม่แสดงส่วนแบนเนอร์ในหน้าเว็บ
                      </span>
                    </div>
                  </div>

                  {/* Existing Banners List */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                      {lang === 'th' ? 'รายการแบนเนอร์ปัจจุบัน' : 'Current Banners'} ({(settings.banners || []).length})
                    </label>

                    {(settings.banners || []).length === 0 ? (
                      <div className="p-4 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-white/40">
                        {lang === 'th' ? 'ยังไม่มีแบนเนอร์ (จะไม่แสดงแบนเนอร์ในหน้าเว็บ)' : 'No banners added.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(settings.banners || []).map((banner, bIdx) => (
                          <div key={banner.id || bIdx} className="p-2.5 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-3 relative group">
                            <div className="w-24 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                              <img src={banner.url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-mono text-white/40">แบนเนอร์ #{bIdx + 1}</div>
                              <div className="text-xs text-white/80 truncate font-mono">{banner.url}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer shrink-0"
                              title="Delete banner"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Banner Bar */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center pt-2">
                    <input 
                      type="text" 
                      value={newBannerInput} 
                      onChange={e => setNewBannerInput(e.target.value)} 
                      placeholder="วางลิงก์รูปภาพ หรือ GIF สำหรับแบนเนอร์..."
                      className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleAddBanner(newBannerInput)}
                      className="px-4 py-2.5 rounded-2xl bg-[#ff2a44] hover:bg-[#ff3b53] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus size={14} />
                      <span>{lang === 'th' ? 'เพิ่มแบนเนอร์' : 'Add Banner'}</span>
                    </button>

                    <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white cursor-pointer transition-all shrink-0">
                      <Upload size={14} />
                      <span>{uploadingField === 'newBanner' ? '...' : (lang === 'th' ? 'อัปโหลด GIF/รูป' : 'Upload File')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, url => handleAddBanner(url), 'newBanner');
                        }}
                      />
                    </label>
                  </div>

                  {/* Scrolling Text Announcement Input */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell size={14} className="text-[#ff2a44]" />
                      <span>{lang === 'th' ? 'ข้อความประกาศตัวเลื่อน (Scrolling Announcement Marquee)' : 'Scrolling Marquee Announcement'}</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
                          {lang === 'th' ? 'หัวข้อประกาศ' : 'Title'}
                        </label>
                        <input 
                          type="text" 
                          value={settings.announcementTitle || ''} 
                          onChange={e => setSettings({ ...settings, announcementTitle: e.target.value })} 
                          className="w-full bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none" 
                          placeholder="e.g. ประกาศสำคัญ"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
                          {lang === 'th' ? 'เนื้อหาประกาศ (จะเลื่อนแสดงหน้าเว็บ)' : 'Announcement Body Text'}
                        </label>
                        <input 
                          type="text" 
                          value={settings.announcement || ''} 
                          onChange={e => setSettings({ ...settings, announcement: e.target.value })} 
                          className="w-full bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none" 
                          placeholder="ใส่ข้อความประกาศ เช่น กฎการรวมพล, กิจกรรมแก๊ง..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. Ambient Music Player */}
                <div className="sm:col-span-2 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Music size={14} className="text-[#ff2a44]" />
                      <span>{lang === 'th' ? 'เพลงเปิดในเว็บ (Ambient Audio)' : 'Ambient Background Music'}</span>
                    </label>
                    {settings.musicUrl && (
                      <button 
                        onClick={() => setSettings({ ...settings, musicUrl: '' })} 
                        className="text-[11px] text-red-400 hover:underline"
                      >
                        {lang === 'th' ? 'ลบเพลง' : 'Remove music'}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input 
                      type="text" 
                      value={settings.musicUrl || ''} 
                      onChange={e => setSettings({ ...settings, musicUrl: e.target.value })} 
                      className="flex-1 bg-black/50 border border-white/10 focus:border-[#ff2a44] rounded-2xl px-4 py-3 text-sm text-white outline-none" 
                      placeholder="e.g. YouTube URL หรือไฟล์ MP3"
                    />

                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white cursor-pointer transition-all shrink-0">
                      <Upload size={14} />
                      <span>{uploadingField === 'music' ? '...' : (lang === 'th' ? 'อัปโหลด MP3' : 'Upload MP3')}</span>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, url => setSettings({ ...settings, musicUrl: url }), 'music');
                        }}
                      />
                    </label>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: ROLES & RANKS HIERARCHY */}
          {activeTab === 'roles' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="text-[#ff2a44]" size={22} />
                    {t.adminDash?.rolesTab || 'Roles & Rank Hierarchy'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">
                    {lang === 'th' ? 'สร้างยศ เลื่อนระดับสูงต่ำ กำหนดสียศตัดกัน และเลือกไอคอนกว่า 30 แบบ' : 'Manage rank hierarchy, reorder levels, set contrast colors, and pick from 30+ icons'}
                  </p>
                </div>

                <div className="flex gap-2.5 self-start sm:self-auto">
                  <button 
                    onClick={handleAddRole} 
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>{t.adminDash?.addRole || 'Add Role'}</span>
                  </button>

                  <button 
                    onClick={handleSaveRoles} 
                    disabled={isSaving}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#ff2a44] to-[#ff3b53] text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-[0_8px_25px_rgba(255,42,68,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>{isSaving ? '...' : (t.adminDash?.save || 'Save Roles')}</span>
                  </button>
                </div>
              </div>

              {/* Roles List */}
              <div className="space-y-4">
                {roles.map((role, i) => {
                  const SelectedIconObj = AVAILABLE_ROLE_ICONS.find(item => item.name === role.icon) || AVAILABLE_ROLE_ICONS[1];
                  const IconComp = SelectedIconObj.icon;
                  const isCustomImage = role.icon && (role.icon.startsWith('http') || role.icon.startsWith('/'));

                  return (
                    <div 
                      key={role.id} 
                      className="bg-black/45 border border-white/10 hover:border-white/20 p-4 sm:p-5 rounded-3xl flex flex-col gap-4 transition-all"
                    >
                      {/* Top Bar: Reorder Controls + Preview + Role Name + Contrast Colors */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        
                        {/* Order Controls & Preview */}
                        <div className="flex items-center gap-2.5">
                          {/* Up & Down Hierarchy Buttons */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveRole(i, 'up')}
                              disabled={i === 0}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-20 text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                              title="Move Up in Rank"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveRole(i, 'down')}
                              disabled={i === roles.length - 1}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-20 text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                              title="Move Down in Rank"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          {/* Dual Contrast Rank Pill Preview */}
                          <div 
                            className="px-3.5 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs shrink-0 shadow-lg border" 
                            style={{ 
                              backgroundColor: role.color || '#ff2a44', 
                              color: role.contrastColor || '#ffffff',
                              borderColor: `${role.contrastColor || '#ffffff'}60`,
                              boxShadow: `0 0 15px ${(role.color || '#ff2a44')}40`
                            }}
                          >
                            {isCustomImage ? (
                              <img src={role.icon} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                              <IconComp size={15} style={{ color: role.contrastColor || '#ffffff' }} />
                            )}
                            <span>{role.name || 'Rank'}</span>
                          </div>

                          <span className="text-[10px] text-white/40 font-mono">อันดับ {i + 1}</span>
                        </div>

                        {/* Role Name Input */}
                        <div className="flex-1 w-full sm:w-auto min-w-[180px]">
                          <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
                            {lang === 'th' ? 'ชื่อยศ' : 'Role Name'}
                          </label>
                          <input 
                            type="text" 
                            value={role.name} 
                            onChange={e => {
                              const newRoles = [...roles];
                              newRoles[i].name = e.target.value;
                              setRoles(newRoles);
                            }} 
                            className="w-full bg-white/[0.04] border border-white/10 focus:border-[#ff2a44] rounded-xl px-3.5 py-2 text-sm text-white outline-none" 
                          />
                        </div>

                        {/* Dual Color Controls (Color + Contrast Color) */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          <div>
                            <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
                              {lang === 'th' ? 'สียศหลัก' : 'Primary'}
                            </label>
                            <input 
                              type="color" 
                              value={role.color || '#ff2a44'} 
                              onChange={e => {
                                const newRoles = [...roles];
                                newRoles[i].color = e.target.value;
                                setRoles(newRoles);
                              }} 
                              className="w-12 h-8 bg-transparent cursor-pointer rounded-xl" 
                            />
                          </div>

                          <div>
                            <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-1">
                              {lang === 'th' ? 'สีตัดกัน/ตัวอักษร' : 'Contrast'}
                            </label>
                            <input 
                              type="color" 
                              value={role.contrastColor || '#ffffff'} 
                              onChange={e => {
                                const newRoles = [...roles];
                                newRoles[i].contrastColor = e.target.value;
                                setRoles(newRoles);
                              }} 
                              className="w-12 h-8 bg-transparent cursor-pointer rounded-xl" 
                            />
                          </div>

                          <button 
                            onClick={() => handleDeleteRole(role.id)} 
                            className="p-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-colors self-end sm:self-center cursor-pointer"
                            title="Delete Role"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Icon Selector: Choice of 37 Icons OR Custom Image URL/Upload */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <label className="block text-white/40 text-[10px] uppercase tracking-wider">
                          {lang === 'th' ? 'เลือกไอคอนยศ (มีให้เลือกกว่า 30 แบบ หรือใส่ลิงก์รูป/อัปโหลดไฟล์ภาพยศ)' : 'Select Role Icon (Choose Preset or Custom Image)'}
                        </label>

                        {/* Preset Icon Grid */}
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-black/30 border border-white/5">
                          {AVAILABLE_ROLE_ICONS.map(item => {
                            const ItemIcon = item.icon;
                            const isCurrent = role.icon === item.name;
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => {
                                  const newRoles = [...roles];
                                  newRoles[i].icon = item.name;
                                  setRoles(newRoles);
                                }}
                                className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                  isCurrent 
                                    ? 'bg-[#ff2a44] border-[#ff2a44] text-white shadow-md scale-105' 
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                                }`}
                                title={item.name}
                              >
                                <ItemIcon size={15} />
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Image Icon Option */}
                        <div className="flex gap-2 items-center pt-1">
                          <input 
                            type="text" 
                            value={isCustomImage ? role.icon : ''} 
                            onChange={e => {
                              const newRoles = [...roles];
                              newRoles[i].icon = e.target.value;
                              setRoles(newRoles);
                            }} 
                            placeholder={lang === 'th' ? 'วางลิงก์รูปภาพยศ (URL) เช่น https://... หรือคลิกอัปโหลด' : 'Paste custom image URL or upload'}
                            className="flex-1 bg-white/[0.03] border border-white/10 focus:border-[#ff2a44] rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
                          />
                          <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0">
                            <Upload size={12} />
                            <span>{lang === 'th' ? 'อัปโหลดรูปยศ' : 'Upload'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, url => {
                                    const newRoles = [...roles];
                                    newRoles[i].icon = url;
                                    setRoles(newRoles);
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: MEMBER MANAGEMENT */}
          {activeTab === 'members' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="text-[#ff2a44]" size={22} />
                    {t.adminDash?.membersTab || 'Member Management'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">
                    {lang === 'th' ? 'ค้นหา ดูข้อมูล Discord ละเอียด ปรับยศ แบน/ปลดแบน และลบสมาชิก' : 'Search, view detailed Discord profiles, assign roles, ban/unban, or delete'}
                  </p>
                </div>

                {/* Member Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="text" 
                    value={memberSearch} 
                    onChange={e => setMemberSearch(e.target.value)} 
                    placeholder={lang === 'th' ? 'ค้นหาชื่อ, slug, หรือ Discord ID...' : 'Search name, slug, or ID...'}
                    className="w-full bg-black/50 border border-white/15 focus:border-[#ff2a44] rounded-2xl py-2 pl-10 pr-4 text-xs text-white outline-none"
                  />
                  {memberSearch && (
                    <button 
                      onClick={() => setMemberSearch('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Role Quick Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setAdminRoleFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    adminRoleFilter === 'all'
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {lang === 'th' ? 'ทั้งหมด' : 'All'} ({members.length})
                </button>
                {roles.map(r => {
                  const count = members.filter(m => m.roleId === r.id).length;
                  const isSelected = adminRoleFilter === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAdminRoleFilter(r.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected 
                          ? 'shadow-md font-bold' 
                          : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10'
                      }`}
                      style={isSelected ? {
                        backgroundColor: r.color || '#ff2a44',
                        color: r.contrastColor || '#ffffff',
                        borderColor: `${r.contrastColor || '#ffffff'}60`,
                        boxShadow: `0 0 12px ${(r.color || '#ff2a44')}40`
                      } : {}}
                    >
                      {r.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Members List */}
              <div className="grid grid-cols-1 gap-3.5">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                    <Users size={36} className="mx-auto text-white/20 mb-2" />
                    <p className="text-white/40 text-xs">ไม่พบสมาชิกที่ตรงกับการค้นหา</p>
                  </div>
                ) : (
                  filteredMembers.map(member => {
                    const currentRole = roles.find(r => r.id === member.roleId);
                    const isBanned = Boolean(member.banned);

                    return (
                      <div 
                        key={member.id} 
                        className={`bg-black/45 border p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isBanned ? 'border-red-500/40 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Member Identity & Custom Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-md">
                              <img 
                                src={member.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                                alt={member.name}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            {isBanned && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold shadow-md z-10" title="Banned">
                                !
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white truncate">{member.name || 'Operative'}</h4>
                              {isBanned ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                                  BANNED
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                                  ACTIVE
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/50 font-mono">
                              <span>slug: {member.slug || member.id}</span>
                              <span>•</span>
                              <span>{member.views || 0} views</span>
                            </div>

                            {/* Current Rank Badge */}
                            <span 
                              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5" 
                              style={{ 
                                color: currentRole?.contrastColor || currentRole?.color || '#ff2a44', 
                                backgroundColor: currentRole?.color || '#ff2a44',
                                border: `1px solid ${currentRole?.contrastColor || '#ffffff'}40` 
                              }}
                            >
                              {currentRole?.name || 'Member'}
                            </span>
                          </div>
                        </div>

                        {/* Actions: View Discord Details, Role Select, Ban/Unban, Delete */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                          
                          {/* View Discord Info Details Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedMemberModal(member)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                            title="ดูข้อมูล Discord ละเอียด"
                          >
                            <Info size={13} className="text-[#5865F2]" />
                            <span>ดูข้อมูล Discord</span>
                          </button>

                          {/* Role Dropdown */}
                          <select 
                            value={member.roleId || ''} 
                            onChange={(e) => handleRoleChange(member.id, e.target.value)} 
                            className="bg-white/[0.05] border border-white/10 focus:border-[#ff2a44] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                          >
                            {roles.map(r => <option key={r.id} value={r.id} className="bg-neutral-900">{r.name}</option>)}
                          </select>

                          {/* Ban / Unban Button (with Confirmation) */}
                          {isBanned ? (
                            <button 
                              onClick={() => handleUnbanMember(member)} 
                              className="px-3 py-1.5 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="ปลดแบนสมาชิก"
                            >
                              <Check size={13} />
                              <span>ปลดแบน</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleBanMember(member)} 
                              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="แบนสมาชิก"
                            >
                              <ShieldAlert size={13} />
                              <span>แบน</span>
                            </button>
                          )}

                          {/* Delete Member Button (with Confirmation) */}
                          <button 
                            onClick={() => handleDeleteMember(member)} 
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
                            title="ลบข้อมูลถาวร"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: APPLICATIONS */}
          {activeTab === 'applications' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-5">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="text-[#ff2a44]" size={22} />
                  {t.adminDash?.appTab || 'Pending Applications'}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">
                  {lang === 'th' ? 'ตรวจสอบและอนุมัติผู้เล่นที่ส่งใบสมัครเข้าแก๊ง' : 'Review candidates requesting syndicate membership'}
                </p>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                  <UserPlus size={40} className="mx-auto text-white/20 mb-3" />
                  <p className="text-white/40 text-sm font-medium">
                    {lang === 'th' ? 'ยังไม่มีใบสมัครที่รอดำเนินการ' : 'No pending applications at this time.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div 
                      key={app.id} 
                      className="bg-black/45 border border-white/10 hover:border-white/20 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={app.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                          alt={app.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-white/15 bg-black/40" 
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{app.name}</h4>
                          <span className="text-[11px] text-white/40 font-mono">Discord ID: {app.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => approveApp(app)} 
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Check size={14} />
                          <span>{lang === 'th' ? 'อนุมัติ' : 'Approve'}</span>
                        </button>
                        <button 
                          onClick={() => rejectApp(app.id)} 
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          <X size={14} />
                          <span>{lang === 'th' ? 'ปฏิเสธ' : 'Reject'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </main>
      </div>

      {/* DISCORD DETAILS MODAL (ดูข้อมูล Discord ละเอียด) */}
      <AnimatePresence>
        {selectedMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b12] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5865F2]" />
                  <span>DISCORD PROFILE & OPERATIVE DOSSIER</span>
                </div>
                <button 
                  onClick={() => setSelectedMemberModal(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="flex items-center gap-4">
                <img 
                  src={selectedMemberModal.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                  alt="" 
                  className="w-16 h-16 rounded-2xl object-cover border border-white/15 bg-black" 
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedMemberModal.name}</h3>
                  <div className="text-xs text-[#5865F2] font-mono font-medium">
                    @{selectedMemberModal.discordUsername || selectedMemberModal.name}
                  </div>
                  <div className="text-[11px] text-white/40 font-mono mt-0.5">
                    User ID: {selectedMemberModal.discordId || selectedMemberModal.id}
                  </div>
                </div>
              </div>

              {/* Detailed Data Table */}
              <div className="space-y-2.5 bg-black/50 p-4 rounded-2xl border border-white/5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">ชื่อที่ตั้งเอง (Custom Name):</span>
                  <span className="font-semibold text-white">{selectedMemberModal.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">ที่อยู่ URL (Slug):</span>
                  <span className="font-mono text-white/80">{selectedMemberModal.slug || selectedMemberModal.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">โน้ต / สถานะ Discord (Activity):</span>
                  <span className="text-white/90">{selectedMemberModal.discordStatusText || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">ตราเซิร์ฟเวอร์ (Badge/Clan Tag):</span>
                  <span className="font-mono font-bold text-white/90">{selectedMemberModal.discordBadge || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">Roblox Account:</span>
                  <span className="text-white/90 font-mono">
                    {selectedMemberModal.robloxUsername ? `@${selectedMemberModal.robloxUsername} (ID: ${selectedMemberModal.robloxUserId || '-'})` : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">ยอดเข้าชม (Total Views):</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedMemberModal.views || 0} ครั้ง</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">ยศ / ตำแหน่ง (Role):</span>
                  <select 
                    value={selectedMemberModal.roleId || ''} 
                    onChange={(e) => handleRoleChange(selectedMemberModal.id, e.target.value)} 
                    className="bg-white/[0.08] border border-white/20 focus:border-[#ff2a44] rounded-xl px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
                  >
                    {roles.map(r => <option key={r.id} value={r.id} className="bg-neutral-900">{r.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/40">สถานะการใช้งาน (Status):</span>
                  <span className={`font-bold ${selectedMemberModal.banned ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedMemberModal.banned ? 'BANNED / ถูกระงับ' : 'ACTIVE / ปกติ'}
                  </span>
                </div>
              </div>

              {/* Bio Preview */}
              {selectedMemberModal.bio && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-white/70 italic">
                  "{selectedMemberModal.bio}"
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={`/bio/${selectedMemberModal.slug || selectedMemberModal.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink size={13} />
                  <span>เปิดดูหน้า Bio</span>
                </a>

                <div className="flex items-center gap-2">
                  {selectedMemberModal.banned ? (
                    <button
                      onClick={() => handleUnbanMember(selectedMemberModal)}
                      className="px-3.5 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      ปลดแบน
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBanMember(selectedMemberModal)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      แบนสมาชิก
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMember(selectedMemberModal)}
                    className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    ลบถาวร
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
