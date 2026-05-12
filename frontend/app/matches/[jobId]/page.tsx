"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, ChevronRight, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/store";
import { formatNPR } from "@/lib/utils";
import Button from "@/components/ui/Button";
import TopBar from "@/components/layout/TopBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, ease: [0.16, 1, 0.3, 1] } },
};

const ITEM = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  district: string | null;
  area: string | null;
  apply_url: string | null;
  apply_by: string | null;
  source: string;
  scraped_at: string;
}

export default function JobDetailPage() {
  const [lang] = useLang();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;

  const skillsParam = searchParams.get("skills") ?? "";
  const userSkills = skillsParam ? skillsParam.split(",").map((s) => s.trim()) : [];

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Job = await res.json();
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const userSkillsLower = new Set(userSkills.map((s) => s.toLowerCase()));
  const matched = job?.required_skills.filter((s) => userSkillsLower.has(s.toLowerCase())) ?? [];
  const missing = job?.required_skills.filter((s) => !userSkillsLower.has(s.toLowerCase())) ?? [];
  const scorePct = job?.required_skills.length
    ? Math.round((matched.length / job.required_skills.length) * 100)
    : 0;

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[var(--color-paper)] px-5 py-16 sm:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          <a
            href={`/matches?skills=${skillsParam}`}
            className="flex items-center gap-1.5 mono text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors mb-8"
          >
            <ArrowLeft size={12} />
            {lang === "ne" ? "matches मा फर्कनुस्" : "Back to matches"}
          </a>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="border border-[var(--color-rule)] p-8 text-center">
              <p className="text-[var(--color-ochre-deep)] text-sm">{error}</p>
            </div>
          )}

          {job && !loading && (
            <motion.div
              variants={STAGGER}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-6"
            >
              {/* Title block */}
              <motion.div variants={ITEM} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-ink)] leading-snug${lang === "ne" ? " lang-ne" : ""}`}>
                      {job.title}
                    </h1>
                    <p className="text-[var(--color-muted)] mt-1">{job.company}</p>
                  </div>
                  {userSkills.length > 0 && (
                    <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-[var(--color-accent-soft)] rounded-sm">
                      <span className="mono text-xl font-bold tabular text-[var(--color-accent)] leading-none">
                        {scorePct}
                      </span>
                      <span className="mono text-[0.6rem] text-[var(--color-accent)]">%</span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 flex-wrap mt-1">
                  {(job.area || job.district) && (
                    <span className="flex items-center gap-1 mono text-xs text-[var(--color-muted)]">
                      <MapPin size={10} />
                      {job.area ?? job.district}
                    </span>
                  )}
                  {job.apply_by && (
                    <span className="flex items-center gap-1 mono text-xs text-[var(--color-muted)]">
                      <Clock size={10} />
                      {lang === "ne" ? "अन्तिम मिति" : "Apply by"} {job.apply_by}
                    </span>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <span className="mono text-xs text-[var(--color-ink)] font-medium tabular">
                      {job.salary_min && job.salary_max
                        ? `${formatNPR(job.salary_min)} – ${formatNPR(job.salary_max)}`
                        : formatNPR(job.salary_max ?? job.salary_min ?? 0)}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Why this match */}
              {userSkills.length > 0 && (
                <motion.div
                  variants={ITEM}
                  className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5 flex flex-col gap-4"
                >
                  <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                    {lang === "ne" ? "किन यो match?" : "Why this match"}
                  </p>

                  {matched.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className={`text-xs text-[var(--color-muted)]${lang === "ne" ? " lang-ne" : ""}`}>
                        {lang === "ne" ? "तपाईंसँग छ" : "You have"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matched.map((s) => (
                          <span
                            key={s}
                            className="mono text-xs px-2.5 py-1 bg-[var(--color-accent-soft)] text-[var(--color-accent)] rounded-sm"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {missing.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className={`text-xs text-[var(--color-muted)]${lang === "ne" ? " lang-ne" : ""}`}>
                        {lang === "ne" ? "सिक्न बाँकी" : "Still to learn"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {missing.map((s) => (
                          <span
                            key={s}
                            className="mono text-xs px-2.5 py-1 bg-[var(--color-warn-soft)] text-[var(--color-ochre-deep)] rounded-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Description */}
              {job.description && (
                <motion.div variants={ITEM} className="flex flex-col gap-3">
                  <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                    {lang === "ne" ? "विवरण" : "About the role"}
                  </p>
                  <p className={`text-sm text-[var(--color-ink)] leading-relaxed${lang === "ne" ? " lang-ne" : ""}`}>
                    {job.description}
                  </p>
                </motion.div>
              )}

              {/* All required skills */}
              <motion.div variants={ITEM} className="flex flex-col gap-3">
                <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                  {lang === "ne" ? "आवश्यक skills" : "Required skills"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((s) => (
                    <span
                      key={s}
                      className={`mono text-xs px-2.5 py-1 rounded-sm ${
                        userSkillsLower.has(s.toLowerCase())
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                          : "bg-[var(--color-paper-2)] text-[var(--color-muted)] border border-[var(--color-rule)]"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Source */}
              <motion.div variants={ITEM}>
                <p className="mono text-xs text-[var(--color-muted)]">
                  {lang === "ne" ? "स्रोत" : "Source"}: {job.source} ·{" "}
                  {new Date(job.scraped_at).toLocaleDateString()}
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={ITEM}
                className="flex items-center gap-3 border-t border-[var(--color-rule)] pt-6 flex-wrap"
              >
                {job.apply_url && (
                  <Button variant="accent" size="lg" asChild>
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                      <span className={lang === "ne" ? "lang-ne" : ""}>
                        {lang === "ne" ? "Apply गर्नुस्" : "Apply now"}
                      </span>
                      <ExternalLink size={14} className="ml-1.5" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <a href={`/roadmap?skills=${skillsParam}&role=${encodeURIComponent(job.title)}&missing=${missing.join(",")}`}>
                    <span className={lang === "ne" ? "lang-ne" : ""}>
                      {lang === "ne" ? "Roadmap बनाउनुस्" : "Build roadmap for this role"}
                    </span>
                    <ChevronRight size={14} className="ml-1" />
                  </a>
                </Button>
              </motion.div>

            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}