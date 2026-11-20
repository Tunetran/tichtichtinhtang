import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/auth';
import { EVENT_CONFIG } from '@/config/event';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Quản Trị Khách Mời — ${EVENT_CONFIG.eventName}`,
  description: 'Trang quản trị khách mời, theo dõi phản hồi và yêu cầu bài hát',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const isAuth = await isAdminAuthenticated();

  if (!isAuth) {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
