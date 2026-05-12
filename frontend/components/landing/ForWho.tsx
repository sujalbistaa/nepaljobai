"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/store";
import { COPY } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, ease: [0.16, 1, 0.3, 1] } },
};

const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

interface ForWhoPanel {
  tag: string;
  heading: string;
  sub: string;
  points: readonly string[];
  cta: string;
  ctaHref: string;
  accent: boolean;
}

export default function ForWho() {
  const [lang] = useLang();
  const t = COPY[lang].forWho;

  const panels: ForWhoPanel[] = [
    {
      tag: t.seekers.tag,
      heading: t.seekers.heading,
      sub: t.seekers.sub,
      points: t.seekers.points,
      cta: t.seekers.cta,
      ctaHref: "/sign-up",
      accent: false,
    },
    {
      tag: t.startups.tag,
      heading: t.startups.heading,
      sub: t.startups.sub,
      points: t.startups.points,
      cta: t.startups.cta,
      ctaHref: "/sign-up?role=startup",
      accent: true,
    },
  ];

  return (
    <section
      id="for-startups"
      aria-labelledby="forwho-heading"
      className="border-t border-[var(--color-rule)] px-5 py-20 sm:px-8 lg:px-16"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-4"
        >
          {t.label}
        </motion.p>

        <motion.h2
          id="forwho-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className={`text-[2rem] sm:text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-[var(--color-ink)] max-w-xl mb-12${lang === "ne" ? " lang-ne" : ""}`}
        >
          {t.heading}
        </motion.h2>

        {/* Two-column panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]">
          {panels.map((panel) => (
            <motion.div
              key={panel.tag}
              variants={ITEM}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="bg-[var(--color-paper)] p-8 sm:p-10 flex flex-col gap-6"
            >
              {/* Tag */}
              <span
                className={`mono text-xs tracking-widest uppercase${panel.accent ? " text-[var(--color-accent)]" : " text-[var(--color-muted)]"}`}
              >
                {panel.tag}
              </span>

              {/* Heading + sub */}
              <div className="flex flex-col gap-2">
                <h3
                  className={`text-xl sm:text-2xl font-semibold leading-snug text-[var(--color-ink)]${lang === "ne" ? " lang-ne" : ""}`}
                >
                  {panel.heading}
                </h3>
                <p
                  className={`text-sm sm:text-base text-[var(--color-muted)] leading-relaxed${lang === "ne" ? " lang-ne" : ""}`}
                >
                  {panel.sub}
                </p>
              </div>

              {/* Points */}
              <ul className="flex flex-col gap-3 flex-1">
                {panel.points.map((point, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm text-[var(--color-ink)] leading-relaxed${lang === "ne" ? " lang-ne" : ""}`}
                  >
                    <span
                      className={`mt-[3px] shrink-0 w-[6px] h-[6px] rounded-full${panel.accent ? " bg-[var(--color-accent)]" : " bg-[var(--color-muted-2)]"}`}
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="pt-2">
                <Button
                  variant={panel.accent ? "accent" : "outline"}
                  size="md"
                  asChild
                >
                  <a href={panel.ctaHref} className={lang === "ne" ? "lang-ne" : ""}>
                    {panel.cta}
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}