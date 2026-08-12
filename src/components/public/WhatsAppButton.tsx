import { buildWhatsAppLink } from '@/lib/utils';

interface Props {
  phoneWhatsapp: string;
  restaurantName: string;
  itemName?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A plain anchor to wa.me — no SDK, no JS bundle. Works on mobile (opens
 * the app) and desktop (opens WhatsApp Web) out of the box.
 */
export function WhatsAppButton({
  phoneWhatsapp,
  restaurantName,
  itemName,
  className,
  children,
}: Props) {
  const message = itemName
    ? `مرحبًا ${restaurantName}، أريد طلب: ${itemName}`
    : `مرحبًا ${restaurantName}، أريد الاستفسار عن الطلبات.`;

  return (
    <a
      href={buildWhatsAppLink(phoneWhatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        'inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1da851]'
      }
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2" />
      </svg>
      {children ?? 'اطلب عبر واتساب'}
    </a>
  );
}
