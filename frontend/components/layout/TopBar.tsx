'use client';

import Link from 'next/link';
import { useLang } from '@/lib/store';
import { COPY, SITE } from '@/lib/constants';
import { LanguageToggle } from './LanguageToggle';
import { cn } from '@/lib/utils';

export function TopBar() {
  const [lang] = useLang();
  const t = COPY[lang].nav;

  return (
    <header className="w-full border-b border-[var(--color-rule)]">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-baseline gap-2.5" aria-label={SITE.name}>
          <span
            aria-hidden
            className="mono inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] bg-[var(--color-ink)] text-[11px] font-medium text-[var(--color-paper)]"
          >
            N
          </span>
          <span className="text-[14px] font-medium tracking-[-0.01em] text-[var(--color-ink)]">
            {SITE.name}
          </span>
          <span className="mono ml-2 border-l border-[var(--color-rule-2)] pl-2.5 text-[11px] tracking-[0.04em] text-[var(--color-muted)]">
            KTM · 2026
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/matches"
            className={cn(
              'hidden text-[13px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] md:inline-block',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.jobs}
          </Link>
          <Link
            href="/#how"
            className={cn(
              'hidden text-[13px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] md:inline-block',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.how}
          </Link>
          <Link
            href="/#startups"
            className={cn(
              'hidden text-[13px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] md:inline-block',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.startups}
          </Link>
          <LanguageToggle />
          <Link
            href="/sign-in"
            className={cn(
              'text-[13px] text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.signin}
          </Link>
        </nav>
      </div>
    </header>
  );
}