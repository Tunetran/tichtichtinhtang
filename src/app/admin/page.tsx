import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/auth';
import { getEventConfig } from '@/lib/event-settings';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getEventConfig();
  return {
    title: `Quản Trị Khách Mời — ${config.eventName}`,
    description: 'Trang quản trị khách mời, theo dõi phản hồi và yêu cầu bài hát',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AdminPage() {
  const [isAuth, config] = await Promise.all([
    isAdminAuthenticated(),
    getEventConfig(),
  ]);

  if (!isAuth) {
    return <AdminLoginForm eventName={config.eventName} />;
  }

  return <AdminDashboard />;
}
