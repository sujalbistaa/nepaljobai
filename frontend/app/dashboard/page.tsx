"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Map,
  Pencil,
  ChevronRight,
  Search,
  User,
  LogOut,
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/store";
import Button from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, ease: [0.16, 1, 0.3, 1] } },
};
const ITEM = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

interface ProfileData {
  skills: string[];
  experience_years: number | null;
}

function useGreeting(firstName: string | null | undefined) {
  return useMemo(() => {
    const hour = new Date().getHours();
    const name = firstName ?? "there";
    if (hour < 12) return `Good morning, ${name}.`;
    if (hour < 17) return `Good afternoon, ${name}.`;
    if (hour < 21) return `Good evening, ${name}.`;
    return `Hey, ${name}.`;
  }, [firstName]);
}

function useFormattedDate() {
  return useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);
}

// ── Greeting hero ────────────────────────────────────────────────────────────
function GreetingHero({
  greeting,
  date,
  hasResume,
  lang,
}: {
  greeting: string;
  date: string;
  hasResume: boolean;
  lang: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="mono text-[11px] tracking-widest uppercase text-[var(--color-muted)]">
        {date} · Kathmandu
      </p>
      <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-[var(--color-ink)] leading-tight">
        {lang === "ne" ? "नमस्ते, स्वागत छ।" : greeting}
      </h1>
      <p className="text-sm text-[var(--color-muted)] mt-0.5">
        {lang === "ne"
          ? hasResume
            ? "तपाईंको career active छ।"
            : "सुरु गरौं — CV अपलोड गर्नुस्।"
          : hasResume
          ? "Your career is live. Here's what's waiting for you."
          : "Let's get you started — upload your CV to unlock everything."}
      </p>
    </div>
  );
}

// ── Career status spotlight ───────────────────────────────────────────────────
function CareerSpotlight({
  profile,
  loading,
  lang,
}: {
  profile: ProfileData | null;
  loading: boolean;
  lang: string;
}) {
  const hasResume = !loading && profile && profile.skills.length > 0;

  if (loading) {
    return (
      <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-6 py-5 flex items-center gap-3">
        <div className="w-3.5 h-3.5 border border-[var(--color-accent)] border-t-transparent rounded-full animate-spin shrink-0" />
        <span className="mono text-xs text-[var(--color-muted)]">
          {lang === "ne" ? "तपाईंको profile लोड हुँदैछ..." : "Loading your profile…"}
        </span>
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div className="border border-dashed border-[var(--color-rule-2)] bg-[var(--color-paper)] px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[var(--color-accent)]" />
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {lang === "ne" ? "CV अपलोड गर्नुस् र सुरु गर्नुस्।" : "Upload your CV to unlock everything."}
            </p>
          </div>
          <p className="mono text-xs text-[var(--color-muted)]">
            {lang === "ne"
              ? "Match score, skill gaps, र 12-week roadmap पाउनुस्।"
              : "Get your match score, skill gaps, and a free 12-week roadmap."}
          </p>
        </div>
        <Link
          href="/upload"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors"
        >
          <Upload size={13} />
          {lang === "ne" ? "CV अपलोड गर्नुस्" : "Upload CV"}
        </Link>
      </div>
    );
  }

  // Has resume — show live stats strip
  const skills = profile!.skills;
  const expYears = profile!.experience_years;

  return (
    <div className="border border-[var(--color-rule)] bg-[var(--color-paper)] overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-[var(--color-rule)]">
        {[
          {
            label: lang === "ne" ? "Skills detected" : "Skills detected",
            value: String(skills.length),
            sub: skills.slice(0, 2).join(", ") + (skills.length > 2 ? "…" : ""),
            href: "/upload",
          },
          {
            label: lang === "ne" ? "Job matches" : "Job matches",
            value: "Live",
            sub: lang === "ne" ? "काठमाडौंमा खुला पदहरू" : "Open roles in Kathmandu",
            href: `/matches?skills=${skills.join(",")}`,
          },
          {
            label: lang === "ne" ? "Roadmap" : "Roadmap",
            value: expYears ? `${expYears}y exp` : "Ready",
            sub: lang === "ne" ? "12-हप्ते plan" : "Free 12-week plan",
            href: `/roadmap?skills=${skills.join(",")}`,
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col gap-1 px-5 py-4 hover:bg-[var(--color-paper-2)] transition-colors"
          >
            <p className="mono text-[0.6rem] tracking-widest uppercase text-[var(--color-muted)]">
              {stat.label}
            </p>
            <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {stat.value}
            </p>
            <p className="mono text-xs text-[var(--color-muted)] truncate">{stat.sub}</p>
            <ArrowUpRight
              size={11}
              className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors mt-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [lang] = useLang();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const greeting = useGreeting(user?.firstName);
  const date = useFormattedDate();
  const hasResume = !profileLoading && profile !== null && profile.skills.length > 0;

  useEffect(() => {
    if (!user?.id) return;
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    fetch(`${API_BASE}/api/users/ensure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        avatar_url: user.imageUrl ?? null,
      }),
    })
      .then(() =>
        fetch(`${API_BASE}/api/profile/${user.id}`).then((r) => {
          if (!r.ok) return { skills: [], experience_years: null };
          return r.json();
        })
      )
      .then((data) =>
        setProfile({
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience_years: data.experience_years ?? null,
        })
      )
      .catch(() => setProfile({ skills: [], experience_years: null }))
      .finally(() => setProfileLoading(false));
  }, [user?.id]);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <main className="px-5 py-12 sm:px-8 lg:px-16 min-h-screen bg-[var(--color-paper)]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >

          {/* ── Greeting hero ── */}
          <motion.div variants={ITEM} className="flex items-start justify-between gap-4">
            <GreetingHero
              greeting={greeting}
              date={date}
              hasResume={hasResume}
              lang={lang}
            />
            {/* Home shortcut — subtle */}
            <Link
              href="/"
              className="shrink-0 flex items-center gap-1.5 mono text-xs px-3 py-1.5 border border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors rounded-sm mt-1"
            >
              ← {lang === "ne" ? "गृहपृष्ठ" : "Home"}
            </Link>
          </motion.div>

          {/* ── Career status spotlight ── */}
          <motion.div variants={ITEM}>
            <CareerSpotlight profile={profile} loading={profileLoading} lang={lang} />
          </motion.div>

          {/* ── Profile card + quick actions ── */}
          <motion.div
            variants={ITEM}
            className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]"
          >
            {/* Profile card — 3 cols */}
            <div className="md:col-span-3 bg-[var(--color-paper)] p-7 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative shrink-0 w-16 h-16">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="avatar"
                      fill
                      className="rounded-sm object-cover border border-[var(--color-rule)]"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-center justify-center">
                      <User size={24} className="text-[var(--color-muted)]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-[var(--color-ink)] tracking-tight truncate">
                    {user?.fullName ?? (lang === "ne" ? "तपाईंको नाम" : "Your name")}
                  </h2>
                  <p className="mono text-xs text-[var(--color-muted)] mt-0.5 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  {joinedDate && (
                    <p className="mono text-xs text-[var(--color-muted-2)] mt-1">
                      {lang === "ne" ? "सदस्य बनेको" : "Joined"} {joinedDate}
                    </p>
                  )}
                </div>

                <Link
                  href="/profile"
                  className="shrink-0 flex items-center gap-1.5 mono text-xs px-3 py-1.5 border border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors rounded-sm"
                >
                  <Pencil size={11} />
                  {lang === "ne" ? "सम्पादन" : "Edit"}
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)] mt-1">
                {[
                  {
                    label: "Skills",
                    value: profileLoading ? "—" : String(profile?.skills.length ?? 0),
                  },
                  {
                    label: lang === "ne" ? "अनुभव" : "Experience",
                    value: profileLoading
                      ? "—"
                      : profile?.experience_years
                      ? `${profile.experience_years}y`
                      : "—",
                  },
                  {
                    label: lang === "ne" ? "स्थिति" : "Status",
                    value: hasResume
                      ? lang === "ne" ? "सक्रिय" : "Active"
                      : lang === "ne" ? "अधूरो" : "Incomplete",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[var(--color-paper)] px-4 py-3">
                    <p className="mono text-[0.6rem] tracking-widest uppercase text-[var(--color-muted)]">
                      {stat.label}
                    </p>
                    <p className="mono text-lg font-semibold tabular text-[var(--color-ink)] mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="self-start flex items-center gap-1.5 mono text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
              >
                <LogOut size={11} />
                {lang === "ne" ? "साइन आउट" : "Sign out"}
              </button>
            </div>

            {/* Quick actions — 2 cols */}
            <div className="md:col-span-2 bg-[var(--color-paper)] flex flex-col divide-y divide-[var(--color-rule)]">
              <p className="mono text-[0.6rem] tracking-widest uppercase text-[var(--color-muted)] px-6 pt-5 pb-3">
                {lang === "ne" ? "छिटो कार्यहरू" : "Quick actions"}
              </p>
              {[
                {
                  icon: Upload,
                  labelEn: "Upload résumé",
                  labelNe: "CV अपलोड",
                  subEn: "Add or update your CV",
                  subNe: "CV थप्नुस् वा अपडेट गर्नुस्",
                  href: "/upload",
                  accent: true,
                },
                {
                  icon: Search,
                  labelEn: "Browse matches",
                  labelNe: "Matches हेर्नुस्",
                  subEn: "See open roles in KTM",
                  subNe: "काठमाडौंका खुला पदहरू",
                  href: hasResume ? `/matches?skills=${profile!.skills.join(",")}` : "/matches",
                  accent: false,
                },
                {
                  icon: Map,
                  labelEn: "My roadmap",
                  labelNe: "मेरो roadmap",
                  subEn: "Build a learning plan",
                  subNe: "सिकाइ योजना बनाउनुस्",
                  href: hasResume ? `/roadmap?skills=${profile!.skills.join(",")}` : "/roadmap",
                  accent: false,
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-paper-2)] transition-colors"
                >
                  <action.icon
                    size={16}
                    className={
                      action.accent
                        ? "text-[var(--color-accent)] shrink-0"
                        : "text-[var(--color-muted)] shrink-0"
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {lang === "ne" ? action.labelNe : action.labelEn}
                    </p>
                    <p className="mono text-xs text-[var(--color-muted)] mt-0.5">
                      {lang === "ne" ? action.subNe : action.subEn}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors shrink-0"
                  />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── Resume / Skills section ── */}
          <motion.div
            variants={ITEM}
            className="border border-[var(--color-rule)] bg-[var(--color-paper)]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)]">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[var(--color-muted)]" />
                <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                  {lang === "ne" ? "मेरो Resume / Skills" : "My résumé & skills"}
                </p>
              </div>
              <Link href="/upload" className="mono text-xs text-[var(--color-accent)] hover:underline">
                {hasResume
                  ? lang === "ne" ? "अपडेट गर्नुस् →" : "Update →"
                  : lang === "ne" ? "अपलोड गर्नुस् →" : "Upload →"}
              </Link>
            </div>

            <div className="px-6 py-5">
              {profileLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                  <span className="mono text-xs text-[var(--color-muted)]">
                    {lang === "ne" ? "लोड हुँदैछ..." : "Loading…"}
                  </span>
                </div>
              ) : hasResume ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {profile!.skills.map((skill) => (
                      <span
                        key={skill}
                        className="mono text-xs px-2.5 py-1 bg-[var(--color-accent-soft)] text-[var(--color-accent)] rounded-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {profile!.experience_years && (
                    <p className="mono text-xs text-[var(--color-muted)]">
                      {profile!.experience_years}
                      {lang === "ne" ? " वर्षको अनुभव" : " yrs experience detected"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className={`text-sm text-[var(--color-muted)]${lang === "ne" ? " lang-ne" : ""}`}>
                    {lang === "ne"
                      ? "अहिलेसम्म कुनै CV अपलोड भएको छैन।"
                      : "No résumé uploaded yet. Upload your CV to unlock matches and a roadmap."}
                  </p>
                  <Button variant="accent" size="sm" asChild>
                    <Link href="/upload">
                      <Upload size={13} className="mr-1.5" />
                      {lang === "ne" ? "अपलोड गर्नुस्" : "Upload now"}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Roadmap + Matches cards ── */}
          <motion.div
            variants={ITEM}
            className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]"
          >
            {/* Roadmap card */}
            <div className="bg-[var(--color-paper)] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Map size={14} className="text-[var(--color-muted)]" />
                <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                  {lang === "ne" ? "Roadmap" : "Roadmap"}
                </p>
              </div>
              <div className="flex-1">
                <p className={`text-sm text-[var(--color-ink)] font-medium${lang === "ne" ? " lang-ne" : ""}`}>
                  {lang === "ne" ? "12-हप्ते AI सिकाइ योजना" : "12-week AI learning plan"}
                </p>
                <p className={`text-xs text-[var(--color-muted)] mt-1${lang === "ne" ? " lang-ne" : ""}`}>
                  {lang === "ne"
                    ? "तपाईंको skills को आधारमा personalized roadmap।"
                    : "Personalised to your skills and target role."}
                </p>
              </div>
              <Link
                href={hasResume ? `/roadmap?skills=${profile!.skills.join(",")}` : "/upload"}
                className="self-start flex items-center gap-1.5 mono text-xs px-3 py-2 border border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-sm"
              >
                {hasResume
                  ? lang === "ne" ? "roadmap हेर्नुस्" : "View roadmap"
                  : lang === "ne" ? "पहिले CV अपलोड गर्नुस्" : "Upload CV first"}
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Matches card */}
            <div className="bg-[var(--color-paper)] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[var(--color-muted)]" />
                <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                  {lang === "ne" ? "Job Matches" : "Job matches"}
                </p>
              </div>
              <div className="flex-1">
                <p className={`text-sm text-[var(--color-ink)] font-medium${lang === "ne" ? " lang-ne" : ""}`}>
                  {lang === "ne" ? "काठमाडौंका खुला पदहरू" : "Open roles in Kathmandu"}
                </p>
                <p className={`text-xs text-[var(--color-muted)] mt-1${lang === "ne" ? " lang-ne" : ""}`}>
                  {lang === "ne"
                    ? "तपाईंको skills सँग मिल्ने jobs।"
                    : "Jobs ranked by how well they match your skills."}
                </p>
              </div>
              <Link
                href={hasResume ? `/matches?skills=${profile!.skills.join(",")}` : "/matches"}
                className="self-start flex items-center gap-1.5 mono text-xs px-3 py-2 border border-[var(--color-rule-2)] text-[var(--color-accent)] border-[var(--color-accent-soft)] hover:border-[var(--color-accent)] transition-colors rounded-sm"
              >
                {lang === "ne" ? "matches हेर्नुस्" : "View matches"}
                <ChevronRight size={12} />
              </Link>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}
