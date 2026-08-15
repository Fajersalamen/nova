interface Props {
  branchCount: number;
}

/**
 * Value props the platform can actually back for any tenant — no
 * unverified operational claims like "delivery" or "drive-thru" that
 * vary restaurant to restaurant and aren't tracked as real data yet.
 */
export function FeatureStrip({ branchCount }: Props) {
  const items = [
    { icon: PhoneIcon, label: 'اتصل واطلب مباشرة' },
    { icon: MenuIcon, label: 'قائمة محدّثة أول بأول' },
    branchCount > 1
      ? { icon: PinIcon, label: `${branchCount} فروع` }
      : { icon: PinIcon, label: 'موقعنا على الخريطة' },
    { icon: CheckIcon, label: 'طلب سهل وسريع' },
  ];

  return (
    <div className="bg-brand-600">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-5 text-white sm:grid-cols-4 sm:px-6">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2 text-center">
            <item.icon />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0 fill-none stroke-accent-400 stroke-2"
    >
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0 fill-none stroke-accent-400 stroke-2"
    >
      <path
        d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-accent-400">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0 fill-none stroke-accent-400 stroke-2"
    >
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
