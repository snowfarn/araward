import { getSiteSettings, getRoles, getMembers, getApplications } from '@/lib/data';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const settings = await getSiteSettings();
  const roles = await getRoles();
  const members = await getMembers();
  const applications = await getApplications();

  return (
    <AdminClient 
      initialSettings={settings}
      initialRoles={roles}
      initialMembers={members}
      initialApplications={applications}
    />
  );
}
