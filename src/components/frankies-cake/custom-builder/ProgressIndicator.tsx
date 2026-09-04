import { motion } from 'framer-motion';

export function ProgressIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-fc-cocoa/10">
        <motion.div
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-fc-gold"
        />
      </div>
      <span className="whitespace-nowrap text-xs text-fc-cocoa-light">
        {step + 1} / {total}
      </span>
    </div>
  );
}
