'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  th: {
    // Navigation
    nav: {
      home: 'หน้าแรก',
      roster: 'สมาชิกแก๊ง',
      dashboard: 'แดชบอร์ด',
      admin: 'ผู้ดูแลระบบ',
      welcome: 'ยินดีต้อนรับ',
      switchLang: 'เปลี่ยนภาษา'
    },
    // Home Page
    home: {
      statusLive: 'ระบบออนไลน์ • พร้อมปฏิบัติการ 24/7',
      gangTag: 'AMMAHIT SYNDICATE • องค์กรระดับแนวหน้า',
      slogan: 'อาณาจักรแห่งศักดิ์ศรีและความเป็นหนึ่ง',
      desc: 'ศูนย์รวมสมาชิกสายเลือดแท้ ความเป็นเอกภาพ และพลังที่ไม่มีใครเทียบได้',
      enterGang: 'เข้าสู่อาณาจักรแก๊ง',
      viewMembers: 'ดูทำเนียบสมาชิก & ยศตำแหน่ง',
      statMembers: 'สมาชิกระดับสูง',
      statTerritory: 'อัตราการคุมพื้นที่',
      statRep: 'ชื่อเสียงองค์กร',
      statRank: 'ลำดับองค์กร',
      quickAccess: 'เมนูลัดเข้าถึงไว',
      discordCommunity: 'ดิสคอร์ดทางการ',
      gangRules: 'กฎระเบียบแก๊ง',
      adminPortal: 'ระบบจัดการลับ',
      soundToggle: 'เสียงบรรยากาศ'
    },
    // Roster / Members Page
    roster: {
      badge: 'OFFICIAL ROSTER',
      title: 'ทำเนียบสมาชิก',
      subtitle: 'รายนามผู้มีเกียรติและตำแหน่งบังคับบัญชาทั้งหมดในองค์กร',
      searchPlaceholder: 'พิมพ์ค้นหาชื่อสมาชิก...',
      allRoles: 'ทั้งหมด',
      memberUnit: 'คน',
      viewProfile: 'ดูข้อมูลประวัติ',
      noMembers: 'ไม่พบรายชื่อสมาชิกที่ค้นหา'
    },
    // Bio
    bio: {
      back: 'กลับสู่ทำเนียบสมาชิก',
      role: 'ยศตำแหน่ง',
      status: 'สถานะปัจจุบัน',
      about: 'เกี่ยวกับสมาชิก',
      socials: 'ช่องทางการติดต่อ',
      online: 'พร้อมรบ',
      offline: 'ออฟไลน์'
    },
    // Admin Login
    adminLogin: {
      badge: 'SECURITY CLEARANCE',
      systemAccess: 'ระบบรักษาความปลอดภัย',
      restrictedArea: 'พื้นที่หวงห้ามเฉพาะระดับผู้บริหาร',
      accessCode: 'กรอกรหัสลับยืนยันตัวตน',
      authenticating: 'กำลังตรวจสอบสิทธิ์เข้าระบบ...',
      initialize: 'ยืนยันเพื่อเข้าสู่ระบบ',
      accessDenied: 'รหัสไม่ถูกต้อง! การเข้าถึงถูกปฏิเสธ',
      securityNotice: 'ระบบบันทึกความปลอดภัย • เข้ารหัสระดับสูง 256-BIT',
      backHome: 'กลับหน้าหลัก'
    },
    // Admin Dashboard
    adminDash: {
      title: 'ศูนย์บัญชาการหลังบ้าน',
      subtitle: 'จัดการข้อมูล ปรับแต่งเว็บ และควบคุมสมาชิกในองค์กร',
      settingsTab: 'ตั้งค่าเว็บไซต์',
      membersTab: 'จัดการสมาชิก',
      rolesTab: 'จัดการยศตำแหน่ง',
      appTab: 'ใบสมัครเข้าแก๊ง',
      save: 'บันทึกการเปลี่ยนแปลง',
      saved: 'บันทึกสำเร็จ!',
      logout: 'ออกจากระบบ',
      siteName: 'ชื่อเว็บไซต์ / แก๊ง',
      primaryColor: 'สีประจำแก๊ง (ธีม)',
      particleType: 'รูปแบบเอฟเฟกต์อนุภาค',
      musicUrl: 'ลิงก์เพลงบรรยากาศ (URL)',
      backgroundUrl: 'ภาพพื้นหลัง (URL)',
      addMember: 'เพิ่มสมาชิกใหม่',
      addRole: 'เพิ่มยศใหม่'
    }
  },
  en: {
    // Navigation
    nav: {
      home: 'HOME',
      roster: 'ROSTER',
      dashboard: 'DASHBOARD',
      admin: 'ADMIN PORTAL',
      welcome: 'WELCOME',
      switchLang: 'SWITCH LANGUAGE'
    },
    // Home Page
    home: {
      statusLive: 'SYSTEM OPERATIONAL • ACTIVE 24/7',
      gangTag: 'AMMAHIT SYNDICATE • ELITE TIER S',
      slogan: 'THE DOMAIN OF SUPREMACY & HONOR',
      desc: 'The union of unmatched power, ironclad loyalty, and legendary dominance.',
      enterGang: 'ENTER GANG PORTAL',
      viewMembers: 'VIEW MEMBERS & ROSTER',
      statMembers: 'ACTIVE MEMBERS',
      statTerritory: 'TERRITORY CONTROL',
      statRep: 'REPUTATION',
      statRank: 'GLOBAL TIER',
      quickAccess: 'QUICK PROTOCOLS',
      discordCommunity: 'OFFICIAL DISCORD',
      gangRules: 'GANG RULES',
      adminPortal: 'SECRET PORTAL',
      soundToggle: 'AMBIENT AUDIO'
    },
    // Roster / Members Page
    roster: {
      badge: 'OFFICIAL ROSTER',
      title: 'MEMBER DIRECTORY',
      subtitle: 'Complete verified roster and command hierarchy of the syndicate',
      searchPlaceholder: 'Search by member name...',
      allRoles: 'ALL RANKS',
      memberUnit: 'members',
      viewProfile: 'VIEW PROFILE',
      noMembers: 'No members found matching your search'
    },
    // Bio
    bio: {
      back: 'BACK TO ROSTER',
      role: 'RANK & TITLE',
      status: 'CURRENT STATUS',
      about: 'ABOUT OPERATIVE',
      socials: 'COMMUNICATION LINKS',
      online: 'COMBAT READY',
      offline: 'OFFLINE'
    },
    // Admin Login
    adminLogin: {
      badge: 'SECURITY CLEARANCE',
      systemAccess: 'SYSTEM ACCESS',
      restrictedArea: 'RESTRICTED EXECUTIVE AREA',
      accessCode: 'ENTER CLEARANCE CODE',
      authenticating: 'VERIFYING CREDENTIALS...',
      initialize: 'INITIALIZE SYSTEM',
      accessDenied: 'ACCESS DENIED • INVALID CODE',
      securityNotice: '256-BIT ENCRYPTED SESSION • MONITORED ACCESS',
      backHome: 'RETURN HOME'
    },
    // Admin Dashboard
    adminDash: {
      title: 'COMMAND HEADQUARTERS',
      subtitle: 'Manage syndicate records, site customization, and member rosters',
      settingsTab: 'SITE SETTINGS',
      membersTab: 'MEMBERS',
      rolesTab: 'RANKS & ROLES',
      appTab: 'APPLICATIONS',
      save: 'SAVE CHANGES',
      saved: 'SAVED SUCCESSFULLY!',
      logout: 'LOGOUT',
      siteName: 'GANG / SITE NAME',
      primaryColor: 'THEME COLOR',
      particleType: 'PARTICLE EFFECT',
      musicUrl: 'MUSIC STREAM URL',
      backgroundUrl: 'BACKGROUND IMAGE URL',
      addMember: 'ADD NEW MEMBER',
      addRole: 'CREATE NEW ROLE'
    }
  }
};

const LanguageContext = createContext({
  lang: 'th',
  setLang: () => {},
  toggleLang: () => {},
  t: translations.th
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('th');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('webgang_lang');
      if (saved === 'en' || saved === 'th') {
        setLang(saved);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('webgang_lang', newLang);
    } catch (e) {}
  };

  const toggleLang = () => {
    const next = lang === 'th' ? 'en' : 'th';
    changeLanguage(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, toggleLang, t: translations[lang] || translations.th }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { lang: 'th', setLang: () => {}, toggleLang: () => {}, t: translations.th };
  }
  return ctx;
}
