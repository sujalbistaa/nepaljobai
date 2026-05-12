"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, ChevronRight, FileText } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useLang } from "@/lib/store";
import { COPY } from "@/lib/constants";
import Button from "@/components/ui/Button";
import TopBar from "@/components/layout/TopBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "FastAPI",
  "SQL", "Git", "Docker", "AWS", "Figma", "Excel", "Node.js",
  "REST APIs", "Linux", "Machine Learning", "Data Analysis",
];

type UploadState = "idle" | "dragging" | "uploading" | "done" | "error";

interface ParsedResult {
  skills: string[];
  experience_years: number | null;
  raw_text: string;
  language_detected: string;
}

export default function UploadPage() {
  const [lang] = useLang();
  const { user } = useUser();

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProgress = async () => {
    if (!user?.id) {
      window.location.href = "/sign-in";
      return;
    }
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setSaveState("saving");
    try {
      // Ensure user exists in DB first (webhook may not have fired in dev)
      await fetch(`${API_BASE}/api/users/ensure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          email,
          first_name: user.firstName ?? null,
          last_name: user.lastName ?? null,
          avatar_url: user.imageUrl ?? null,
        }),
      });

      const res = await fetch(`${API_BASE}/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, experience_years: parsed?.experience_years ?? null }),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setUploadState("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", f);
    if (user?.id) formData.append("clerk_id", user.id);

    try {
      const res = await fetch(`${API_BASE}/api/upload_resume`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail ?? `Server error: ${res.status}`);
      }

      const data: ParsedResult = await res.json();
      setParsed(data);
      setSkills(data.skills);
      setUploadState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  }, [user]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setUploadState("idle");
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("dragging");
  };

  const onDragLeave = () => {
    if (uploadState === "dragging") setUploadState("idle");
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const reset = () => {
    setUploadState("idle");
    setFile(null);
    setParsed(null);
    setSkills([]);
    setNewSkill("");
    setError("");
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[var(--color-paper)] px-5 py-16 sm:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">
              {lang === "ne" ? "चरण १ / ३" : "Step 1 of 3"}
            </p>
            <h1 className={`text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-ink)] leading-tight${lang === "ne" ? " lang-ne" : ""}`}>
              {lang === "ne" ? "आफ्नो CV अपलोड गर्नुस्" : "Upload your résumé"}
            </h1>
            <p className={`mt-3 text-[var(--color-muted)] text-base leading-relaxed${lang === "ne" ? " lang-ne" : ""}`}>
              {lang === "ne"
                ? "PDF अपलोड गर्नुस् — हामी AI ले skills निकाल्छौं।"
                : "Upload a PDF — we'll extract your skills with AI."}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ── IDLE / DRAGGING ── */}
            {(uploadState === "idle" || uploadState === "dragging") && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-sm cursor-pointer
                    flex flex-col items-center justify-center gap-4
                    px-8 py-16 transition-colors duration-150
                    ${uploadState === "dragging"
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-rule-2)] hover:border-[var(--color-accent)] bg-[var(--color-paper-2)]"
                    }
                  `}
                >
                  <Upload
                    size={32}
                    className={uploadState === "dragging"
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-muted)]"}
                  />
                  <div className="text-center">
                    <p className={`font-medium text-[var(--color-ink)]${lang === "ne" ? " lang-ne" : ""}`}>
                      {lang === "ne" ? "यहाँ छोड्नुस् वा क्लिक गर्नुस्" : "Drop here or click to browse"}
                    </p>
                    <p className="mono text-xs text-[var(--color-muted)] mt-1">
                      PDF only — max 10MB
                    </p>
                  </div>
                  <span className="mono text-[0.65rem] tracking-wider px-2 py-1 border border-[var(--color-rule)] text-[var(--color-muted)] rounded-sm">
                    PDF
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={onFileInput}
                  className="hidden"
                />

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-[var(--color-rule)]" />
                  <span className="mono text-xs text-[var(--color-muted)] tracking-widest uppercase">
                    {lang === "ne" ? "वा छिटो परीक्षण" : "or quick test"}
                  </span>
                  <div className="flex-1 h-px bg-[var(--color-rule)]" />
                </div>

                {/* Quick skill chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Python + Git", skills: ["Python", "Git", "SQL"] },
                    { label: "React + TS", skills: ["React", "TypeScript", "JavaScript"] },
                    { label: "SQL + Excel", skills: ["SQL", "Excel", "Data Analysis"] },
                    { label: "Figma + Design", skills: ["Figma", "Adobe XD", "Prototyping"] },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setSkills(preset.skills);
                        setParsed({
                          skills: preset.skills,
                          experience_years: 1,
                          raw_text: `Quick test: ${preset.skills.join(", ")}`,
                          language_detected: "en",
                        });
                        setUploadState("done");
                      }}
                      className="mono text-xs px-3 py-1.5 border border-[var(--color-rule)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-sm"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── UPLOADING ── */}
            {uploadState === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-10 flex flex-col items-center gap-4"
              >
                <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className={`mono text-sm text-[var(--color-muted)] tracking-wide${lang === "ne" ? " lang-ne" : ""}`}>
                    {lang === "ne" ? "AI ले CV पढ्दै छ..." : "AI is reading your CV..."}
                  </p>
                  <p className="mono text-xs text-[var(--color-muted-2)] mt-1">
                    {lang === "ne" ? "१०-२० सेकेन्ड लाग्न सक्छ" : "This takes 10–20 seconds"}
                  </p>
                </div>
                {file && (
                  <p className="mono text-xs text-[var(--color-muted-2)]">
                    {file.name}
                  </p>
                )}
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {uploadState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-8 flex flex-col gap-4"
              >
                <p className="text-[var(--color-ochre-deep)] font-medium text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={reset}>
                  {lang === "ne" ? "फेरि प्रयास गर्नुस्" : "Try again"}
                </Button>
              </motion.div>
            )}

            {/* ── DONE — skill chip editor ── */}
            {uploadState === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6"
              >
                {/* File info bar */}
                {file && (
                  <div className="flex items-center gap-3 border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3">
                    <FileText size={16} className="text-[var(--color-accent)] shrink-0" />
                    <span className="text-sm text-[var(--color-ink)] flex-1 truncate">{file.name}</span>
                    <button onClick={reset} className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* AI parsed notice */}
                {parsed && file && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-soft)] border border-[var(--color-accent-soft)] rounded-sm">
                    <span className="text-[var(--color-accent)] text-xs">✓</span>
                    <p className={`text-xs text-[var(--color-accent)]${lang === "ne" ? " lang-ne" : ""}`}>
                      {lang === "ne"
                        ? `AI ले ${skills.length} skills निकाल्यो — हेर्नुस् र सम्पादन गर्नुस्`
                        : `AI extracted ${skills.length} skills — review and edit below`}
                    </p>
                  </div>
                )}

                {/* Detected skills */}
                <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                      {lang === "ne" ? "पहिचान गरिएका skills" : "Detected skills"}
                    </p>
                    <span className="mono text-xs text-[var(--color-accent)] tabular">
                      {skills.length} {lang === "ne" ? "skills" : "skills"}
                    </span>
                  </div>

                  {/* Skill chips */}
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {skills.map((skill) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 bg-[var(--color-accent-soft)] text-[var(--color-accent)] mono text-xs px-2.5 py-1 rounded-sm"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add skill input */}
                  <div className="flex items-center gap-2 border-t border-[var(--color-rule)] pt-4">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={lang === "ne" ? "skill थप्नुस्..." : "Add a skill..."}
                      className={`flex-1 bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none${lang === "ne" ? " lang-ne" : ""}`}
                    />
                    <button
                      onClick={() => addSkill(newSkill)}
                      disabled={!newSkill.trim()}
                      className="text-[var(--color-accent)] disabled:opacity-30 transition-opacity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="flex flex-col gap-2">
                  <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                    {lang === "ne" ? "सुझाव" : "Suggestions"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                      <button
                        key={s}
                        onClick={() => addSkill(s)}
                        className="mono text-xs px-2.5 py-1 border border-[var(--color-rule)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-sm"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience row */}
                {parsed?.experience_years && (
                  <div className="flex items-center gap-3 border border-[var(--color-rule)] px-4 py-3">
                    <span className={`text-sm text-[var(--color-muted)]${lang === "ne" ? " lang-ne" : ""}`}>
                      {lang === "ne" ? "अनुभव पहिचान" : "Experience detected"}
                    </span>
                    <span className="mono text-sm tabular text-[var(--color-ink)] font-medium">
                      {parsed.experience_years} {lang === "ne" ? "वर्ष" : "yrs"}
                    </span>
                  </div>
                )}

                {/* Language detected */}
                {parsed?.language_detected === "ne" && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-sm">
                    <p className="text-xs text-[var(--color-muted)] lang-ne">
                      नेपाली CV पहिचान गरियो ✓
                    </p>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={reset}
                    className={`text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors${lang === "ne" ? " lang-ne" : ""}`}
                  >
                    {lang === "ne" ? "← फेरि अपलोड गर्नुस्" : "← Re-upload"}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveProgress}
                      disabled={skills.length === 0 || saveState === "saving"}
                      className={`mono text-xs px-3 py-2 border rounded-sm transition-colors disabled:opacity-40
                        ${saveState === "saved"
                          ? "border-green-400 text-green-600"
                          : saveState === "error"
                          ? "border-red-300 text-red-500"
                          : "border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        }`}
                    >
                      {saveState === "saving"
                        ? lang === "ne" ? "सेव हुँदैछ..." : "Saving..."
                        : saveState === "saved"
                        ? lang === "ne" ? "सेव भयो ✓" : "Saved ✓"
                        : saveState === "error"
                        ? lang === "ne" ? "सेव भएन" : "Save failed"
                        : lang === "ne" ? "progress सेव गर्नुस्" : "Save my progress"}
                    </button>

                    <Button
                      variant="accent"
                      size="lg"
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set("skills", skills.join(","));
                        window.location.href = `/matches?${params.toString()}`;
                      }}
                      disabled={skills.length === 0}
                    >
                      <span className={lang === "ne" ? "lang-ne" : ""}>
                        {lang === "ne" ? "matches हेर्नुस्" : "Find my matches"}
                      </span>
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </>
  );
}