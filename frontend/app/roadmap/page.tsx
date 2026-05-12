"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Check,
  Share2,
  ExternalLink,
  ChevronDown,
  Upload,
  AlertCircle,
  ArrowRight,
  Target,
  Clock,
  BookOpen,
  Lightbulb,
  Code2,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/store";
import TopBar from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RoadmapResource {
  label: string;
  url: string;
}

interface RoadmapWeek {
  week: number;
  title: string;
  skill: string;
  phase: string;
  goal: string;
  daily_tasks: string[];
  project: string;
  tips: string;
  estimated_hours: number;
  resources: RoadmapResource[];
}

interface RoadmapResponse {
  id: string;
  target_job_title: string;
  weeks: RoadmapWeek[];
  share_token: string | null;
}

type PageState = "form" | "loading" | "done" | "no_profile" | "error";
type LoadStep = "profile" | "generating";

// ── Animations ────────────────────────────────────────────────────────────────
const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, ease: [0.16, 1, 0.3, 1] } },
};
const ITEM = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
};

// ── Phase config ──────────────────────────────────────────────────────────────
const PHASE = {
  foundation: {
    label: "Foundation",
    icon: "📚",
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    headerBg: "bg-slate-50 border-slate-200",
    headerText: "text-slate-700",
    dot: "bg-slate-400",
    cardBorder: "border-l-slate-300",
    projectBg: "bg-slate-50 border-slate-200",
  },
  build: {
    label: "Build",
    icon: "⚙️",
    pill: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-soft)]",
    headerBg: "bg-[var(--color-accent-soft)] border-[var(--color-accent-soft)]",
    headerText: "text-[var(--color-accent)]",
    dot: "bg-[var(--color-accent)]",
    cardBorder: "border-l-[var(--color-accent)]",
    projectBg: "bg-[var(--color-accent-soft)] border-[var(--color-accent-soft)]",
  },
  ship: {
    label: "Ship",
    icon: "🚀",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    headerBg: "bg-amber-50 border-amber-200",
    headerText: "text-amber-700",
    dot: "bg-amber-500",
    cardBorder: "border-l-amber-400",
    projectBg: "bg-amber-50 border-amber-200",
  },
} as const;

type Phase = keyof typeof PHASE;

const WEEK_OPTIONS = [
  { value: 4,  label: "4 weeks",  sub: "Sprint",   hours: "~40h" },
  { value: 8,  label: "8 weeks",  sub: "Focused",  hours: "~80h" },
  { value: 12, label: "12 weeks", sub: "Thorough", hours: "~120h" },
];

const ROLE_SUGGESTIONS = [
  "Frontend Engineer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "UI/UX Designer",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Mobile Developer",
];

const LOAD_STEPS: { key: LoadStep; en: string; ne: string }[] = [
  { key: "profile",    en: "Reading your skills…",               ne: "तपाईंको skills पढ्दैछ…" },
  { key: "generating", en: "Building your AI-powered roadmap…",  ne: "AI roadmap बनाउँदैछ…" },
];

// ── WeekCard ──────────────────────────────────────────────────────────────────
function WeekCard({
  week,
  done,
  onToggle,
  lang,
  phase,
}: {
  week: RoadmapWeek;
  done: boolean;
  onToggle: () => void;
  lang: string;
  phase: Phase;
}) {
  const [open, setOpen] = useState(false);
  const cfg = PHASE[phase];

  return (
    <motion.div variants={ITEM}>
      <div
        className={cn(
          "border border-l-4 rounded-sm bg-[var(--color-paper)] transition-shadow duration-200",
          done
            ? "border-[var(--color-rule)] border-l-[var(--color-accent)] opacity-55"
            : `border-[var(--color-rule)] ${cfg.cardBorder}`,
          "hover:shadow-[0_3px_18px_rgba(0,0,0,0.07)]",
        )}
      >
        {/* Header row */}
        <div className="flex items-start gap-4 p-4">
          <button
            onClick={onToggle}
            title={done ? "Mark incomplete" : "Mark complete"}
            className={cn(
              "shrink-0 mt-0.5 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              done
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                : `bg-[var(--color-paper-2)] border-[var(--color-rule-2)] ${cfg.headerText} hover:border-current`,
            )}
          >
            {done
              ? <Check size={13} />
              : <span className="mono text-[0.6rem] font-bold tabular">{week.week}</span>}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-[var(--color-ink)] text-[0.9rem] leading-snug",
                    done && "line-through opacity-40",
                  )}
                >
                  {week.title}
                </h3>
                <span
                  className={cn(
                    "mono text-[0.58rem] tracking-wider uppercase px-1.5 py-0.5 rounded border shrink-0",
                    cfg.pill,
                  )}
                >
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {week.estimated_hours > 0 && (
                  <span className="flex items-center gap-1 mono text-[0.58rem] text-[var(--color-muted)] border border-[var(--color-rule-2)] rounded px-1.5 py-0.5">
                    <Clock size={8} />
                    {week.estimated_hours}h
                  </span>
                )}
                <button
                  onClick={() => setOpen(!open)}
                  className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors"
                >
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform duration-200", open && "rotate-180")}
                  />
                </button>
              </div>
            </div>

            {week.goal && (
              <p className="flex items-start gap-1.5 text-xs text-[var(--color-muted)] mt-1.5 leading-relaxed">
                <Target size={9} className="shrink-0 mt-px" />
                {week.goal}
              </p>
            )}
          </div>
        </div>

        {/* Expanded body */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--color-rule)] px-4 pt-4 pb-5 flex flex-col gap-5">

                {/* Daily schedule */}
                {week.daily_tasks.length > 0 && (
                  <div>
                    <p className="mono text-[0.58rem] tracking-widest uppercase text-[var(--color-muted)] mb-2.5 flex items-center gap-1.5">
                      <BookOpen size={8} />
                      {lang === "ne" ? "साप्ताहिक तालिका" : "Weekly schedule"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {week.daily_tasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-[0.35rem] shrink-0", cfg.dot)} />
                          <span className="text-[0.8125rem] text-[var(--color-ink)] leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project */}
                {week.project && (
                  <div className={cn("rounded-sm p-3.5 border", cfg.projectBg)}>
                    <p className={cn("mono text-[0.58rem] tracking-widest uppercase mb-1.5 flex items-center gap-1.5", cfg.headerText)}>
                      <Code2 size={8} />
                      {lang === "ne" ? "प्रोजेक्ट" : "Project"}
                    </p>
                    <p className="text-[0.8125rem] text-[var(--color-ink)] leading-relaxed">{week.project}</p>
                  </div>
                )}

                {/* Nepal tip */}
                {week.tips && (
                  <div className="rounded-sm p-3.5 bg-amber-50 border border-amber-200">
                    <p className="mono text-[0.58rem] tracking-widest uppercase text-amber-600 mb-1.5 flex items-center gap-1.5">
                      <Lightbulb size={8} />
                      {lang === "ne" ? "नेपाल टिप" : "Nepal tip"}
                    </p>
                    <p className="text-[0.8125rem] text-amber-800 leading-relaxed">{week.tips}</p>
                  </div>
                )}

                {/* Resources */}
                {week.resources.length > 0 && (
                  <div>
                    <p className="mono text-[0.58rem] tracking-widest uppercase text-[var(--color-muted)] mb-2 flex items-center gap-1.5">
                      <ExternalLink size={8} />
                      {lang === "ne" ? "निःशुल्क resources" : "Free resources"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {week.resources.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-1.5 text-[0.75rem] px-2.5 py-1.5 rounded border transition-colors",
                            cfg.pill,
                            "hover:opacity-80",
                          )}
                        >
                          {r.label}
                          <ExternalLink size={8} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── PhaseSection ──────────────────────────────────────────────────────────────
function PhaseSection({
  phase,
  weeks,
  completed,
  onToggle,
  lang,
}: {
  phase: Phase;
  weeks: RoadmapWeek[];
  completed: Set<number>;
  onToggle: (n: number) => void;
  lang: string;
}) {
  if (weeks.length === 0) return null;
  const cfg = PHASE[phase];
  const totalHours = weeks.reduce((s, w) => s + (w.estimated_hours || 0), 0);
  const phaseDone = weeks.every((w) => completed.has(w.week));

  return (
    <div className="mb-8">
      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-sm border mb-3", cfg.headerBg)}>
        <span className="text-base leading-none">{cfg.icon}</span>
        <div className="flex-1">
          <h3 className={cn("text-[0.8125rem] font-semibold", cfg.headerText)}>
            {cfg.label} Phase
          </h3>
          <p className="mono text-[0.58rem] text-[var(--color-muted)] mt-0.5">
            {weeks.length} {lang === "ne" ? "हप्ता" : "weeks"} · ~{totalHours}h
          </p>
        </div>
        {phaseDone && (
          <span className="mono text-[0.58rem] px-2 py-1 bg-[var(--color-ok-soft)] text-[var(--color-ok)] border border-[var(--color-ok-soft)] rounded">
            ✓ Done
          </span>
        )}
      </div>

      <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-2">
        {weeks.map((w) => (
          <WeekCard
            key={w.week}
            week={w}
            done={completed.has(w.week)}
            onToggle={() => onToggle(w.week)}
            lang={lang}
            phase={phase}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ── LoadingSteps ──────────────────────────────────────────────────────────────
function LoadingSteps({ step, lang }: { step: LoadStep; lang: string }) {
  const order: LoadStep[] = ["profile", "generating"];
  const idx = order.indexOf(step);

  return (
    <div className="py-16 flex flex-col gap-5">
      {LOAD_STEPS.map((s, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                done   ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                : active ? "border-[var(--color-accent)] animate-spin border-t-transparent"
                :          "border-[var(--color-rule-2)]",
              )}
            >
              {done && <Check size={9} className="text-white" />}
            </div>
            <span
              className={cn(
                "text-sm transition-colors",
                done   ? "line-through opacity-35 text-[var(--color-muted)]"
                : active ? "text-[var(--color-ink)] font-medium"
                :          "text-[var(--color-muted)]",
              )}
            >
              {lang === "ne" ? s.ne : s.en}
            </span>
          </div>
        );
      })}

      {step === "generating" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mono text-xs text-[var(--color-muted)] pl-8"
        >
          {lang === "ne"
            ? "AI ले roadmap बनाउँदैछ (~30 sec)…"
            : "AI is crafting your personalised roadmap, hang tight (~30 sec)…"}
        </motion.p>
      )}
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────
function RoadmapForm({
  onSubmit,
  lang,
}: {
  onSubmit: (role: string, weeks: number) => void;
  lang: string;
}) {
  const [role, setRole]   = useState("");
  const [weeks, setWeeks] = useState(8);

  return (
    <motion.form
      onSubmit={(e) => { e.preventDefault(); if (role.trim()) onSubmit(role.trim(), weeks); }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-10"
    >
      {/* Role */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="mono text-[10px] tracking-widest uppercase text-[var(--color-muted)] mb-2">
            {lang === "ne" ? "प्रश्न १ / २" : "Question 1 of 2"}
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.025em] text-[var(--color-ink)]">
            {lang === "ne" ? "कुन job role का लागि तयार हुन चाहनुहुन्छ?" : "What job role are you targeting?"}
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {lang === "ne" ? "आफ्नो सपनाको role लेख्नुस्।" : "Type your target role — be as specific as you like."}
          </p>
        </div>

        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder={lang === "ne" ? "जस्तै: Frontend Engineer" : "e.g. React Developer at Leapfrog"}
          required
          className="w-full px-4 py-3 border border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink)] text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors rounded-sm"
        />

        <div className="flex flex-wrap gap-2">
          {ROLE_SUGGESTIONS.map((r) => (
            <button
              key={r} type="button" onClick={() => setRole(r)}
              className={cn(
                "mono text-xs px-3 py-1.5 rounded-sm border transition-all duration-150",
                role === r
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-rule)]" />

      {/* Weeks */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="mono text-[10px] tracking-widest uppercase text-[var(--color-muted)] mb-2">
            {lang === "ne" ? "प्रश्न २ / २" : "Question 2 of 2"}
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.025em] text-[var(--color-ink)]">
            {lang === "ne" ? "कति समय छ तपाईंसँग?" : "How much time do you have?"}
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {lang === "ne" ? "तपाईंको schedule अनुसार plan बनाइनेछ।" : "We'll tailor the depth and pace to your timeline."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {WEEK_OPTIONS.map((opt) => (
            <button
              key={opt.value} type="button" onClick={() => setWeeks(opt.value)}
              className={cn(
                "flex flex-col items-start px-4 py-4 border rounded-sm transition-all duration-150",
                weeks === opt.value
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-[var(--color-rule-2)] hover:border-[var(--color-ink)]",
              )}
            >
              <span className={cn("text-base font-semibold tracking-tight", weeks === opt.value ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]")}>
                {opt.label}
              </span>
              <span className="mono text-[0.6rem] text-[var(--color-muted)] mt-0.5">{opt.sub}</span>
              <span className="mono text-[0.6rem] text-[var(--color-muted)]">{opt.hours}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!role.trim()}
        className="self-start inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--color-accent-deep)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Sparkles size={14} />
        {lang === "ne" ? "AI roadmap बनाउनुस्" : "Build my AI roadmap"}
        <ArrowRight size={14} />
      </button>
    </motion.form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const { user, isLoaded } = useUser();
  const [lang] = useLang();

  const [pageState, setPageState] = useState<PageState>("form");
  const [loadStep,  setLoadStep]  = useState<LoadStep>("profile");
  const [chosenRole,  setChosenRole]  = useState("");
  const [chosenWeeks, setChosenWeeks] = useState(8);
  const [roadmap,     setRoadmap]     = useState<RoadmapResponse | null>(null);
  const [completed,   setCompleted]   = useState<Set<number>>(new Set());
  const [copied,      setCopied]      = useState(false);

  const buildRoadmap = useCallback(async (role: string, weeks: number) => {
    if (!isLoaded || !user?.id) { setPageState("no_profile"); return; }

    setPageState("loading");
    setCompleted(new Set());

    try {
      setLoadStep("profile");
      const profileRes = await fetch(`${API_BASE}/api/profile/${user.id}`);
      if (!profileRes.ok) { setPageState("no_profile"); return; }
      const profileData = await profileRes.json();
      const skills: string[] = Array.isArray(profileData.skills) ? profileData.skills : [];
      if (skills.length === 0) { setPageState("no_profile"); return; }

      setLoadStep("generating");
      const roadmapRes = await fetch(`${API_BASE}/api/generate_roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, target_role: role, missing_skills: [], weeks }),
      });
      if (!roadmapRes.ok) { setPageState("error"); return; }
      const data: RoadmapResponse = await roadmapRes.json();
      setRoadmap(data);
      setPageState("done");
    } catch {
      setPageState("error");
    }
  }, [isLoaded, user?.id]);

  const handleSubmit = (role: string, weeks: number) => {
    setChosenRole(role);
    setChosenWeeks(weeks);
    buildRoadmap(role, weeks);
  };

  const toggleWeek = (n: number) =>
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPct   = roadmap ? Math.round((completed.size / roadmap.weeks.length) * 100) : 0;
  const totalHours    = roadmap?.weeks.reduce((s, w) => s + (w.estimated_hours || 0), 0) ?? 0;
  const weeksByPhase  = roadmap
    ? {
        foundation: roadmap.weeks.filter((w) => w.phase === "foundation"),
        build:      roadmap.weeks.filter((w) => w.phase === "build"),
        ship:       roadmap.weeks.filter((w) => w.phase === "ship"),
      }
    : null;

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[var(--color-paper)] px-5 py-14 sm:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <p className="mono text-[10px] tracking-widest uppercase text-[var(--color-muted)] mb-3">
              {lang === "ne" ? "AI व्यक्तिगत योजना" : "AI-powered learning plan"}
            </p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[var(--color-ink)] leading-tight">
                  {lang === "ne" ? "तपाईंको Roadmap" : "Your roadmap"}
                </h1>
                {pageState === "done" && roadmap && (
                  <div className="flex items-center gap-2.5 flex-wrap mt-2">
                    <span className="text-sm font-medium text-[var(--color-ink)]">{chosenRole}</span>
                    <span className="text-[var(--color-rule-2)]">·</span>
                    <span className="mono text-xs text-[var(--color-muted)]">{chosenWeeks} weeks</span>
                    <span className="text-[var(--color-rule-2)]">·</span>
                    <span className="mono text-xs text-[var(--color-muted)] flex items-center gap-1">
                      <Clock size={9} /> ~{totalHours}h
                    </span>
                  </div>
                )}
              </div>
              {pageState === "done" && (
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 mono text-xs px-3 py-2 border border-[var(--color-rule)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors rounded-sm shrink-0"
                >
                  <Share2 size={11} />
                  {copied ? "copied!" : "share"}
                </button>
              )}
            </div>

            {/* Progress bar */}
            <AnimatePresence>
              {pageState === "done" && roadmap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-muted)]">
                      {lang === "ne" ? "प्रगति" : "Progress"}
                    </span>
                    <span className="mono text-xs tabular text-[var(--color-accent)]">
                      {completed.size}/{roadmap.weeks.length} · {progressPct}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--color-paper-2)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-[var(--color-accent)] to-teal-400 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Form ── */}
          {pageState === "form" && (
            <RoadmapForm onSubmit={handleSubmit} lang={lang} />
          )}

          {/* ── Loading ── */}
          {pageState === "loading" && (
            <LoadingSteps step={loadStep} lang={lang} />
          )}

          {/* ── No profile ── */}
          {pageState === "no_profile" && (
            <div className="border border-dashed border-[var(--color-rule-2)] p-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[var(--color-ochre-deep)]">
                <AlertCircle size={15} />
                <p className="text-sm font-medium">
                  {lang === "ne" ? "CV अपलोड गरिएको छैन।" : "No résumé found."}
                </p>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                {lang === "ne"
                  ? "Roadmap पाउनको लागि पहिले CV अपलोड गर्नुस्।"
                  : "Upload your CV so we can detect your current skills and generate a personalised roadmap."}
              </p>
              <Link
                href="/upload"
                className="self-start inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--color-accent-deep)] transition-colors"
              >
                <Upload size={13} />
                {lang === "ne" ? "CV अपलोड गर्नुस्" : "Upload CV"}
              </Link>
            </div>
          )}

          {/* ── Error ── */}
          {pageState === "error" && (
            <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 flex flex-col gap-3">
              <p className="text-sm text-[var(--color-ochre-deep)]">
                {lang === "ne" ? "केही गलत भयो।" : "Something went wrong generating your roadmap."}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => buildRoadmap(chosenRole, chosenWeeks)}
                  className="mono text-xs px-3 py-2 border border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors rounded-sm"
                >
                  {lang === "ne" ? "फेरि प्रयास गर्नुस्" : "Retry"}
                </button>
                <button
                  onClick={() => setPageState("form")}
                  className="mono text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  {lang === "ne" ? "← फारम मा फर्कनुस्" : "← Back to form"}
                </button>
              </div>
            </div>
          )}

          {/* ── Roadmap ── */}
          {pageState === "done" && roadmap && weeksByPhase && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

              {/* Phase summary pills */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {(["foundation", "build", "ship"] as Phase[]).map((p) => {
                  const cfg = PHASE[p];
                  const ws  = weeksByPhase[p];
                  if (ws.length === 0) return null;
                  const ph = ws.reduce((s, w) => s + (w.estimated_hours || 0), 0);
                  return (
                    <div key={p} className={cn("px-3.5 py-3 rounded-sm border", cfg.headerBg)}>
                      <p className="mono text-[0.58rem] tracking-widest uppercase text-[var(--color-muted)]">
                        {cfg.label}
                      </p>
                      <p className={cn("text-2xl font-semibold mt-0.5 tabular", cfg.headerText)}>
                        {ws.length}
                      </p>
                      <p className="mono text-[0.58rem] text-[var(--color-muted)]">
                        {lang === "ne" ? "हप्ता" : "weeks"} · ~{ph}h
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Phase sections */}
              {(["foundation", "build", "ship"] as Phase[]).map((phase) => (
                <PhaseSection
                  key={phase}
                  phase={phase}
                  weeks={weeksByPhase[phase]}
                  completed={completed}
                  onToggle={toggleWeek}
                  lang={lang}
                />
              ))}

              {/* Footer */}
              <div className="border-t border-[var(--color-rule)] pt-8 mt-2 flex items-center justify-between flex-wrap gap-4">
                <button
                  onClick={() => { setPageState("form"); setRoadmap(null); setCompleted(new Set()); }}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  {lang === "ne" ? "← अर्को role try गर्नुस्" : "← Try a different role"}
                </button>
                {completed.size === roadmap.weeks.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 mono text-xs px-3 py-1.5 bg-[var(--color-ok-soft)] text-[var(--color-ok)] border border-[var(--color-ok-soft)] rounded-sm"
                  >
                    <Trophy size={11} />
                    {lang === "ne" ? "बधाई! Roadmap सम्पन्न! अब apply गर्नुस्।" : "Roadmap complete! Time to apply."}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </>
  );
}
