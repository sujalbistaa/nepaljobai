'use client';

import { useLang } from '@/lib/store';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const [lang, setLang] = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
      aria-label={`Switch language to ${lang === 'en' ? 'Nepali' : 'English'}`}
      className={cn(
        'mono inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] px-2 py-1 text-[11px]',
        'text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-2)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]',
        className,
      )}
    >
      <span className={cn(lang === 'en' && 'text-[var(--color-accent)]')}>EN</span>
      <span className="text-[var(--color-muted)]">/</span>
      <span
        className={cn(
          'lang-ne',
          lang === 'ne' && 'text-[var(--color-accent)]',
        )}
      >
        ने
      </span>
    </button>
  );
}