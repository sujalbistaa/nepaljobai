'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, ArrowRight } from 'lucide-react';
import { COPY } from '@/lib/constants';
import { useLang } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { TryItDemo } from './TryItDemo';
import { cn } from '@/lib/utils';

export function Hero() {
  const [lang] = useLang();
  const t = COPY[lang];

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <section className="relative">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 pb-20 pt-12 md:grid-cols-2 md:gap-12 md:px-10 md:pt-16 lg:gap-14">
        {/* LEFT — manifesto */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn(
              'mono mb-6 text-[11px] tracking-[0.18em] text-[var(--color-accent)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.eyebrow}
          </motion.div>

          <h1
            className={cn(
              'mb-7 max-w-[15ch] font-medium leading-[0.94] tracking-[-0.045em] text-[var(--color-ink)]',
              'text-[clamp(2.25rem,5.5vw,4rem)]',
              lang === 'ne' && 'lang-ne max-w-[18ch] tracking-[-0.02em] leading-[1.05]',
            )}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              {t.headlineLine1}
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
            >
              {t.headlineLine2}
            </motion.span>
            <motion.span
              className="block text-[var(--color-muted-2)]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
            >
              {t.headlineLine3}
            </motion.span>
            <motion.span
              className="block text-[var(--color-accent)]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease }}
            >
              {t.headlineLine4}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={cn(
              'mb-8 max-w-[58ch] text-[16px] leading-[1.55] text-[var(--color-ink-2)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            {t.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button asChild size="lg" variant="primary">
              <Link href="/upload" className={cn(lang === 'ne' && 'lang-ne')}>
                <Upload className="size-[18px]" />
                {t.ctaPrimary}
              </Link>
            </Button>
            <Link
              href="/#how"
              className={cn(
                'group inline-flex items-center gap-1.5 text-[13px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]',
                lang === 'ne' && 'lang-ne',
              )}
            >
              {t.ctaSecondary}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT — interactive demo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease }}
          className="md:self-start"
        >
          <TryItDemo />
        </motion.div>
      </div>
    </section>
  );
}