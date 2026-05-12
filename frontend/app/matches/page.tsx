"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { useLang } from "@/lib/store";
import { formatNPR } from "@/lib/utils";
import Button from "@/components/ui/Button";
import TopBar from "@/components/layout/TopBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, ease: [0.16, 1, 0.3, 1] } },
};

const ITEM = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: string;
    area: string | null;
    district: string | null;
    salary_min: number | null;
    salary_max: number | null;
    required_skills: string[];
    apply_by: string | null;
    source: string;
    scraped_at: string;
  };
  score: number;
  score_pct: number;
  missing_skills: string[];
}

interface MatchResponse {
  results: JobMatch[];
  total_jobs_scanned: number;
}

type SortKey = "score" | "salary" | "recent";

export default function MatchesPage() {
  const [lang] = useLang();
  const searchParams = useSearchParams();

  const PAGE_SIZE = 10;

  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalScanned, setTotalScanned] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [filterArea, setFilterArea] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const resetPage = () => setPage(1);

  useEffect(() => {
    const raw = searchParams.get("skills") ?? "";
    const parsed = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : ["Python", "Git"];
    setSkills(parsed);
    fetchMatches(parsed);
  }, [searchParams]);

  const fetchMatches = async (skillList: string[]) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/match_jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillList, top_k: 200 }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: MatchResponse = await res.json();
      setMatches(data.results);
      setTotalScanned(data.total_jobs_scanned);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...matches]
    .filter((m) => !filterArea || m.job.area === filterArea || m.job.district === filterArea)
    .sort((a, b) => {
      if (sortBy === "score") return b.score_pct - a.score_pct;
      if (sortBy === "salary") return (b.job.salary_max ?? 0) - (a.job.salary_max ?? 0);
      return new Date(b.job.scraped_at).getTime() - new Date(a.job.scraped_at).getTime();
    });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const areas = [...new Set(matches.map((m) => m.job.area ?? m.job.district).filter(Boolean))] as string[];

  const scoreColor = (pct: number) => {
    if (pct >= 80) return "text-[var(--color-accent)]";
    if (pct >= 60) return "text-[var(--color-ochre-deep)]";
    return "text-[var(--color-muted)]";
  };

  const scoreBg = (pct: number) => {
    if (pct >= 80) return "bg-[var(--color-accent-soft)]";
    if (pct >= 60) return "bg-[var(--color-warn-soft)]";
    return "bg-[var(--color-paper-2)]";
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[var(--color-paper)] px-5 py-16 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">
              {lang === "ne" ? "चरण २ / ३" : "Step 2 of 3"}
            </p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h1 className={`text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-ink)] leading-tight${lang === "ne" ? " lang-ne" : ""}`}>
                {lang === "ne" ? "तपाईंका matches" : "Your matches"}
              </h1>
              {!loading && (
                <p className="mono text-xs text-[var(--color-muted)] tabular">
                  {totalScanned} {lang === "ne" ? "jobs scan गरियो" : "jobs scanned"}
                </p>
              )}
            </div>

            {/* Skill chips */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="mono text-xs px-2.5 py-1 bg-[var(--color-accent-soft)] text-[var(--color-accent)] rounded-sm"
                  >
                    {s}
                  </span>
                ))}
                <a
                  href="/upload"
                  className="mono text-xs px-2.5 py-1 border border-[var(--color-rule)] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors rounded-sm"
                >
                  {lang === "ne" ? "बदल्नुस् →" : "edit →"}
                </a>
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-[var(--color-rule)] pb-4">
            {/* Sort tabs */}
            <div className="flex items-center gap-1">
              {(["score", "salary", "recent"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); resetPage(); }}
                  className={`mono text-xs px-3 py-1.5 rounded-sm transition-colors${
                    sortBy === key
                      ? " bg-[var(--color-ink)] text-[var(--color-paper)]"
                      : " text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {key === "score"
                    ? lang === "ne" ? "% match" : "% match"
                    : key === "salary"
                    ? lang === "ne" ? "तलब" : "salary"
                    : lang === "ne" ? "नयाँ" : "newest"}
                </button>
              ))}
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 mono text-xs px-3 py-1.5 border rounded-sm transition-colors${
                showFilters
                  ? " border-[var(--color-accent)] text-[var(--color-accent)]"
                  : " border-[var(--color-rule)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <SlidersHorizontal size={12} />
              {lang === "ne" ? "filter" : "filter"}
              {filterArea && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
            </button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4 flex flex-col gap-3">
                  <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                    {lang === "ne" ? "क्षेत्र" : "Area"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setFilterArea(""); resetPage(); }}
                      className={`mono text-xs px-2.5 py-1 rounded-sm border transition-colors${
                        !filterArea
                          ? " border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                          : " border-[var(--color-rule)] text-[var(--color-muted)]"
                      }`}
                    >
                      {lang === "ne" ? "सबै" : "All"}
                    </button>
                    {areas.map((area) => (
                      <button
                        key={area}
                        onClick={() => { setFilterArea(area); resetPage(); }}
                        className={`mono text-xs px-2.5 py-1 rounded-sm border transition-colors${
                          filterArea === area
                            ? " border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                            : " border-[var(--color-rule)] text-[var(--color-muted)]"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="mono text-sm text-[var(--color-muted)]">
                {lang === "ne" ? "matches खोज्दै..." : "Finding your matches..."}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 text-center">
              <p className="text-[var(--color-ochre-deep)] text-sm mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchMatches(skills)}>
                {lang === "ne" ? "फेरि प्रयास" : "Retry"}
              </Button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <motion.div
              variants={STAGGER}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-0"
            >
              {sorted.length === 0 ? (
                <div className="border border-[var(--color-rule)] p-10 text-center">
                  <p className={`text-[var(--color-muted)] text-sm${lang === "ne" ? " lang-ne" : ""}`}>
                    {lang === "ne" ? "कुनै match फेला परेन।" : "No matches found. Try adding more skills."}
                  </p>
                  <a href="/upload" className="mono text-xs text-[var(--color-accent)] mt-3 inline-block">
                    {lang === "ne" ? "← फर्कनुस्" : "← Back to upload"}
                  </a>
                </div>
              ) : (
                paginated.map((match) => (
                  <motion.div
                    key={match.job.id}
                    variants={ITEM}
                    className="border-t border-[var(--color-rule)] last:border-b py-5 flex items-start gap-5 group"
                  >
                    {/* Score */}
                    <div className={`shrink-0 w-14 h-14 flex items-center justify-center rounded-sm ${scoreBg(match.score_pct)}`}>
                      <span className={`mono text-lg font-bold tabular leading-none ${scoreColor(match.score_pct)}`}>
                        {match.score_pct}
                        <span className="text-xs font-normal">%</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className={`font-semibold text-[var(--color-ink)] leading-snug${lang === "ne" ? " lang-ne" : ""}`}>
                            {match.job.title}
                          </h2>
                          <p className="text-sm text-[var(--color-muted)] mt-0.5">
                            {match.job.company}
                          </p>
                        </div>
                        {match.job.salary_max && (
                          <span className="mono text-sm tabular text-[var(--color-ink)] font-medium shrink-0">
                            {formatNPR(match.job.salary_max)}
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {(match.job.area || match.job.district) && (
                          <span className="flex items-center gap-1 mono text-xs text-[var(--color-muted)]">
                            <MapPin size={10} />
                            {match.job.area ?? match.job.district}
                          </span>
                        )}
                        {match.job.apply_by && (
                          <span className="flex items-center gap-1 mono text-xs text-[var(--color-muted)]">
                            <Clock size={10} />
                            {lang === "ne" ? "अन्तिम" : "apply by"} {match.job.apply_by}
                          </span>
                        )}
                        <span className="mono text-xs text-[var(--color-muted)]">
                          {match.job.source}
                        </span>
                      </div>

                      {/* Missing skills */}
                      {match.missing_skills.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="mono text-[0.65rem] tracking-wider uppercase text-[var(--color-ochre-deep)]">
                            {lang === "ne" ? "चाहिन्छ" : "missing"}
                          </span>
                          {match.missing_skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="mono text-xs px-2 py-0.5 bg-[var(--color-warn-soft)] text-[var(--color-ochre-deep)] rounded-sm"
                            >
                              {s}
                            </span>
                          ))}
                          {match.missing_skills.length > 3 && (
                            <span className="mono text-xs text-[var(--color-muted)]">
                              +{match.missing_skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <a
                      href={`/matches/${match.job.id}?skills=${skills.join(",")}`}
                      className="shrink-0 mt-1 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors"
                    >
                      <ChevronRight size={18} />
                    </a>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--color-rule)] pt-5 mt-2">
              <button
                onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === 1}
                className="mono text-xs px-4 py-2 border border-[var(--color-rule)] rounded-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                ← {lang === "ne" ? "अघिल्लो" : "prev"}
              </button>
              <span className="mono text-xs text-[var(--color-muted)] tabular">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === totalPages}
                className="mono text-xs px-4 py-2 border border-[var(--color-rule)] rounded-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                {lang === "ne" ? "अर्को" : "next"} →
              </button>
            </div>
          )}

          {/* Bottom CTA */}
          {!loading && sorted.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border-t border-[var(--color-rule)] pt-8 mt-4 flex items-center justify-between"
            >
              <a
                href="/upload"
                className={`text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors${lang === "ne" ? " lang-ne" : ""}`}
              >
                {lang === "ne" ? "← CV बदल्नुस्" : "← Change résumé"}
              </a>
              <Button
                variant="accent"
                size="md"
                asChild
              >
                <a href={`/roadmap?skills=${skills.join(",")}&role=${sorted[0]?.job.title ?? ""}`}>
                  <span className={lang === "ne" ? "lang-ne" : ""}>
                    {lang === "ne" ? "मेरो roadmap बनाउनुस्" : "Build my roadmap"}
                  </span>
                  <ChevronRight size={15} className="ml-1" />
                </a>
              </Button>
            </motion.div>
          )}

        </div>
      </main>
    </>
  );
}