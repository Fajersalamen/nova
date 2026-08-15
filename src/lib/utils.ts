export function formatPrice(price: number, locale: 'ar' | 'en' = 'ar'): string {
  // Explicit -u-nu-latn: some ICU builds render plain 'ar' with Arabic-Indic
  // digits (٠١٢...) even though every screenshot of this site uses Latin
  // digits — pin the numbering system so prices don't silently flip
  // depending on the runtime's ICU data, independent of the site's
  // Arabic/English UI toggle.
  const intlLocale = locale === 'ar' ? 'ar-u-nu-latn' : 'en';
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
