'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIVITY_EVENTS, type ActivityEvent } from '@/lib/constants';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<ActivityEvent['type'], string> = {
  matched: 'matched',
  gap:     'gap',
  started: 'started',
  hired:   'hired ✓',
};

const TYPE_COLOR: Record<ActivityEvent['type'], string> = {
  matched: 'text-[var(--color-accent)]',
  gap:     'text-[var(--color-warn)]',
  started: 'text-[var(--color-muted)]',
  hired:   'text-[var(--color-ok)]',
};

/* Fixed pixel height for every row. Must match what you'd get from h-9 (36px).
   Defined in JS so the container can set an explicit height equal to rows * ROW_H,
   preventing any reflow when AnimatePresence mounts/unmounts content inside. */
const ROW_H = 36;

interface Props {
  rows?: number;
  intervalMs?: number;
}

export function ActivityTicker({ rows = 4, intervalMs = 2200 }: Props) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setOffset((n) => (n + 1) % ACTIVITY_EVENTS.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [intervalMs]);

  return (
    /* Outer wrapper: total height is exactly rows × ROW_H so the parent's
       border-radius and overflow-hidden clip cleanly with no fractional pixels. */
    <div style={{ height: rows * ROW_H }}>
      {Array.from({ length: rows }, (_, rowPos) => {
        const eventIdx = (offset + rowPos) % ACTIVITY_EVENTS.length;
        const isLast   = rowPos === rows - 1;

        return (
          /* Row shell: fixed height + overflow-hidden.
             The border-b is on the shell, not inside AnimatePresence,
             so it never duplicates or disappears during enter/exit. */
          <div
            key={rowPos}
            className={cn(
              'relative overflow-hidden',
              !isLast && 'border-b border-[var(--color-rule)]',
            )}
            style={{ height: ROW_H }}
          >
            <AnimatePresence initial={false}>
              {/* key=eventIdx → AnimatePresence diffs per event, not per render.
                  position:absolute + inset-0 → entering and exiting content both
                  fill the fixed shell simultaneously with no layout shift. */}
              <motion.div
                key={eventIdx}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -7 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center gap-2 px-3.5"
              >
                {/* Badge: fixed width so columns stay aligned across all label lengths.
                    "hired ✓" is the longest label — 52 px covers it at 9 px mono uppercase. */}
                <span
                  className={cn(
                    'mono w-[52px] shrink-0 text-[9px] uppercase leading-none tracking-[0.04em]',
                    TYPE_COLOR[ACTIVITY_EVENTS[eventIdx].type],
                  )}
                >
                  {TYPE_LABEL[ACTIVITY_EVENTS[eventIdx].type]}
                </span>

                {/* Text block: flex so the detail string can truncate independently.
                    min-w-0 on the container lets it shrink below its content width. */}
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <span className="shrink-0 text-[11px] font-medium leading-none text-[var(--color-ink)]">
                    {ACTIVITY_EVENTS[eventIdx].who}
                  </span>
                  {/* flex-1 + min-w-0 + overflow-hidden → truncation works even
                      though this is a span (flex children are block-level contexts). */}
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-none text-[var(--color-muted)]">
                    {ACTIVITY_EVENTS[eventIdx].detail}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
