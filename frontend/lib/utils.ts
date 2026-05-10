import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names. Used by every component.
 * Combines clsx (conditional classes) with tailwind-merge (deduping).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Nepali Rupees. Always shows रू prefix.
 * Examples:
 *   formatNPR(45000)         → "रू 45,000"
 *   formatNPR(45000, 60000)  → "रू 45,000–60,000"
 *   formatNPR(38000, null, { compact: true }) → "रू 38K"
 */
export function formatNPR(
  min: number,
  max?: number | null,
  opts: { compact?: boolean; symbol?: boolean } = {},
): string {
  const { compact = false, symbol = true } = opts;
  const sym = symbol ? 'रू ' : '';

  const fmt = (n: number) => {
    if (compact) {
      if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      return `${n}`;
    }
    return n.toLocaleString('en-IN');
  };

  if (max != null && max !== min) return `${sym}${fmt(min)}–${fmt(max)}`;
  return `${sym}${fmt(min)}`;
}

/** Relative time, "2 days ago" / "just now" */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Clamp a number between bounds. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}