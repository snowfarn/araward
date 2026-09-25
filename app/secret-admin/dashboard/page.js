import { getSiteSettings, getRoles, getMembers, getApplications } from '@/lib/data';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [settings, roles, members, applications] = await Promise.all([
    getSiteSettings(),
    getRoles(),
    getMembers(),
    getApplications()
  ]);

  return (
    <AdminClient 
      initialSettings={settings}
      initialRoles={roles}
      initialMembers={members}
      initialApplications={applications}
    />
  );
}
