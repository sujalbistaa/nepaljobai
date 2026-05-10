export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
      <div className="flex flex-col items-center gap-4">
        <div
          aria-hidden
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-rule-2)] border-t-[var(--color-accent)]"
        />
        <div className="mono text-[11px] tracking-[0.16em] text-[var(--color-muted)]">
          LOADING
        </div>
      </div>
    </main>
  );
}