import { CallButton } from './CallButton';

interface Props {
  restaurantName: string;
  address: string | null;
  phoneWhatsapp: string;
  hasMenu: boolean;
  hasMap: boolean;
}

export function SiteFooter({ restaurantName, address, phoneWhatsapp, hasMenu, hasMap }: Props) {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-accent-400 sm:text-3xl">جاهز تطلب؟ اتصل فينا.</h2>
        <div className="mt-5 flex justify-center">
          <CallButton
            phone={phoneWhatsapp}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-center sm:grid-cols-3 sm:px-6 sm:text-right">
          <div>
            <h3 className="mb-3 font-bold text-accent-400">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li dir="ltr" className="text-center sm:text-right">
                {phoneWhatsapp}
              </li>
              {address && <li>{address}</li>}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-accent-400">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#hero" className="transition hover:text-white">
                  الرئيسية
                </a>
              </li>
              {hasMenu && (
                <li>
                  <a href="#menu-heading" className="transition hover:text-white">
                    القائمة
                  </a>
                </li>
              )}
              {hasMap && (
                <li>
                  <a href="#map-heading" className="transition hover:text-white">
                    موقعنا
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="text-sm text-white/70 sm:text-right">
            <p className="text-lg font-bold text-accent-400">{restaurantName}</p>
            <p className="mt-2">موقعك على منصة نوفا لمواقع المطاعم.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {restaurantName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
