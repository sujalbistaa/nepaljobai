"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Plus, LogOut, Camera, User } from "lucide-react";
import { useLang } from "@/lib/store";
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

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [lang] = useLang();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

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
      .then(() => fetch(`${API_BASE}/api/profile/${user.id}`))
      .then((r) => {
        if (!r.ok) return { skills: [], experience_years: null };
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data.skills)) setSkills(data.skills);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setPhotoUploading(true);
    setPhotoError("");
    try {
      await user.setProfileImage({ file });
      await user.reload();
    } catch {
      setPhotoError(lang === "ne" ? "फोटो अपलोड भएन" : "Photo upload failed");
    } finally {
      setPhotoUploading(false);
      // Reset input so same file can be re-selected
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s));

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((p) => [...p, trimmed]);
    }
    setNewSkill("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API_BASE}/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError(lang === "ne" ? "सेव भएन, फेरि प्रयास गर्नुस्" : "Save failed — try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[var(--color-paper)] px-5 py-16 sm:px-8 lg:px-16">
        <div className="max-w-xl mx-auto">
          <motion.div
            variants={STAGGER}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8"
          >
            {/* ── Header with photo upload ── */}
            <motion.div variants={ITEM}>
              <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-5">
                {lang === "ne" ? "प्रोफाइल" : "Profile"}
              </p>

              <div className="flex items-center gap-5">
                {/* Avatar with upload overlay */}
                <div className="relative shrink-0 group">
                  <div className="w-20 h-20 rounded-sm overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                    {photoUploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={28} className="text-[var(--color-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-sm bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                    aria-label="Change photo"
                  >
                    <Camera size={18} className="text-white" />
                  </button>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                {/* Name + email + photo hint */}
                <div className="flex-1 min-w-0">
                  <h1 className={`text-2xl font-semibold text-[var(--color-ink)] tracking-tight${lang === "ne" ? " lang-ne" : ""}`}>
                    {user?.fullName ?? (lang === "ne" ? "तपाईंको नाम" : "Your name")}
                  </h1>
                  <p className="mono text-xs text-[var(--color-muted)] mt-0.5 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="mono text-xs text-[var(--color-accent)] hover:underline mt-1.5 disabled:opacity-40"
                  >
                    {photoUploading
                      ? lang === "ne" ? "अपलोड हुँदैछ..." : "Uploading..."
                      : lang === "ne" ? "फोटो बदल्नुस्" : "Change photo"}
                  </button>
                  {photoError && (
                    <p className="mono text-xs text-red-500 mt-1">{photoError}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Skills editor ── */}
            <motion.div
              variants={ITEM}
              className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <p className="mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
                  {lang === "ne" ? "मेरा skills" : "My skills"}
                </p>
                <span className="mono text-xs text-[var(--color-accent)] tabular">
                  {loading ? "..." : skills.length}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                  <span className="mono text-xs text-[var(--color-muted)]">
                    {lang === "ne" ? "लोड हुँदैछ..." : "Loading..."}
                  </span>
                </div>
              ) : skills.length === 0 ? (
                <p className={`text-sm text-[var(--color-muted)]${lang === "ne" ? " lang-ne" : ""}`}>
                  {lang === "ne"
                    ? "अहिलेसम्म कुनै skill सेव भएको छैन। CV अपलोड गर्नुस्।"
                    : "No skills saved yet. Upload your résumé to get started."}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <motion.span
                      key={s}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="flex items-center gap-1.5 bg-[var(--color-accent-soft)] text-[var(--color-accent)] mono text-xs px-2.5 py-1 rounded-sm"
                    >
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

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
            </motion.div>

            {/* ── Save row ── */}
            <motion.div variants={ITEM} className="flex items-center justify-between">
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="flex items-center gap-1.5 mono text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
              >
                <LogOut size={12} />
                {lang === "ne" ? "साइन आउट" : "Sign out"}
              </button>

              <div className="flex flex-col items-end gap-1">
                {saveError && (
                  <p className="mono text-xs text-red-500">{saveError}</p>
                )}
                <Button
                  variant="accent"
                  size="md"
                  onClick={handleSave}
                  disabled={saving || loading}
                >
                  <span className={lang === "ne" ? "lang-ne" : ""}>
                    {saving
                      ? lang === "ne" ? "सेव गर्दै..." : "Saving..."
                      : saved
                      ? lang === "ne" ? "सेव भयो ✓" : "Saved ✓"
                      : lang === "ne" ? "सेव गर्नुस्" : "Save profile"}
                  </span>
                </Button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </>
  );
}
