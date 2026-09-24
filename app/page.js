import { getSiteSettings, getMembers } from '@/lib/data';
import ParticleBackground from '@/components/ParticleBackground';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || 'Slumzick';
  const description = settings.description || 'ศูนย์รวมสมาชิกสายเลือดแท้ ความเป็นเอกภาพ และพลังที่ไม่มีใครเทียบได้';
  const bannerImg = settings.logoUrl || settings.backgroundUrl || '/banner.png';

  return {
    title: `${siteName} • Official Syndicate Portal`,
    description: description,
    openGraph: {
      title: `${siteName.toUpperCase()} SYNDICATE`,
      description: description,
      images: [
        {
          url: bannerImg,
          width: 800,
          height: 800,
          alt: siteName,
        }
      ],
      type: 'website',
      siteName: siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName.toUpperCase()} SYNDICATE`,
      description: description,
      images: [bannerImg],
    },
  };
}

export async function generateViewport() {
  const settings = await getSiteSettings();
  return {
    themeColor: settings.primaryColor || '#ff2a44',
  };
}

export default async function Home() {
  const settings = await getSiteSettings();
  const members = await getMembers();

  return (
    <main className="min-h-screen flex flex-col justify-between items-center relative pt-2 sm:pt-3 pb-4 sm:pb-6 px-3 sm:px-6 overflow-x-hidden">
      {/* Background Image Setup */}
      <div 
        className="fixed inset-0 -z-20 bg-[#040407] bg-cover bg-center bg-no-repeat site-bg-overlay"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(4, 4, 7, 0.75)), url(${settings.backgroundUrl || '/banner.png'})` 
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none site-bg-overlay" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(18, 2, 6, 0.45) 75%, rgba(0, 0, 0, 0.94) 100%)' }} />

      <ParticleBackground 
        type={settings.particleType || 'embers'} 
        color={settings.primaryColor || '#ff2a44'} 
        speed={settings.particleSpeed || 1}
        density={settings.particleDensity || 1}
      />
      
      <HomeContent settings={settings} membersCount={members.length} />
    </main>
  );
}
