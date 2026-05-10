'use client';

import { motion } from 'framer-motion';
import { Check, ArrowUpRight } from 'lucide-react';
import { COPY, HERO_SAMPLE_MATCH, LIVE_STATS } from '@/lib/constants';
import { useLang } from '@/lib/store';
import { cn, formatNPR } from '@/lib/utils';

export function SocialProof() {
  const [lang] = useLang();
  const t = COPY[lang];
  const m = HERO_SAMPLE_MATCH;
  const s = LIVE_STATS;

  const stats = [
    { value: s.openRoles.toLocaleString('en-IN'), label: t.stats.openRoles, accent: false },
    { value: s.startups.toString(), label: t.stats.startups, accent: false },
    { value: formatNPR(s.medianSalary, null, { compact: true }), label: t.stats.median, accent: false },
    { value: `${s.matchRate}%`, label: t.stats.matchRate, accent: true },
  ];

  return (
    <section className="border-y border-[var(--color-rule)] bg-[var(--color-paper-2)]">
      <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-10 md:py-16">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 border-y border-[var(--color-ink)] py-7 md:grid-cols-4"
        >
          {stats.map((it, idx) => (
            <div
              key={it.label}
              className={cn(
                'px-4 first:pl-0 last:pr-0',
                idx < stats.length - 1 && 'md:border-r md:border-[var(--color-rule)]',
                idx === 0 && 'md:pl-0 md:pr-4',
              )}
            >
              <div
                className={cn(
                  'tabular text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-none tracking-[-0.035em]',
                  it.accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]',
                )}
              >
                {it.value}
              </div>
              <div
                className={cn(
                  'mono mt-1.5 text-[11px] uppercase tracking-[0.04em] text-[var(--color-muted)]',
                  lang === 'ne' && 'lang-ne',
                )}
              >
                {it.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Sample match card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10"
        >
          <div
            className={cn(
              'mono mb-3 text-[10px] tracking-[0.16em] text-[var(--color-muted-2)]',
              lang === 'ne' && 'lang-ne',
            )}
          >
            ↓ LIVE EXAMPLE FROM MEROJOB.COM
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] p-6">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_1fr_auto]">
              <div className="flex items-baseline gap-1 border-[var(--color-rule)] pr-6 md:border-r">
                <span className="tabular text-[72px] font-medium leading-[0.9] tracking-[-0.045em] text-[var(--color-accent)]">
                  {m.score}
                </span>
                <span className="text-[18px] text-[var(--color-muted)]">%</span>
              </div>

              <div className="min-w-0">
                <div className="mono mb-1.5 text-[11px] uppercase tracking-[0.04em] text-[var(--color-muted)]">
                  Strong match · posted {m.postedDaysAgo}d ago
                </div>
                <div className="mb-1 text-[17px] font-medium tracking-[-0.01em] text-[var(--color-ink)]">
                  {m.role}
                </div>
                <div className="mb-3 text-[13px] text-[var(--color-ink-2)]">
                  {m.company} · {m.location} · {formatNPR(m.salaryMin, m.salaryMax)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.haveSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--color-accent-soft)] px-2 py-1 text-[11px] font-medium text-[var(--color-accent-deep)]"
                    >
                      <Check className="size-3" />
                      {skill}
                    </span>
                  ))}
                  {m.needSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--color-warn-soft)] px-2 py-1 text-[11px] font-medium text-[var(--color-ochre-deep)]"
                    >
                      <ArrowUpRight className="size-3" />
                      {skill.name} · {skill.weeksToLearn} wks to learn
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-[var(--color-rule)] pl-6 text-right md:border-l">
                <div className="mono mb-1 text-[11px] uppercase tracking-[0.04em] text-[var(--color-muted)]">
                  Apply by
                </div>
                <div className="text-[16px] font-medium text-[var(--color-ink)]">
                  {m.applyBy}
                </div>
                <div className="mt-1 text-[11px] text-[var(--color-muted-2)]">
                  {m.applicants} applicants
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}