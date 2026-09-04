'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

type CheckoutViewProps = {
  subtotal: number;
  onBack: () => void;
  onSubmit: () => void;
};

const inputClass =
  'w-full rounded-lg border border-fc-cocoa/15 bg-fc-cream px-4 py-3 text-sm text-fc-cocoa placeholder:text-fc-cocoa-light/50 transition focus:border-fc-cocoa/40';

export function CheckoutView({ subtotal, onBack, onSubmit }: CheckoutViewProps) {
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // No order backend exists yet — this simulates the network round trip
    // so the flow reads correctly; wire this to a real endpoint later.
    setTimeout(() => {
      setSubmitting(false);
      onSubmit();
    }, 900);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-fc-cocoa-light transition hover:text-fc-cocoa"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to bag
        </button>

        <div className="grid grid-cols-2 gap-2">
          {(['delivery', 'pickup'] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setFulfillment(option)}
              className={`rounded-lg border px-4 py-3 text-sm capitalize transition ${
                fulfillment === option
                  ? 'border-fc-cocoa bg-fc-cocoa text-fc-cream'
                  : 'border-fc-cocoa/15 text-fc-cocoa-light hover:border-fc-cocoa/40'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input required placeholder="Full name" className={inputClass} />
          <input required type="tel" placeholder="Phone number" className={inputClass} />
          {fulfillment === 'delivery' ? (
            <input required placeholder="Delivery address" className={inputClass} />
          ) : (
            <p className="rounded-lg bg-fc-cream-dark px-4 py-3 text-xs text-fc-cocoa-light">
              Pickup from AlJubiha Club, Jawhar As Siqilill, Amman.
            </p>
          )}
          <textarea placeholder="Notes for your order (optional)" rows={3} className={`${inputClass} resize-none`} />
        </div>
      </div>

      <div className="border-t border-fc-cocoa/10 px-6 py-6 sm:px-8">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-fc-cocoa-light">Total due on {fulfillment === 'delivery' ? 'delivery' : 'pickup'}</span>
          <span className="font-fc-serif text-lg text-fc-cocoa">{subtotal.toFixed(2)} JD</span>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Placing your order…' : 'Place Order'}
        </Button>
      </div>
    </form>
  );
}
