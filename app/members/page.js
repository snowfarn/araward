import { getSiteSettings, getMembers, getRoles } from '@/lib/data';
import ParticleBackground from '@/components/ParticleBackground';
import RosterContent from '@/components/RosterContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MembersPage() {
  const settings = await getSiteSettings();
  const allMembers = await getMembers();
  const members = allMembers.filter(m => !m.banned);
  const roles = await getRoles();

  return (
    <main className="min-h-screen flex flex-col relative pb-20 overflow-x-hidden">
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

      <RosterContent 
        settings={settings} 
        initialMembers={members} 
        initialRoles={roles} 
      />
    </main>
  );
}
