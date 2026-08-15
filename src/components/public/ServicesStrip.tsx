import { Car, Clock, Package, UtensilsCrossed } from 'lucide-react';

interface Props {
  hasDineIn: boolean;
  hasDelivery: boolean;
  hasDriveThru: boolean;
  hoursLabel: string | null;
}

/**
 * Only real, admin-confirmed operational facts — never a default claim
 * like "delivery" or "24 hours" invented for a tenant that hasn't said so.
 */
export function ServicesStrip({ hasDineIn, hasDelivery, hasDriveThru, hoursLabel }: Props) {
  const items = [
    hoursLabel && { icon: Clock, label: hoursLabel },
    hasDineIn && { icon: UtensilsCrossed, label: 'تناول في المطعم' },
    hasDriveThru && { icon: Car, label: 'درايف ثرو' },
    hasDelivery && { icon: Package, label: 'توصيل بدون تلامس' },
  ].filter((item): item is { icon: typeof Clock; label: string } => Boolean(item));

  if (items.length === 0) return null;

  const gridCols =
    items.length >= 4 ? 'md:grid-cols-4' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <section className="bg-brand-600 text-white">
      <div className={`mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 ${gridCols}`}>
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2.5 text-sm font-black">
            <item.icon className="h-5 w-5 text-accent-400" aria-hidden />
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}
