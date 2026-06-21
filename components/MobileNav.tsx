"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Link = { href: string; label: string };

/**
 * Mobile navigation drawer. Rendered alongside the desktop nav links;
 * Tailwind classes hide one or the other at the `md` breakpoint so there
 * is never any double-rendering. The drawer locks body scroll while open,
 * closes on Escape, on outside tap, and after any link click.
 *
 * Kept deliberately dependency-free — no headless-ui, no portal libraries.
 * The slide-down panel covers the viewport below the sticky header so it
 * never fights with the header for z-index.
 */
export function MobileNav({
  links,
  authenticated,
}: {
  links: readonly Link[];
  authenticated: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-[var(--color-fg)] rounded-md"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          {open ? (
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M3 7h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M3 13h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-[color:var(--color-bg)]/95 backdrop-blur-xl flex flex-col animate-[lml-fade-up_220ms_cubic-bezier(.19,1,.22,1)_both]"
          onClick={(e) => {
            // Close if user taps the empty space outside the link list.
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <nav className="flex flex-col gap-0 px-6 pt-6 pb-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-5 text-[22px] text-[var(--color-fg)] border-b border-[var(--color-border)] active:text-[var(--color-accent)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
            {authenticated ? (
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)] py-3"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)] py-3 inline-block"
              >
                Researcher access →
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
