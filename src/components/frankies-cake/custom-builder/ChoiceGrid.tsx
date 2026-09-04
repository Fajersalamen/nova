export function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-xl border px-5 py-3.5 text-sm transition ${
            value === opt
              ? 'border-fc-cocoa bg-fc-cocoa text-fc-cream'
              : 'border-fc-cocoa/15 text-fc-cocoa-light hover:border-fc-cocoa/40'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
