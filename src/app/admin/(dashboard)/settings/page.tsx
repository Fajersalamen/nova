import { requireAdminSession } from '@/lib/auth';
import { RestaurantSettingsForm } from '@/components/admin/RestaurantSettingsForm';

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  return <RestaurantSettingsForm restaurant={session.restaurant} />;
}
