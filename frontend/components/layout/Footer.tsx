import Link from "next/link";
import { SITE } from "@/lib/constants";
import { LogoMark } from "@/components/ui/LogoMark";

const LINKS = {
  product: [
    { label: "Upload Resume", href: "/upload" },
    { label: "Job Matches", href: "/matches" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  for: [
    { label: "Fresh Graduates", href: "/#for-who" },
    { label: "Students", href: "/#for-who" },
    { label: "Startups", href: "/#startups" },
  ],
  oss: [
    { label: "GitHub", href: SITE.github, external: true },
    { label: "Sign In", href: "/sign-in" },
    { label: "Sign Up", href: "/sign-up" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-rule)] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between mb-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LogoMark size={24} className="text-[var(--color-ink)]" />
              <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
                {SITE.name}
              </span>
            </div>
            <p className="max-w-[18rem] text-xs leading-relaxed text-[var(--color-muted)]">
              {SITE.tagline}
            </p>
          </div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--color-muted)] sm:pt-1">
            Built in {SITE.builtIn} · {SITE.hackathon}
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
          {(["product", "for", "oss"] as const).map((col) => (
            <div key={col} className="flex flex-col gap-3">
              <p className="mono text-[0.65rem] uppercase tracking-widest text-[var(--color-muted)]">
                {col === "product" ? "Product" : col === "for" ? "For" : "Open Source"}
              </p>
              <ul className="flex flex-col gap-2">
                {LINKS[col].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      target={"external" in l && l.external ? "_blank" : undefined}
                      rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-[var(--color-muted)] transition-colors duration-150 hover:text-[var(--color-ink)]"
                    >
                      {l.label}
                      {"external" in l && l.external && (
                        <span className="mono ml-1 text-[0.6rem] opacity-50">↗</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--color-rule)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-muted)]">
            © 2026 {SITE.name}. Built for Nepali youth.
          </p>
          <p className="mono text-[0.65rem] uppercase tracking-widest text-[var(--color-muted)]">
            KTM · 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
