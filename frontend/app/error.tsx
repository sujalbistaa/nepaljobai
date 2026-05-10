'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to whatever monitoring service you connect later (Sentry, etc.)
    console.error('[NepalJobAI] runtime error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-6">
      <div className="max-w-[520px]">
        <div className="mono mb-4 text-[11px] tracking-[0.18em] text-[var(--color-accent)]">
          → ERROR · 500
        </div>
        <h1 className="mb-4 text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.95] tracking-[-0.035em] text-[var(--color-ink)]">
          Something broke.
          <br />
          <span className="text-[var(--color-muted-2)]">Not your fault.</span>
        </h1>
        <p className="mb-6 max-w-[52ch] text-[15px] leading-[1.5] text-[var(--color-ink-2)]">
          We couldn&apos;t load this page. Try again, or head back to the
          homepage. If this keeps happening, ping us on GitHub.
        </p>
        {error.digest && (
          <p className="mono mb-6 inline-block rounded-[var(--radius-sm)] bg-[var(--color-paper-2)] px-2 py-1 text-[11px] text-[var(--color-muted)]">
            ref: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => reset()} variant="primary" size="md">
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" size="md">
            <Link href="/">
              <Home className="size-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}