'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useLang } from '@/lib/store';
import { COPY, SITE } from '@/lib/constants';
import { LanguageToggle } from './LanguageToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { useGuruChat } from '@/lib/store';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

const NAV_LINKS = [
  { key: 'jobs' as const, href: '/matches' },
  { key: 'how' as const, href: '/#how-it-works' },
  { key: 'startups' as const, href: '/#for-startups' },
];

function NavLogoMark() {
  return (
    <LogoMark
      size={40}
      className={cn(
        'text-[var(--color-ink)]',
        'transition duration-300 ease-out will-change-transform',
        'group-hover:scale-[1.08]',
      )}
    />
  );
}

function LogoWordmark() {
  return (
    <span className="flex items-baseline leading-none select-none" aria-hidden="true">
      <span className="text-[17px] font-[500] tracking-[-0.03em] text-[var(--color-ink)]">
        Nepal
      </span>
      <span className="text-[17px] font-[700] tracking-[-0.03em] text-[var(--color-ink)]">
        Job
      </span>
      <span
        className="text-[17px] font-[700] tracking-[-0.03em]"
        style={{ color: 'oklch(0.50 0.12 200)' }}
      >
        AI
      </span>
    </span>
  );
}

export default function TopBar() {
  const [lang] = useLang();
  const t = COPY[lang].nav;
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isOpen: isChatOpen, toggle: toggleChat } = useGuruChat();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'bg-[var(--color-paper-glass)] backdrop-blur-[18px]',
        'border-b border-[var(--color-rule-glass)]',
        'shadow-[0_1px_10px_rgba(0,0,0,0.06)]',
      )}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 md:px-10">

        {/* ── Logo ── */}
        <Link
          href="/"
          className={cn(
            'group flex items-center gap-3',
            'rounded-[var(--radius-sm)] outline-none',
            'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
          )}
          aria-label={SITE.name}
        >
          <NavLogoMark />
          <LogoWordmark />
        </Link>

        {/* ── Navigation ── */}
        <nav className="flex items-center gap-7" aria-label="Primary navigation">
          {NAV_LINKS.filter(({ key }) => !(isSignedIn && (key === 'how' || key === 'startups'))).map(({ key, href }) => {
            const isHash = href.startsWith('/#');
            const isActive = !isHash && (pathname === href || pathname.startsWith(href + '/'));
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'hidden cursor-pointer text-[14px] transition-colors duration-150 md:inline-block',
                  'hover:text-[var(--color-ink)]',
                  lang === 'ne' && 'lang-ne',
                  isActive
                    ? 'font-medium text-[var(--color-ink)]'
                    : 'text-[var(--color-muted)]',
                )}
              >
                {t[key]}
              </Link>
            );
          })}

          {isSignedIn && (
            <Link
              href="/roadmap"
              className={cn(
                'hidden cursor-pointer text-[14px] transition-colors duration-150 md:inline-block',
                'hover:text-[var(--color-ink)]',
                lang === 'ne' && 'lang-ne',
                pathname === '/roadmap'
                  ? 'font-medium text-[var(--color-ink)]'
                  : 'text-[var(--color-muted)]',
              )}
            >
              {lang === 'ne' ? 'Roadmap' : 'Roadmap'}
            </Link>
          )}

          {/* Guru chat trigger — only for signed-in users */}
          {isSignedIn && (
            <button
              onClick={toggleChat}
              aria-label="Open Guru career advisor"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border transition-all duration-150',
                isChatOpen
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-rule-2)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              )}
            >
              <GraduationCap size={14} />
              <span className="hidden text-[13px] font-medium md:inline">Guru</span>
            </button>
          )}

          <LanguageToggle />

          {isSignedIn && (
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className={cn(
                'relative flex shrink-0 items-center justify-center',
                'h-8 w-8 rounded-full overflow-hidden',
                'ring-2 ring-transparent transition-all duration-200',
                'hover:ring-[var(--color-accent)] hover:scale-105',
                pathname === '/dashboard' && 'ring-[var(--color-accent)]',
              )}
            >
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName ?? 'Profile'}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[var(--color-accent)] text-[11px] font-semibold text-white">
                  {user?.firstName?.[0] ?? '?'}
                </span>
              )}
            </Link>
          )}

          {isSignedIn ? (
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className={cn(
                'inline-flex cursor-pointer items-center rounded-[var(--radius-sm)] border px-4 py-2 text-[14px] font-medium transition-all duration-150',
                'border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50',
                lang === 'ne' && 'lang-ne',
              )}
            >
              {t.signout}
            </button>
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                'inline-flex cursor-pointer items-center rounded-[var(--radius-sm)] border px-4 py-2 text-[14px] font-medium transition-all duration-150',
                lang === 'ne' && 'lang-ne',
                pathname === '/sign-in'
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'border-[var(--color-rule-2)] text-[var(--color-ink)] hover:border-[var(--color-ink)] hover:bg-[var(--color-paper-2)]',
              )}
            >
              {t.signin}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
