"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/store";
import { COPY } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, ease: [0.16, 1, 0.3, 1] } },
};

const ITEM = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

interface Week {
  week: string;
  skill: string;
  tag: "foundation" | "build" | "ship";
}

const WEEKS_EN: Week[] = [
  { week: "01", skill: "Git & CLI basics",        tag: "foundation" },
  { week: "02", skill: "Python fundamentals",     tag: "foundation" },
  { week: "03", skill: "Data structures",         tag: "foundation" },
  { week: "04", skill: "REST APIs",               tag: "build"      },
  { week: "05", skill: "SQL essentials",          tag: "build"      },
  { week: "06", skill: "React basics",            tag: "build"      },
  { week: "07", skill: "FastAPI project",         tag: "build"      },
  { week: "08", skill: "Testing & CI",            tag: "build"      },
  { week: "09", skill: "Docker intro",            tag: "ship"       },
  { week: "10", skill: "Cloud deploy",            tag: "ship"       },
  { week: "11", skill: "Portfolio project",       tag: "ship"       },
  { week: "12", skill: "Job-ready ✓",             tag: "ship"       },
];

const WEEKS_NE: Week[] = [
  { week: "01", skill: "Git र CLI आधार",          tag: "foundation" },
  { week: "02", skill: "Python मूलभूत",           tag: "foundation" },
  { week: "03", skill: "डेटा संरचना",             tag: "foundation" },
  { week: "04", skill: "REST API",                tag: "build"      },
  { week: "05", skill: "SQL आधार",                tag: "build"      },
  { week: "06", skill: "React परिचय",             tag: "build"      },
  { week: "07", skill: "FastAPI प्रोजेक्ट",       tag: "build"      },
  { week: "08", skill: "Testing र CI",            tag: "build"      },
  { week: "09", skill: "Docker परिचय",            tag: "ship"       },
  { week: "10", skill: "Cloud deploy",            tag: "ship"       },
  { week: "11", skill: "Portfolio प्रोजेक्ट",     tag: "ship"       },
  { week: "12", skill: "Job-ready ✓",             tag: "ship"       },
];

const TAG_STYLES: Record<Week["tag"], string> = {
  foundation: "bg-[var(--color-paper-2)] text-[var(--color-muted)]",
  build:      "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  ship:       "bg-[var(--color-warn-soft)] text-[var(--color-ochre-deep)]",
};

export default function RoadmapTeaser() {
  const [lang] = useLang();
  const t = COPY[lang].roadmapTeaser;
  const weeks = lang === "ne" ? WEEKS_NE : WEEKS_EN;

  return (
    <section
      aria-labelledby="roadmap-teaser-heading"
      className="border-t border-[var(--color-rule)] px-5 py-20 sm:px-8 lg:px-16 bg-[var(--color-paper-2)]"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-4"
            >
              {t.label}
            </motion.p>
            <motion.h2
              id="roadmap-teaser-heading"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.48, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`text-[2rem] sm:text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-[var(--color-ink)] max-w-sm${lang === "ne" ? " lang-ne" : ""}`}
            >
              {t.heading}
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={`text-sm text-[var(--color-muted)] max-w-xs leading-relaxed sm:text-right${lang === "ne" ? " lang-ne" : ""}`}
          >
            {t.sub}
          </motion.p>
        </div>

        {/* Timeline grid */}
        <motion.div
          variants={STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)] mb-10"
        >
          {weeks.map((w, i) => (
            <motion.div
              key={w.week}
              variants={ITEM}
              className={`bg-[var(--color-paper)] p-4 flex flex-col gap-3${i >= 6 ? " opacity-60" : ""}`}
            >
              {/* Week number */}
              <span className="mono text-[0.65rem] tracking-widest text-[var(--color-muted)] uppercase">
                WK {w.week}
              </span>

              {/* Skill name */}
              <p
                className={`text-[0.8rem] font-medium text-[var(--color-ink)] leading-snug flex-1${lang === "ne" ? " lang-ne" : ""}`}
              >
                {w.skill}
              </p>

              {/* Phase tag */}
              <span
                className={`mono text-[0.6rem] tracking-wider uppercase px-1.5 py-0.5 rounded-sm self-start ${TAG_STYLES[w.tag]}`}
              >
                {w.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Legend + CTA row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          {/* Phase legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {(["foundation", "build", "ship"] as Week["tag"][]).map((tag) => (
              <span key={tag} className="flex items-center gap-1.5">
                <span
                  className={`mono text-[0.65rem] tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${TAG_STYLES[tag]}`}
                >
                  {tag}
                </span>
              </span>
            ))}
            <span className={`text-xs text-[var(--color-muted)]${lang === "ne" ? " lang-ne" : ""}`}>
              {t.legendNote}
            </span>
          </div>

          {/* CTA */}
          <Button variant="accent" size="md" asChild>
            <a href="/sign-up" className={lang === "ne" ? "lang-ne" : ""}>
              {t.cta}
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
}