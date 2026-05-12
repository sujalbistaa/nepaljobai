import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      {/* Left bar */}
      <rect x="5"  y="5"  width="7" height="26" fill="currentColor" />
      {/* Staircase — 3 thin steps (4 px each), each touching the next */}
      <rect x="12" y="5"  width="4" height="9"  fill="currentColor" />
      <rect x="16" y="14" width="4" height="9"  fill="currentColor" />
      <rect x="20" y="23" width="4" height="8"  fill="currentColor" />
      {/* Right bar */}
      <rect x="24" y="5"  width="7" height="26" fill="currentColor" />
    </svg>
  );
}
