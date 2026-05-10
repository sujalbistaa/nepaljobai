'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { COPY, DEMO_PRESETS, type DemoPreset } from '@/lib/constants';
import { useLang } from '@/lib/store';
import { cn, formatNPR } from '@/lib/utils';
import { ActivityTicker } from './ActivityTicker';

type DemoState =
  | { kind: 'empty' }
  | { kind: 'loading'; preset: DemoPreset; lineIdx: number }
  | { kind: 'result'; preset: DemoPreset };

const ANALYSIS_LINES = [
  '› parsing skills...',
  '› embedding vector...',
  '› cosine sim against 1,247 roles...',
  '› ranking top 50...',
  '› ✓ done',
];

export function TryItDemo() {
  const [lang] = useLang();
  const t = COPY[lang].demo;
  const [state, setState] = useState<DemoState>({ kind: 'empty' });

  // Drive the analysis log animation.
  useEffect(() => {
    if (state.kind !== 'loading') return;
    if (state.lineIdx >= ANALYSIS_LINES.length) {
      const id = setTimeout(() => setState({ kind: 'result', preset: state.preset }), 450);
      return () => clearTimeout(id);
    }
    const id = setTimeout(
      () => setState({ ...state, lineIdx: state.lineIdx + 1 }),
      350,
    );
    return () => clearTimeout(id);
  }, [state]);

  function runDemo(preset: DemoPreset) {
    setState({ kind: 'loading', preset, lineIdx: 0 });
  }

  function reset() {
    setState({ kind: 'empty' });
  }

  return (
    <div className="w-full">
      {/* Header strip — visible in all states */}
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            'mono text-[10px] tracking-[0.16em] text-[var(--color-muted)]',
            lang === 'ne' && 'lang-ne',
          )}
        >
          {state.kind === 'empty' ? t.tryNow : t.analyzing.toUpperCase()}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative inline-block size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
            <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]" />
          </span>
          <span
            className={cn(
              'mono text-[10px] tracking-[0.04em] text-[var(--color-accent)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.live}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state.kind === 'empty' && <EmptyState key="empty" onRun={runDemo} />}
        {state.kind === 'loading' && <LoadingState key="loading" lineIdx={state.lineIdx} />}
        {state.kind === 'result' && (
          <ResultState key="result" preset={state.preset} onReset={reset} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── EMPTY ─────────────────────────── */

function EmptyState({ onRun }: { onRun: (p: DemoPreset) => void }) {
  const [lang] = useLang();
  const t = COPY[lang].demo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Drop zone */}
      <Link
        href="/upload"
        className={cn(
          'group block cursor-pointer rounded-[var(--radius-md)] border-[1.5px] border-dashed border-[var(--color-rule-2)] bg-[var(--color-paper)] px-6 py-12 text-center transition-all',
          'hover:border-[var(--color-accent)] hover:bg-[var(--color-paper-2)]',
        )}
      >
        <Upload className="mx-auto mb-3 size-10 text-[var(--color-accent)]" strokeWidth={1.5} />
        <div
          className={cn(
            'mb-1.5 text-[16px] font-medium text-[var(--color-ink)]',
            lang === 'ne' && 'lang-ne',
          )}
        >
          {t.dropTitle}
        </div>
        <div className={cn('mb-4 text-[13px] text-[var(--color-muted)]', lang === 'ne' && 'lang-ne')}>
          {t.dropSub}
        </div>
        <div
          className={cn(
            'mono mb-2 text-[10px] tracking-[0.04em] text-[var(--color-muted-2)]',
            lang === 'ne' && 'lang-ne',
          )}
        >
          {t.orQuick}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5" onClick={(e) => e.preventDefault()}>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRun(preset);
              }}
              className={cn(
                'rounded-[3px] border border-[var(--color-rule-2)] bg-transparent px-2.5 py-1 text-[11px] text-[var(--color-ink)]',
                'transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Link>

      {/* Live ticker */}
      <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="flex items-center justify-between border-b border-[var(--color-rule)] px-3.5 py-2">
          <span
            className={cn(
              'mono text-[9px] uppercase tracking-[0.06em] text-[var(--color-muted)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.happeningNow}
          </span>
          <span className="mono text-[9px] text-[var(--color-muted)]">14s ago</span>
        </div>
        <ActivityTicker rows={5} intervalMs={2200} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── LOADING ─────────────────────────── */

function LoadingState({ lineIdx }: { lineIdx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-6 py-10 min-h-[520px]"
    >
      <div className="mono space-y-1.5 text-[12px] leading-relaxed text-[var(--color-ink)]">
        {ANALYSIS_LINES.slice(0, lineIdx).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── RESULT ─────────────────────────── */

function ResultState({
  preset,
  onReset,
}: {
  preset: DemoPreset;
  onReset: () => void;
}) {
  const [lang] = useLang();
  const t = COPY[lang].demo;
  const r = preset.result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Result card */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] p-8">
        <div className="mb-4 flex items-baseline gap-1.5 border-b border-[var(--color-rule)] pb-4">
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="tabular text-[76px] font-medium leading-[0.85] tracking-[-0.045em] text-[var(--color-accent)]"
          >
            {r.score}
          </motion.span>
          <span
            className={cn(
              'text-[14px] text-[var(--color-muted)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.bestMatch}
          </span>
        </div>
        <div
          className={cn(
            'mono mb-1.5 text-[10px] uppercase tracking-[0.04em] text-[var(--color-muted)]',
            lang === 'ne' && 'lang-ne',
          )}
        >
          {t.topResult}
        </div>
        <div className="mb-1 text-[16px] font-medium tracking-[-0.01em] text-[var(--color-ink)]">
          {r.role}
        </div>
        <div className="mb-4 text-[12px] text-[var(--color-muted)]">
          {r.company} · {r.location} · {formatNPR(r.salary)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onReset}
            className={cn(
              'text-[12px] text-[var(--color-accent)] underline-offset-4 hover:underline',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.tryAnother}
          </button>
          <span className="text-[11px] text-[var(--color-muted-2)]">·</span>
          <Link
            href="/sign-up"
            className={cn(
              'rounded-[3px] bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-paper)] transition-colors hover:bg-[var(--color-ink-2)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.seeAll.replace('47', String(r.matches))}
          </Link>
        </div>
      </div>

      {/* Mini live signal */}
      <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3.5 py-2.5">
        <div className="mb-1 flex items-center justify-between">
          <span
            className={cn(
              'mono text-[9px] uppercase tracking-[0.06em] text-[var(--color-muted)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.happeningNow}
          </span>
          <span className="flex items-center gap-1">
            <span className="relative inline-block size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]" />
            </span>
            <span
              className={cn(
                'mono text-[9px] text-[var(--color-accent)]',
                lang === 'ne' && 'lang-ne',
              )}
            >
              {t.live}
            </span>
          </span>
        </div>
        <div className={cn('text-[11px] text-[var(--color-ink)]', lang === 'ne' && 'lang-ne')}>
          3 {t.othersMatched}{' '}
          <span className="font-medium text-[var(--color-accent)]">85%+</span>{' '}
          {t.inLastMinute}
        </div>
      </div>
    </motion.div>
  );
}