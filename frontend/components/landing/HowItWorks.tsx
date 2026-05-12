"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/store";
import { COPY } from "@/lib/constants";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, ease: [0.16, 1, 0.3, 1] } },
};

const ITEM = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function HowItWorks() {
  const [lang] = useLang();
  const t = COPY[lang].howItWorks;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-t border-[var(--color-rule)] px-5 py-20 sm:px-8 lg:px-16"
    >
      {/* Section label + heading */}
      <motion.div
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto"
      >
        <motion.p
          variants={ITEM}
          className="mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-4"
        >
          {t.label}
        </motion.p>

        <motion.h2
          id="how-heading"
          variants={ITEM}
          className="text-[2rem] sm:text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-[var(--color-ink)] max-w-xl mb-16"
        >
          {t.heading}
        </motion.h2>

        {/* Steps */}
        <motion.ol variants={STAGGER} className="space-y-0">
          {t.steps.map((step: { number: string; title: string; body: string }, i: number) => (
            <motion.li
              key={step.number}
              variants={ITEM}
              className="grid grid-cols-[4rem_1fr] sm:grid-cols-[6rem_1fr] gap-x-6 gap-y-2 border-t border-[var(--color-rule)] py-8 last:border-b last:border-[var(--color-rule)]"
            >
              {/* Step number */}
              <span
                className={`mono text-[2.5rem] sm:text-[3rem] font-bold leading-none tabular select-none text-[var(--color-rule-2)] pt-1${lang === "ne" ? " lang-ne" : ""}`}
                aria-hidden="true"
              >
                {step.number}
              </span>

              <div className="flex flex-col gap-2 justify-center">
                <h3
                  className={`text-lg sm:text-xl font-semibold text-[var(--color-ink)] leading-snug${lang === "ne" ? " lang-ne" : ""}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-prose${lang === "ne" ? " lang-ne" : ""}`}
                >
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </section>
  );
}