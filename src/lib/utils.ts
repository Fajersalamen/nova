export function buildWhatsAppLink(phoneWhatsapp: string, message: string): string {
  const digitsOnly = phoneWhatsapp.replace(/[^\d]/g, '');
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${digitsOnly}?${params.toString()}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    price,
  );
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
