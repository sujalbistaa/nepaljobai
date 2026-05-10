import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-6">
      <div className="max-w-[520px]">
        <div className="mono mb-4 text-[11px] tracking-[0.18em] text-[var(--color-accent)]">
          → 404 · NOT FOUND
        </div>
        <h1 className="mb-4 text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.95] tracking-[-0.035em] text-[var(--color-ink)]">
          This page
          <br />
          <span className="text-[var(--color-muted-2)]">doesn&apos;t exist.</span>
        </h1>
        <p className="mb-6 max-w-[52ch] text-[15px] leading-[1.5] text-[var(--color-ink-2)]">
          The link you followed might be broken, or the page may have been
          moved. Head back home and try again.
        </p>
        <Button asChild variant="primary" size="md">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}