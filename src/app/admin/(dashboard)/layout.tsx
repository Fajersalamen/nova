import type { ReactNode } from 'react';
import { requireAdminSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminNav
        restaurantName={session.restaurant.name}
        restaurantSlug={session.restaurant.slug}
        email={session.email}
      />
      <div className="mt-8">{children}</div>
    </div>
  );
}
