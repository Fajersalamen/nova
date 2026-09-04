'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Upload, X } from 'lucide-react';
import { customCakeOptions } from '@/data/frankies-cake/content';
import { builderFlavors, builderSizes } from './builderOptions';
import { ChoiceGrid } from './ChoiceGrid';
import { ProgressIndicator } from './ProgressIndicator';
import { Button } from '../ui/Button';
import { easeLuxe } from '@/lib/frankies-cake/motion';
import { useLockBodyScroll } from '@/lib/frankies-cake/useLockBodyScroll';
import { useEscapeKey } from '@/lib/frankies-cake/useEscapeKey';

type BuilderState = {
  size: (typeof builderSizes)[number]['code'] | null;
  flavor: (typeof builderFlavors)[number] | null;
  filling: string | null;
  color: string | null;
  decoration: string | null;
  imagePreview: string | null;
  notes: string;
};

const STEPS = ['Size', 'Flavor', 'Filling', 'Color', 'Decoration', 'Inspiration', 'Notes', 'Review'] as const;

const sizeLabelByCode = Object.fromEntries(
  builderSizes.map((s) => [s.code, `${s.code} · ${s.inches}" (${s.servings})`]),
) as Record<(typeof builderSizes)[number]['code'], string>;
const sizeLabels = Object.values(sizeLabelByCode);
const sizeCodeByLabel = Object.fromEntries(
  builderSizes.map((s) => [sizeLabelByCode[s.code], s.code]),
) as Record<string, (typeof builderSizes)[number]['code']>;

const initialState: BuilderState = {
  size: null,
  flavor: null,
  filling: null,
  color: null,
  decoration: null,
  imagePreview: null,
  notes: '',
};

export function CustomCakeBuilder({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [state, setState] = useState<BuilderState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  useLockBodyScroll(true);
  useEscapeKey(onClose);

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function update<K extends keyof BuilderState>(key: K, value: BuilderState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    update('imagePreview', URL.createObjectURL(file));
  }

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return !!state.size;
      case 1:
        return !!state.flavor;
      case 2:
        return !!state.filling;
      case 3:
        return !!state.color;
      case 4:
        return !!state.decoration;
      default:
        return true;
    }
  })();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-fc-cocoa/55 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.5, ease: easeLuxe }}
        className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-fc-paper shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-fc-cream text-fc-cocoa transition hover:bg-fc-cream-dark"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {submitted ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fc-sage/15 text-fc-sage">
              <Check className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h3 className="font-fc-serif text-3xl text-fc-cocoa">Request Submitted</h3>
            <p className="max-w-sm text-sm leading-relaxed text-fc-cocoa-light">
              Thank you for imagining this with us. Our cake designers will review your request and
              reach out within 24 hours to confirm details and pricing.
            </p>
            <Button variant="outline" onClick={onClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-fc-cocoa/10 px-6 py-6 sm:px-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fc-gold">
                Custom Cake
              </span>
              <h3 className="mt-1 font-fc-serif text-2xl text-fc-cocoa">{STEPS[step]}</h3>
              <div className="mt-4">
                <ProgressIndicator step={step} total={STEPS.length} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -24 }}
                  transition={{ duration: 0.35, ease: easeLuxe }}
                >
                  {step === 0 && (
                    <ChoiceGrid
                      options={sizeLabels}
                      value={state.size ? sizeLabelByCode[state.size] : null}
                      onChange={(v) => update('size', sizeCodeByLabel[v] ?? null)}
                    />
                  )}
                  {step === 1 && (
                    <ChoiceGrid options={builderFlavors} value={state.flavor} onChange={(v) => update('flavor', v)} />
                  )}
                  {step === 2 && (
                    <ChoiceGrid
                      options={customCakeOptions.fillings}
                      value={state.filling}
                      onChange={(v) => update('filling', v)}
                    />
                  )}
                  {step === 3 && (
                    <div className="flex flex-wrap gap-4">
                      {customCakeOptions.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => update('color', c.name)}
                          className="flex flex-col items-center gap-2"
                        >
                          <span
                            style={{ backgroundColor: c.hex }}
                            className={`h-11 w-11 rounded-full border shadow-sm transition ${
                              state.color === c.name
                                ? 'border-fc-cocoa ring-2 ring-fc-cocoa ring-offset-2 ring-offset-fc-paper'
                                : 'border-fc-cocoa/10'
                            }`}
                          />
                          <span className="text-[11px] text-fc-cocoa-light">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {step === 4 && (
                    <ChoiceGrid
                      options={customCakeOptions.decorations}
                      value={state.decoration}
                      onChange={(v) => update('decoration', v)}
                    />
                  )}
                  {step === 5 && (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-fc-cocoa/20 px-6 py-12 text-center transition hover:border-fc-cocoa/40">
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      {state.imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={state.imagePreview} alt="Inspiration" className="h-32 w-32 rounded-xl object-cover" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-fc-cocoa-light" strokeWidth={1.5} />
                          <span className="text-sm text-fc-cocoa-light">
                            Upload an inspiration photo (optional)
                          </span>
                        </>
                      )}
                    </label>
                  )}
                  {step === 6 && (
                    <textarea
                      value={state.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      rows={5}
                      placeholder="Tell us about the occasion, allergy notes, or anything else we should know…"
                      className="w-full resize-none rounded-xl border border-fc-cocoa/15 bg-fc-cream px-4 py-3 text-sm text-fc-cocoa placeholder:text-fc-cocoa-light/50 focus:border-fc-cocoa/40"
                    />
                  )}
                  {step === 7 && (
                    <dl className="space-y-3 text-sm">
                      {[
                        ['Size', state.size ?? '—'],
                        ['Flavor', state.flavor ?? '—'],
                        ['Filling', state.filling ?? '—'],
                        ['Color', state.color ?? '—'],
                        ['Decoration', state.decoration ?? '—'],
                        ['Notes', state.notes || '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-fc-cocoa/10 pb-3">
                          <dt className="text-fc-cocoa-light">{label}</dt>
                          <dd className="max-w-[60%] text-right font-medium text-fc-cocoa">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-fc-cocoa/10 px-6 py-5 sm:px-8">
              <button
                onClick={() => go(step - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm text-fc-cocoa-light transition hover:text-fc-cocoa disabled:opacity-0"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Back
              </button>
              {step === STEPS.length - 1 ? (
                <Button onClick={() => setSubmitted(true)}>Submit Request</Button>
              ) : (
                <Button onClick={() => go(step + 1)} disabled={!canAdvance} showArrow>
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
