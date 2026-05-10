'use client';

import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: Props) {
  return (
    <div className={cn('mono text-[11px] tracking-[0.18em] text-[var(--color-accent)]', className)}>
      {children}
    </div>
  );
}
